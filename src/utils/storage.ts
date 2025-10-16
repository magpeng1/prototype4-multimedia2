import { JournalEntry } from '../types/journal';

const STORAGE_KEY = 'journl_entries';
const MEDIA_STORAGE_KEY = 'journl_media';

export const saveEntry = (entry: JournalEntry): void => {
  const entries = getEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getEntries = (): JournalEntry[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    const entries = JSON.parse(stored);
    return entries.map((entry: any) => ({
      ...entry,
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt)
    }));
  } catch {
    return [];
  }
};

export const deleteEntry = (id: string): void => {
  const entries = getEntries().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const saveMediaFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const mediaId = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    reader.onload = () => {
      try {
        const mediaData = {
          id: mediaId,
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result as string,
          createdAt: new Date().toISOString()
        };
        
        const existingMedia = getStoredMedia();
        existingMedia[mediaId] = mediaData;
        localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(existingMedia));
        
        resolve(mediaId);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const getMediaFile = (mediaId: string): string | null => {
  const media = getStoredMedia();
  return media[mediaId]?.data || null;
};

const getStoredMedia = (): Record<string, any> => {
  const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
