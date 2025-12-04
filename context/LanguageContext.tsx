import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'en';

interface Translations {
  navbar: {
    home: string;
    pricing: string;
    newProject: string;
    profile: string;
  };
  home: {
    heroTitle: string;
    heroDesc: string;
    cta: string;
    recentProjects: string;
    noProjects: string;
    startTemplate: string;
    createFirst: string;
    features: {
      editTitle: string;
      editDesc: string;
      aiTitle: string;
      aiDesc: string;
      tplTitle: string;
      tplDesc: string;
    };
  };
  create: {
    title: string;
    subtitle: string;
    projectTitle: string;
    placeholder: string;
    difficulty: string;
    start: string;
    templates: Record<string, { name: string; description: string }>;
  };
  editor: {
    tabs: {
      media: string;
      magic: string;
      assistant: string;
      story: string;
      audio: string;
      preview: string;
    };
    magic: {
      generate: string;
      edit: string;
      animate: string;
      genTitle: string;
      genDesc: string;
      editTitle: string;
      editDesc: string;
      animTitle: string;
      animDesc: string;
      placeholderGen: string;
      placeholderEdit: string;
      placeholderAnim: string;
      btnProcessing: string;
      btnGenerate: string;
      btnEdit: string;
      btnAnimate: string;
      apiKey: string;
    };
    live: {
      title: string;
      listening: string;
      desc: string;
      start: string;
      stop: string;
      connected: string;
      disconnected: string;
      error: string;
    };
    story: {
      context: string;
      placeholder: string;
      generate: string;
    };
    audio: {
      title: string;
      generate: string;
    };
    preview: {
      export: string;
    };
  };
  pricing: {
    title: string;
    subtitle: string;
    plans: {
      free: { name: string; cta: string; features: string[] };
      creator: { name: string; cta: string; features: string[] };
      ngo: { name: string; cta: string; features: string[] };
    };
  };
  profile: {
    title: string;
    desc: string;
    edit: string;
    subscription: string;
    prefs: string;
    logout: string;
  }
}

const translations: Record<Language, Translations> = {
  fr: {
    navbar: {
      home: 'Accueil',
      pricing: 'Tarifs',
      newProject: 'Nouveau projet',
      profile: 'Profil'
    },
    home: {
      heroTitle: "Racontez vos histoires avec l'IA",
      heroDesc: "Transformez vos médias en mini-documentaires professionnels en quelques minutes. Montage automatique, voix-off IA et storytelling assisté.",
      cta: "Créer un documentaire",
      recentProjects: "Vos projets récents",
      noProjects: "Aucun projet pour le moment",
      startTemplate: "Commencez par choisir un modèle narratif.",
      createFirst: "Créer mon premier doc",
      features: {
        editTitle: "Montage Intelligent",
        editDesc: "L'algorithme assemble vos rushes automatiquement.",
        aiTitle: "Narrateur Virtuel",
        aiDesc: "Une voix-off professionnelle générée instantanément.",
        tplTitle: "Templates Pro",
        tplDesc: "Des structures narratives éprouvées."
      }
    },
    create: {
      title: "Nouveau Documentaire",
      subtitle: "Choisissez une structure narrative pour commencer.",
      projectTitle: "Titre du projet",
      placeholder: "Ex: Voyage au Japon 2024",
      difficulty: "Niveau",
      start: "Commencer",
      templates: {
        'ngo-impact': { name: 'Impact ONG', description: "Montrez l'impact de vos actions humanitaires avec émotion." },
        'startup-pitch': { name: 'Pitch Startup', description: "Présentez votre innovation en 60 secondes chrono." },
        'travel-vlog': { name: 'Carnet de Voyage', description: "Immortalisez vos découvertes et paysages." },
        'testimony': { name: 'Témoignage Client', description: "Authenticité et confiance pour vos produits." },
        'family-memory': { name: 'Souvenir de Famille', description: "Racontez l'histoire de vos proches." }
      }
    },
    editor: {
      tabs: { media: 'Média', magic: 'Studio IA', assistant: 'Assistant', story: 'Récit', audio: 'Audio', preview: 'Aperçu' },
      magic: {
        generate: 'Générer', edit: 'Retoucher', animate: 'Veo (Animer)',
        genTitle: 'Générer une image (Gemini 3 Pro)', genDesc: 'Créez des visuels uniques.',
        editTitle: 'Retouche Magique', editDesc: 'Sélectionnez une image et décrivez la modification.',
        animTitle: 'Animer avec Veo', animDesc: 'Transformez une image statique en vidéo.',
        placeholderGen: 'Un paysage futuriste...', placeholderEdit: 'Ajoute un filtre vintage...', placeholderAnim: 'Une caméra qui avance doucement...',
        btnProcessing: 'Traitement...', btnGenerate: 'Générer', btnEdit: 'Retoucher', btnAnimate: 'Animer',
        apiKey: 'Clé API payante requise'
      },
      live: {
        title: "Assistant Réalisateur", listening: "Assistant à l'écoute...",
        desc: "Discutez en temps réel avec l'IA pour obtenir des conseils.",
        start: "Démarrer la conversation", stop: "Terminer la session",
        connected: "Assistant connecté. Parlez maintenant.", disconnected: "Déconnecté.", error: "Erreur Live API."
      },
      story: { context: "Contexte du Récit", placeholder: "Décrivez votre histoire...", generate: "Générer Script" },
      audio: { title: "Voix Off IA", generate: "Générer Audio" },
      preview: { export: "Exportation" }
    },
    pricing: {
      title: "Plans Flexibles",
      subtitle: "Des outils adaptés pour les créateurs, ONG et entreprises.",
      plans: {
        free: { name: "Découverte", cta: "Commencer gratuitement", features: ['Export 720p', 'Filigrane DocCrea', 'Templates standards', 'Musique limitée'] },
        creator: { name: "Créateur", cta: "Devenir Créateur", features: ['Export 1080p', 'Pas de filigrane', 'IA Voix Illimitée', 'Bibliothèque musicale complète'] },
        ngo: { name: "ONG & Asso", cta: "Contacter l'équipe", features: ['Export 4K', 'Support prioritaire', 'Templates personnalisés', 'Multi-comptes'] }
      }
    },
    profile: {
      title: "Jean Dupont", desc: "Créateur de contenu • Plan Gratuit",
      edit: "Modifier le profil", subscription: "Gérer l'abonnement",
      prefs: "Préférences", logout: "Se déconnecter"
    }
  },
  en: {
    navbar: {
      home: 'Home',
      pricing: 'Pricing',
      newProject: 'New Project',
      profile: 'Profile'
    },
    home: {
      heroTitle: "Tell your stories with AI",
      heroDesc: "Turn your media into professional mini-documentaries in minutes. Auto-editing, AI voiceover, and assisted storytelling.",
      cta: "Create Documentary",
      recentProjects: "Your recent projects",
      noProjects: "No projects yet",
      startTemplate: "Start by choosing a narrative template.",
      createFirst: "Create my first doc",
      features: {
        editTitle: "Smart Editing",
        editDesc: "The algorithm assembles your footage automatically.",
        aiTitle: "Virtual Narrator",
        aiDesc: "Professional voiceover generated instantly.",
        tplTitle: "Pro Templates",
        tplDesc: "Proven narrative structures."
      }
    },
    create: {
      title: "New Documentary",
      subtitle: "Choose a narrative structure to start.",
      projectTitle: "Project Title",
      placeholder: "Ex: Trip to Japan 2024",
      difficulty: "Level",
      start: "Start",
      templates: {
        'ngo-impact': { name: 'NGO Impact', description: "Show the impact of your humanitarian actions with emotion." },
        'startup-pitch': { name: 'Startup Pitch', description: "Present your innovation in 60 seconds flat." },
        'travel-vlog': { name: 'Travel Vlog', description: "Immortalize your discoveries and landscapes." },
        'testimony': { name: 'Client Testimony', description: "Authenticity and trust for your products." },
        'family-memory': { name: 'Family Memory', description: "Tell the story of your loved ones." }
      }
    },
    editor: {
      tabs: { media: 'Media', magic: 'AI Studio', assistant: 'Assistant', story: 'Story', audio: 'Audio', preview: 'Preview' },
      magic: {
        generate: 'Generate', edit: 'Edit', animate: 'Veo (Animate)',
        genTitle: 'Generate Image (Gemini 3 Pro)', genDesc: 'Create unique visuals.',
        editTitle: 'Magic Edit', editDesc: 'Select an image and describe the change.',
        animTitle: 'Animate with Veo', animDesc: 'Transform a static image into video.',
        placeholderGen: 'A futuristic landscape...', placeholderEdit: 'Add a vintage filter...', placeholderAnim: 'Camera dolly in...',
        btnProcessing: 'Processing...', btnGenerate: 'Generate', btnEdit: 'Edit', btnAnimate: 'Animate',
        apiKey: 'Paid API Key required'
      },
      live: {
        title: "Assistant Director", listening: "Assistant listening...",
        desc: "Chat in real-time with AI for editing advice.",
        start: "Start Conversation", stop: "End Session",
        connected: "Assistant connected. Speak now.", disconnected: "Disconnected.", error: "Live API Error."
      },
      story: { context: "Story Context", placeholder: "Describe your story...", generate: "Generate Script" },
      audio: { title: "AI Voiceover", generate: "Generate Audio" },
      preview: { export: "Export" }
    },
    pricing: {
      title: "Flexible Plans",
      subtitle: "Tools adapted for creators, NGOs and businesses.",
      plans: {
        free: { name: "Discovery", cta: "Start for free", features: ['720p Export', 'DocCrea Watermark', 'Standard Templates', 'Limited Music'] },
        creator: { name: "Creator", cta: "Become a Creator", features: ['1080p Export', 'No Watermark', 'Unlimited AI Voice', 'Full Music Library'] },
        ngo: { name: "NGO & Org", cta: "Contact Team", features: ['4K Export', 'Priority Support', 'Custom Templates', 'Multi-accounts'] }
      }
    },
    profile: {
      title: "John Doe", desc: "Content Creator • Free Plan",
      edit: "Edit Profile", subscription: "Manage Subscription",
      prefs: "Preferences", logout: "Logout"
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};