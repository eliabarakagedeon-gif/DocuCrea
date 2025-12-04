import { Template, UserPlan } from './types';
import { Briefcase, Heart, Globe, User, Video, Camera } from 'lucide-react';

export const TEMPLATES: Template[] = [
  {
    id: 'ngo-impact',
    name: 'Impact ONG',
    description: 'Montrez l\'impact de vos actions humanitaires avec émotion.',
    icon: 'Heart',
    category: 'Social',
    difficulty: 'Facile'
  },
  {
    id: 'startup-pitch',
    name: 'Pitch Startup',
    description: 'Présentez votre innovation en 60 secondes chrono.',
    icon: 'Briefcase',
    category: 'Business',
    difficulty: 'Pro'
  },
  {
    id: 'travel-vlog',
    name: 'Carnet de Voyage',
    description: 'Immortalisez vos découvertes et paysages.',
    icon: 'Globe',
    category: 'Voyage',
    difficulty: 'Facile'
  },
  {
    id: 'testimony',
    name: 'Témoignage Client',
    description: 'Authenticité et confiance pour vos produits.',
    icon: 'User',
    category: 'Business',
    difficulty: 'Moyen'
  },
  {
    id: 'family-memory',
    name: 'Souvenir de Famille',
    description: 'Racontez l\'histoire de vos proches pour les générations futures.',
    icon: 'Camera',
    category: 'Personnel',
    difficulty: 'Facile'
  }
];

export const PRICING_TIERS = [
  {
    id: UserPlan.FREE,
    name: 'Découverte',
    price: '0€',
    features: ['Export 720p', 'Filigrane DocCrea', 'Templates standards', 'Musique limitée'],
    cta: 'Commencer gratuitement'
  },
  {
    id: UserPlan.CREATOR,
    name: 'Créateur',
    price: '9.99€/mois',
    features: ['Export 1080p', 'Pas de filigrane', 'IA Voix Illimitée', 'Bibliothèque musicale complète'],
    cta: 'Devenir Créateur',
    highlight: true
  },
  {
    id: UserPlan.NGO,
    name: 'ONG & Asso',
    price: 'Sur devis',
    features: ['Export 4K', 'Support prioritaire', 'Templates personnalisés', 'Multi-comptes'],
    cta: 'Contacter l\'équipe'
  }
];