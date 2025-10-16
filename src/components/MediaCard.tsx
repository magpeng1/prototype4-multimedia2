import { X, FileText, Link } from 'lucide-react';
import { MediaItem } from '../types/journal';
import { getMediaFile } from '../utils/storage';

interface MediaCardProps {
  item: MediaItem;
  onRemove: (id: string) => void;
}

export const MediaCard = ({ item, onRemove }: MediaCardProps) => {
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(item.id);
  };

  const renderContent = () => {
    switch (item.type) {
      case 'image':
        const imageData = getMediaFile(item.url);
        return (
          <div className="relative group">
            <img
              src={imageData || item.url}
              alt={item.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
          </div>
        );

      case 'link':
        return (
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0">
              {item.preview?.favicon ? (
                <img
                  src={item.preview.favicon}
                  alt=""
                  className="w-6 h-6 rounded"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <Link className="w-6 h-6 text-blue-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {item.preview?.title || item.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{item.url}</p>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0">
              <FileText className="w-8 h-8 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">
                {item.name}
              </p>
              {item.size && (
                <p className="text-xs text-gray-500">
                  {formatFileSize(item.size)}
                </p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 z-10 p-1 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
        aria-label="Remove media"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>
      
      {item.type === 'link' ? (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:bg-gray-50 transition-colors"
        >
          {renderContent()}
        </a>
      ) : (
        <div className="cursor-pointer">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
