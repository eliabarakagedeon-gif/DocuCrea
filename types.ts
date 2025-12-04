export enum ProjectStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  COMPLETED = 'completed'
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'Business' | 'Social' | 'Personnel' | 'Voyage';
  difficulty: 'Facile' | 'Moyen' | 'Pro';
}

export interface MediaItem {
  id: string;
  url: string; // Blob URL or remote URL
  type: 'image' | 'video';
  name: string;
}

export interface Project {
  id: string;
  title: string;
  templateId: string;
  status: ProjectStatus;
  media: MediaItem[];
  script: string;
  audioUrl?: string; // Voiceover blob URL
  storyContext?: string; // User input for story generation
  createdAt: Date;
}

export enum UserPlan {
  FREE = 'free',
  CREATOR = 'creator',
  NGO = 'ngo',
  BUSINESS = 'business'
}