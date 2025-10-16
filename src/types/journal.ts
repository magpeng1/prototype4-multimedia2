export interface MediaItem {
  id: string;
  type: 'image' | 'link' | 'document' | 'voice';
  url: string;
  name: string;
  size?: number;
  duration?: number; // For voice recordings in seconds
  preview?: {
    title?: string;
    favicon?: string;
    description?: string;
  };
}

export interface JournalEntry {
  id: string;
  text: string;
  mediaItems: MediaItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkPreview {
  title: string;
  description?: string;
  favicon?: string;
  url: string;
}
