import React, { useState, useEffect, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { TEMPLATES } from '../constants';
import { geminiService, blobUrlToBase64 } from '../services/geminiService';
import { Upload, Wand2, Play, Pause, Mic, Film, Sparkles, Download, Image as ImageIcon, Video, Palette, MessageSquare, Key } from 'lucide-react';
import { MediaItem } from '../types';
import { LiveServerMessage, Modality } from '@google/genai';
import { useLanguage } from '../context/LanguageContext';

type EditorTab = 'media' | 'magic' | 'story' | 'audio' | 'preview' | 'live';

const Editor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { getProject, updateProject } = useProject();
  const { t, language } = useLanguage();
  const project = projectId ? getProject(projectId) : undefined;
  
  const [activeTab, setActiveTab] = useState<EditorTab>('media');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Magic Tools State
  const [magicPrompt, setMagicPrompt] = useState('');
  const [magicImageSize, setMagicImageSize] = useState<'1K'|'2K'|'4K'>('1K');
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [isMagicProcessing, setIsMagicProcessing] = useState(false);
  const [magicMode, setMagicMode] = useState<'generate' | 'edit' | 'animate'>('generate');

  // Live API State
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null); // Keep session ref

  // Preview State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previewInterval = useRef<number | null>(null);

  if (!project) return <Navigate to="/" />;

  const template = TEMPLATES.find(t => t.id === project.templateId);

  // --- Helpers for API Key ---
  const ensurePaidKey = async () => {
    // Cast window to any to avoid TypeScript conflicts with global declarations
    const win = window as any;
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await win.aistudio.openSelectKey();
        // Assume success and re-init service to pick up new env var if injected
        geminiService.reinitialize();
      }
    }
  };

  // --- Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newMedia: MediaItem[] = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' : 'image',
        name: file.name
      }));
      updateProject(project.id, { media: [...project.media, ...newMedia] });
    }
  };

  const handleGenerateScript = async () => {
    if (!project.storyContext) return;
    setIsGeneratingScript(true);
    try {
      // Pass language to ensure script is in correct language
      const scriptPrompt = language === 'en' 
        ? `Act as a professional documentary director. I want to create a video based on the template: "${template?.name}". Context: "${project.storyContext}". Write an engaging voiceover script.`
        : project.storyContext; // Default uses the French method inside service, but ideally we should pass lang to service
      
      const script = await geminiService.generateScript(template?.name || 'Documentaire', scriptPrompt);
      updateProject(project.id, { script });
      setActiveTab('audio');
    } catch (err) {
      alert("Erreur lors de la génération du script.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateVoiceover = async () => {
    if (!project.script) return;
    setIsGeneratingAudio(true);
    try {
      const audioUrl = await geminiService.generateVoiceover(project.script);
      updateProject(project.id, { audioUrl });
      setActiveTab('preview');
    } catch (err) {
      alert("Erreur lors de la synthèse vocale.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // --- Magic Tools Handlers ---

  const handleMagicAction = async () => {
    if (!magicPrompt) return;
    setIsMagicProcessing(true);

    try {
      if (magicMode === 'generate') {
        // High quality generation requires paid key check
        if (magicImageSize !== '1K') await ensurePaidKey();
        
        const imageUrl = await geminiService.generateImage(magicPrompt, magicImageSize);
        const newMedia: MediaItem = {
          id: Date.now().toString(),
          url: imageUrl,
          type: 'image',
          name: `Generated: ${magicPrompt.slice(0,10)}...`
        };
        updateProject(project.id, { media: [...project.media, newMedia] });
        setMagicPrompt('');
      } 
      else if (magicMode === 'edit' && selectedMediaId) {
        const media = project.media.find(m => m.id === selectedMediaId);
        if (media && media.type === 'image') {
          const base64 = await blobUrlToBase64(media.url);
          const editedUrl = await geminiService.editImage(base64, magicPrompt);
          const newMedia: MediaItem = {
            id: Date.now().toString(),
            url: editedUrl,
            type: 'image',
            name: `Edited: ${media.name}`
          };
          updateProject(project.id, { media: [...project.media, newMedia] });
          setMagicPrompt('');
        }
      } 
      else if (magicMode === 'animate' && selectedMediaId) {
        // Veo requires paid key
        await ensurePaidKey();
        
        const media = project.media.find(m => m.id === selectedMediaId);
        if (media && media.type === 'image') {
           const base64 = await blobUrlToBase64(media.url);
           // Defaulting to 16:9 for this app
           const videoUrl = await geminiService.generateVideo(base64, magicPrompt || "Animate this image naturally", '16:9');
           const newMedia: MediaItem = {
            id: Date.now().toString(),
            url: videoUrl,
            type: 'video',
            name: `Veo: ${media.name}`
          };
          updateProject(project.id, { media: [...project.media, newMedia] });
          setMagicPrompt('');
        }
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue lors du traitement IA. Vérifiez votre clé API ou le format de l'image.");
    } finally {
      setIsMagicProcessing(false);
    }
  };

  // --- Live API Handlers ---
  
  const toggleLiveSession = async () => {
    if (isLiveConnected) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsLiveConnected(false);
      setLiveTranscript(t.editor.live.disconnected);
    } else {
      // Connect
      try {
        setLiveTranscript(t.editor.live.listening);
        await startLiveSession();
        setIsLiveConnected(true);
      } catch (e) {
        console.error(e);
        setLiveTranscript(t.editor.live.error);
        setIsLiveConnected(false);
      }
    }
  };

  const startLiveSession = async () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
    const outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
    audioContextRef.current = inputAudioContext; // Track to close later

    // Input Setup
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const inputSource = inputAudioContext.createMediaStreamSource(stream);
    const processor = inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    // Output Setup
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);
    
    // Sync vars
    let nextStartTime = 0;

    // Helper: PCM blob
    const createBlob = (data: Float32Array) => {
      const l = data.length;
      const int16 = new Int16Array(l);
      for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
      }
      // Simple PCM encoding without headers
      let binary = '';
      const len = int16.buffer.byteLength;
      const bytes = new Uint8Array(int16.buffer);
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const b64 = btoa(binary);
      
      return {
        data: b64,
        mimeType: 'audio/pcm;rate=16000',
      };
    };

    // Helper: Decode
    const decodeAudioData = async (base64: string, ctx: AudioContext) => {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for(let i=0; i<channelData.length; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }
      return buffer;
    };

    const sessionPromise = geminiService.ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          setLiveTranscript(t.editor.live.connected);
          // Stream audio from the microphone to the model.
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const blob = createBlob(inputData);
            sessionPromise.then(session => {
              session.sendRealtimeInput({ media: blob });
            });
          };
          inputSource.connect(processor);
          processor.connect(inputAudioContext.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          // Handle Audio
          const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audioData) {
            const buffer = await decodeAudioData(audioData, outputAudioContext);
            const source = outputAudioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            
            nextStartTime = Math.max(outputAudioContext.currentTime, nextStartTime);
            source.start(nextStartTime);
            nextStartTime += buffer.duration;
          }
          if (msg.serverContent?.interrupted) {
            nextStartTime = 0; 
          }
        },
        onclose: () => {
          setIsLiveConnected(false);
          setLiveTranscript(t.editor.live.disconnected);
        },
        onerror: (e) => {
          console.error(e);
          setLiveTranscript(t.editor.live.error);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: language === 'en' 
          ? "You are an expert documentary director assistant. Help the user create their story. Be brief, encouraging and creative." 
          : "Tu es un assistant réalisateur expert. Aide l'utilisateur à créer son documentaire. Sois bref, encourageant et créatif."
      }
    });

    liveSessionRef.current = sessionPromise;
  };

  // --- Preview & Utilities ---

  const togglePreview = () => {
    if (isPlaying) {
      pausePreview();
    } else {
      playPreview();
    }
  };

  const playPreview = () => {
    if(!project.media.length) return;
    setIsPlaying(true);
    if (audioRef.current && project.audioUrl) {
      audioRef.current.play();
    }
    const slideDuration = 3000; 
    previewInterval.current = window.setInterval(() => {
      setCurrentSlideIndex(prev => {
        const next = prev + 1;
        if (next >= project.media.length) {
            pausePreview();
            return 0;
        }
        return next;
      });
    }, slideDuration);
  };

  const pausePreview = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (previewInterval.current) {
      clearInterval(previewInterval.current);
    }
  };

  useEffect(() => {
    return () => {
      if (previewInterval.current) clearInterval(previewInterval.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
      
      {/* Sidebar Navigation */}
      <aside className="w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6 gap-8 overflow-y-auto">
        <NavButton icon={<Film />} label={t.editor.tabs.media} active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
        <NavButton icon={<Sparkles />} label={t.editor.tabs.magic} active={activeTab === 'magic'} onClick={() => setActiveTab('magic')} />
        <NavButton icon={<MessageSquare />} label={t.editor.tabs.assistant} active={activeTab === 'live'} onClick={() => setActiveTab('live')} />
        <NavButton icon={<Wand2 />} label={t.editor.tabs.story} active={activeTab === 'story'} onClick={() => setActiveTab('story')} />
        <NavButton icon={<Mic />} label={t.editor.tabs.audio} active={activeTab === 'audio'} onClick={() => setActiveTab('audio')} />
        <NavButton icon={<Play />} label={t.editor.tabs.preview} active={activeTab === 'preview'} onClick={() => setActiveTab('preview')} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col md:flex-row h-full">
        
        {/* Editor Panel */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-r border-slate-800 relative bg-slate-950">
          
          <div className="max-w-3xl mx-auto pb-24">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                <p className="text-sm text-slate-400">{template?.name} • {project.media.length} files</p>
              </div>
              <div className="px-3 py-1 bg-slate-800 rounded text-xs text-slate-300">
                Auto-save
              </div>
            </div>

            {/* TAB: MEDIA */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                  <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <Upload className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-300 font-medium">Drag & Drop media here</p>
                </div>
                {/* Media Grid */}
                {project.media.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {project.media.map((media, idx) => (
                      <div key={media.id} className="aspect-square bg-slate-800 rounded-lg overflow-hidden relative group">
                        {media.type === 'video' ? (
                          <video src={media.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={media.url} alt={media.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: MAGIC TOOLS (NEW) */}
            {activeTab === 'magic' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-1 mb-6 flex gap-1">
                   <button 
                    onClick={() => setMagicMode('generate')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${magicMode === 'generate' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                   >
                     <ImageIcon className="w-4 h-4 inline mr-2" /> {t.editor.magic.generate}
                   </button>
                   <button 
                    onClick={() => setMagicMode('edit')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${magicMode === 'edit' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                   >
                     <Palette className="w-4 h-4 inline mr-2" /> {t.editor.magic.edit}
                   </button>
                   <button 
                    onClick={() => setMagicMode('animate')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${magicMode === 'animate' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                   >
                     <Video className="w-4 h-4 inline mr-2" /> {t.editor.magic.animate}
                   </button>
                </div>

                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                   {/* Context specific UI */}
                   {magicMode === 'generate' && (
                     <>
                        <h3 className="font-semibold text-white mb-2">{t.editor.magic.genTitle}</h3>
                        <p className="text-xs text-slate-400 mb-4">{t.editor.magic.genDesc}</p>
                        
                        <div className="flex gap-2 mb-4">
                          {['1K', '2K', '4K'].map(size => (
                             <button 
                              key={size}
                              onClick={() => setMagicImageSize(size as any)}
                              className={`px-3 py-1 rounded text-xs border ${magicImageSize === size ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-slate-700 text-slate-400'}`}
                             >
                               {size}
                             </button>
                          ))}
                        </div>
                     </>
                   )}

                   {magicMode === 'edit' && (
                     <>
                        <h3 className="font-semibold text-white mb-2">{t.editor.magic.editTitle}</h3>
                        <p className="text-xs text-slate-400 mb-4">{t.editor.magic.editDesc}</p>
                        
                        {/* Mini Gallery Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                           {project.media.filter(m => m.type === 'image').map(m => (
                             <div 
                              key={m.id} 
                              onClick={() => setSelectedMediaId(m.id)}
                              className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${selectedMediaId === m.id ? 'border-purple-500' : 'border-transparent'}`}
                             >
                               <img src={m.url} className="w-full h-full object-cover" />
                             </div>
                           ))}
                        </div>
                     </>
                   )}

                    {magicMode === 'animate' && (
                     <>
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                           {t.editor.magic.animTitle} <span className="text-xs px-1.5 py-0.5 bg-yellow-600/20 text-yellow-500 rounded border border-yellow-600/30">PREMIUM</span>
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">{t.editor.magic.animDesc}</p>
                        
                        {/* Mini Gallery Selector */}
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                           {project.media.filter(m => m.type === 'image').map(m => (
                             <div 
                              key={m.id} 
                              onClick={() => setSelectedMediaId(m.id)}
                              className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${selectedMediaId === m.id ? 'border-purple-500' : 'border-transparent'}`}
                             >
                               <img src={m.url} className="w-full h-full object-cover" />
                             </div>
                           ))}
                        </div>
                     </>
                   )}

                   <textarea
                     value={magicPrompt}
                     onChange={(e) => setMagicPrompt(e.target.value)}
                     className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none h-24 mb-4"
                     placeholder={
                       magicMode === 'generate' ? t.editor.magic.placeholderGen :
                       magicMode === 'edit' ? t.editor.magic.placeholderEdit :
                       t.editor.magic.placeholderAnim
                     }
                   />

                   <div className="flex justify-between items-center">
                      {(magicMode === 'animate' || (magicMode === 'generate' && magicImageSize !== '1K')) && (
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          <Key className="w-3 h-3" /> {t.editor.magic.apiKey}
                        </div>
                      )}
                      <button
                        onClick={handleMagicAction}
                        disabled={isMagicProcessing || !magicPrompt || (magicMode !== 'generate' && !selectedMediaId)}
                        className="ml-auto bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        {isMagicProcessing ? (
                          <>
                             <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> 
                             {t.editor.magic.btnProcessing}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> 
                            {magicMode === 'generate' ? t.editor.magic.btnGenerate : magicMode === 'edit' ? t.editor.magic.btnEdit : t.editor.magic.btnAnimate}
                          </>
                        )}
                      </button>
                   </div>
                </div>
              </div>
            )}

            {/* TAB: LIVE ASSISTANT (NEW) */}
            {activeTab === 'live' && (
               <div className="flex flex-col items-center justify-center h-[500px] animate-in fade-in zoom-in-95 duration-300">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-all duration-500 ${isLiveConnected ? 'bg-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'bg-slate-800'}`}>
                     <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-slate-900 border-2 ${isLiveConnected ? 'border-red-500' : 'border-slate-700'}`}>
                        <Mic className={`w-10 h-10 ${isLiveConnected ? 'text-red-500 animate-pulse' : 'text-slate-500'}`} />
                     </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {t.editor.live.title}
                  </h3>
                  <p className="text-slate-400 text-center max-w-md mb-8 h-6">
                    {liveTranscript || t.editor.live.desc}
                  </p>

                  <button
                    onClick={toggleLiveSession}
                    className={`px-8 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 ${
                      isLiveConnected 
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/30' 
                        : 'bg-white text-slate-900 hover:bg-slate-200'
                    }`}
                  >
                    {isLiveConnected ? t.editor.live.stop : t.editor.live.start}
                  </button>
                  
                  <div className="mt-8 flex gap-4 text-xs text-slate-500">
                     <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Gemini 2.5 Native Audio</span>
                     <span className="flex items-center gap-1"><Mic className="w-3 h-3" /> Low Latency</span>
                  </div>
               </div>
            )}

            {/* TAB: STORY */}
            {activeTab === 'story' && (
              <div className="space-y-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h3 className="text-lg font-semibold mb-2">{t.editor.story.context}</h3>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-white h-32 mb-4"
                    value={project.storyContext || ''}
                    onChange={(e) => updateProject(project.id, { storyContext: e.target.value })}
                    placeholder={t.editor.story.placeholder}
                  />
                  <button 
                      onClick={handleGenerateScript}
                      disabled={isGeneratingScript || !project.storyContext}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm ml-auto"
                    >
                      {isGeneratingScript ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <Wand2 className="w-4 h-4" />}
                      {t.editor.story.generate}
                    </button>
                </div>
                {/* Script Display */}
                 <textarea 
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-white h-64"
                    value={project.script}
                    onChange={(e) => updateProject(project.id, { script: e.target.value })}
                  />
              </div>
            )}

            {/* TAB: AUDIO */}
            {activeTab === 'audio' && (
              <div className="space-y-6">
                 <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold">{t.editor.audio.title}</h3>
                    <button 
                        onClick={handleGenerateVoiceover}
                        disabled={isGeneratingAudio || !project.script}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                      >
                         {isGeneratingAudio ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <Mic className="w-4 h-4" />}
                         {t.editor.audio.generate}
                      </button>
                 </div>
                 {project.audioUrl && <audio controls src={project.audioUrl} className="w-full" />}
              </div>
            )}
            
            {/* TAB: PREVIEW */}
            {activeTab === 'preview' && (
              <div className="text-center py-12">
                 <h3 className="text-xl font-bold mb-4">{t.editor.preview.export}</h3>
                 <div className="flex gap-4 justify-center">
                   <button className="bg-slate-800 px-6 py-3 rounded-xl flex items-center gap-2">
                     <Download className="w-5 h-5" /> 720p
                   </button>
                 </div>
              </div>
            )}
            
          </div>
        </div>

        {/* Right Panel: Player */}
        <div className="w-full md:w-[400px] lg:w-[480px] bg-black p-6 flex flex-col items-center justify-center border-l border-slate-800 relative">
          <div className="w-full aspect-video bg-slate-900 rounded-lg overflow-hidden relative shadow-2xl ring-1 ring-slate-800">
            {project.media.length > 0 ? (
               <div className="w-full h-full relative">
                 {(() => {
                    const currentMedia = project.media[currentSlideIndex];
                    if (!currentMedia) return null;
                    if (currentMedia.type === 'video') {
                       return <video src={currentMedia.url} className="w-full h-full object-contain bg-black" controls={false} autoPlay={isPlaying} muted={true} loop />;
                    }
                    return <img src={currentMedia.url} className="w-full h-full object-contain bg-black" />;
                 })()}
               </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                <Film className="w-16 h-16 mb-4 opacity-50" />
                <p>No media</p>
              </div>
            )}
            {!isPlaying && project.media.length > 0 && (
              <div onClick={togglePreview} className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer">
                <Play className="w-12 h-12 text-white opacity-80" />
              </div>
            )}
          </div>
          
          {/* Controls */}
          <div className="w-full mt-6 flex justify-center gap-6">
             <button onClick={togglePreview} className="text-white hover:text-blue-400">
               {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
             </button>
          </div>
          
          {/* Hidden Audio */}
          {project.audioUrl && <audio ref={audioRef} src={project.audioUrl} onEnded={pausePreview} />}
        </div>
      </main>
    </div>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-full px-2 transition-colors ${active ? 'text-blue-500' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`p-2 rounded-xl ${active ? 'bg-blue-500/10' : ''}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
  </button>
);

export default Editor;