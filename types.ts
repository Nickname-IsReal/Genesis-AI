export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  attachments?: Attachment[];
  groundingMetadata?: GroundingMetadata;
  thoughtProcess?: string; // For thinking model debug/display
  feedback?: 'like' | 'dislike';
}

export interface Attachment {
  type: 'image' | 'video';
  url: string;
  mimeType: string;
  data: string; // Base64
}

export interface GroundingMetadata {
  searchChunks?: {
    web: {
      uri: string;
      title: string;
    };
  }[];
  mapChunks?: {
    maps: {
      uri: string;
      title: string;
      placeAnswerSources?: {
        reviewSnippets?: {
          reviewText: string;
        }[];
      }[];
    };
  }[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  lastModified: number;
}

export enum AppMode {
  FAST = 'fast', // Gemini 3 Flash
  SMART = 'smart', // Gemini 3 Pro (General)
  THINKING = 'thinking', // Gemini 3 Pro (Thinking Budget)
  SEARCH = 'search', // Gemini 3 Flash + Search
  MAPS = 'maps', // Gemini 2.5 Flash + Maps
  CODE = 'code', // Gemini 3 Pro (Coding Optimized)
  IMAGE = 'image', // Imagen 4.0
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export type Theme = 'light' | 'dark' | 'system';