import { useState, useRef } from 'react';
import { Plus, Image, Link, FileText, X } from 'lucide-react';
import { MediaItem } from '../types/journal';
import { saveMediaFile, generateId } from '../utils/storage';
import { fetchLinkPreview, isValidUrl } from '../utils/linkPreview';

interface MediaUploaderProps {
  onMediaAdd: (media: MediaItem) => void;
}

export const MediaUploader = ({ onMediaAdd }: MediaUploaderProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);
    
    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const mediaId = await saveMediaFile(file);
          const mediaItem: MediaItem = {
            id: generateId(),
            type: 'image',
            url: mediaId,
            name: file.name,
            size: file.size
          };
          onMediaAdd(mediaItem);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }
    
    setIsLoading(false);
    setIsExpanded(false);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsLoading(true);
    
    for (const file of Array.from(files)) {
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'application/msword') {
        try {
          const mediaId = await saveMediaFile(file);
          const mediaItem: MediaItem = {
            id: generateId(),
            type: 'document',
            url: mediaId,
            name: file.name,
            size: file.size
          };
          onMediaAdd(mediaItem);
        } catch (error) {
          console.error('Error uploading document:', error);
        }
      }
    }
    
    setIsLoading(false);
    setIsExpanded(false);
    if (documentInputRef.current) {
      documentInputRef.current.value = '';
    }
  };

  const handleLinkAdd = async () => {
    if (!linkUrl.trim() || !isValidUrl(linkUrl)) return;

    setIsLoading(true);
    
    try {
      const preview = await fetchLinkPreview(linkUrl);
      const mediaItem: MediaItem = {
        id: generateId(),
        type: 'link',
        url: linkUrl,
        name: preview.title,
        preview
      };
      onMediaAdd(mediaItem);
      setLinkUrl('');
      setShowLinkInput(false);
      setIsExpanded(false);
    } catch (error) {
      console.error('Error adding link:', error);
    }
    
    setIsLoading(false);
  };

  const handleLinkKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLinkAdd();
    } else if (e.key === 'Escape') {
      setLinkUrl('');
      setShowLinkInput(false);
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        multiple
        onChange={handleDocumentUpload}
        className="hidden"
      />

      {/* Link input overlay */}
      {showLinkInput && (
        <div className="mb-4 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Link className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Add Link</span>
            <button
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl('');
                setIsExpanded(false);
              }}
              className="ml-auto p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyPress}
              placeholder="Paste or type a URL..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              autoFocus
            />
            <button
              onClick={handleLinkAdd}
              disabled={!linkUrl.trim() || !isValidUrl(linkUrl) || isLoading}
              className="px-4 py-2 bg-sky-400 text-white rounded-lg hover:bg-sky-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Main button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl transition-colors disabled:opacity-50"
        >
          <Plus className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-45' : ''}`} />
          <span className="text-sm font-medium">Add media</span>
        </button>

        {/* Expanded options */}
        {isExpanded && (
          <div className="flex items-center gap-2 animate-in slide-in-from-left duration-200">
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Image className="w-4 h-4" />
              <span className="text-sm">Image</span>
            </button>
            
            <button
              onClick={() => {
                setShowLinkInput(true);
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Link className="w-4 h-4" />
              <span className="text-sm">Link</span>
            </button>
            
            <button
              onClick={() => documentInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">Document</span>
            </button>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="mt-2 text-sm text-gray-500">
          Uploading...
        </div>
      )}
    </div>
  );
};
