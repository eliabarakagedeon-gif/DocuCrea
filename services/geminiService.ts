import { GoogleGenAI, Modality } from "@google/genai";

// Helper to decode base64 audio
const decodeAudio = (base64String: string) => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper to convert Blob URL to Base64
export const blobUrlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data:image/xyz;base64, header
      resolve(base64.split(',')[1]); 
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

class GeminiService {
  public ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Re-initialize for API key updates (e.g. after user selects a paid key)
  reinitialize() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // Generate the narrative script based on context and template
  async generateScript(templateName: string, context: string): Promise<string> {
    const prompt = `
      Agis comme un réalisateur de documentaires professionnel.
      Je veux créer une courte vidéo basée sur le template : "${templateName}".
      
      Voici les éléments de contexte fournis par l'utilisateur : 
      "${context}"
      
      Rédige un script narratif (voix-off) engageant, émotionnel et structuré.
      Le script doit durer environ 30 à 60 secondes à l'oral.
      N'inclus pas de didascalies techniques (comme [Plan large], [Musique]), donne uniquement le texte à lire par la voix-off.
      Le ton doit être adapté au template.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || "Désolé, je n'ai pas pu générer le script.";
    } catch (error) {
      console.error("Error generating script:", error);
      throw error;
    }
  }

  // Generate Audio from text using Gemini TTS
  async generateVoiceover(text: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: `Lis ce texte de manière naturelle et engageante pour un documentaire : ${text}`,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!base64Audio) {
        throw new Error("No audio data received");
      }

      const audioBytes = decodeAudio(base64Audio);
      const blob = new Blob([audioBytes], { type: 'audio/wav' }); 
      
      return URL.createObjectURL(blob);

    } catch (error) {
      console.error("Error generating voiceover:", error);
      throw error;
    }
  }

  // Generate Image (Gemini 3 Pro Image)
  async generateImage(prompt: string, size: '1K' | '2K' | '4K'): Promise<string> {
    try {
      // Re-init to ensure we have the latest key if selected via UI
      this.reinitialize();
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: { imageSize: size, aspectRatio: '16:9' }
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image generated");
    } catch (error) {
      console.error("Error generating image:", error);
      throw error;
    }
  }

  // Edit Image (Gemini 2.5 Flash Image)
  async editImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/png', data: imageBase64 } },
            { text: prompt }
          ]
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No edited image returned");
    } catch (error) {
      console.error("Error editing image:", error);
      throw error;
    }
  }

  // Generate Video (Veo)
  async generateVideo(imageBase64: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string> {
    try {
      // Re-init to ensure we have the latest key if selected via UI
      this.reinitialize();
      
      let operation = await this.ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt, 
        image: {
          imageBytes: imageBase64,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      // Poll for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
        operation = await this.ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("No video URI in response");

      // Fetch the actual video bytes using the API Key
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);

    } catch (error) {
      console.error("Error generating video with Veo:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();