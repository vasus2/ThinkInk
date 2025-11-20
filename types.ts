export interface Note {
  id: string;
  title: string;
  imageUrl: string;
  extractedText: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  NOTE_DETAIL = 'NOTE_DETAIL'
}

declare global {
  // Fix: Define AIStudio interface to resolve type mismatch with global definition
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}