import { useState, useEffect } from 'react';
import { BookOpen, Save, Calendar } from 'lucide-react';
import { TextEditor } from './components/TextEditor';
import { MediaUploader } from './components/MediaUploader';
import { MediaCard } from './components/MediaCard';
import { VoiceRecorder } from './components/VoiceRecorder';
import { JournalEntry, MediaItem } from './types/journal';
import { saveEntry, getEntries, generateId } from './utils/storage';

function App() {
  const [textContent, setTextContent] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const savedEntries = getEntries();
    setEntries(savedEntries);
  };

  const handleSave = async () => {
    if (!textContent.trim() && mediaItems.length === 0) {
      return;
    }

    setIsSaving(true);

    try {
      const entry: JournalEntry = {
        id: generateId(),
        text: textContent,
        mediaItems: [...mediaItems],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      saveEntry(entry);
      loadEntries();

      // Clear the form
      setTextContent('');
      setMediaItems([]);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaAdd = (media: MediaItem) => {
    setMediaItems(prev => [...prev, media]);
  };

  const handleMediaRemove = (mediaId: string) => {
    setMediaItems(prev => prev.filter(item => item.id !== mediaId));
  };

  const hasContent = textContent.trim().length > 0 || mediaItems.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-emerald-50">
      <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl">
              <BookOpen className="w-6 h-6 text-rose-500" />
            </div>
            <h1 className="text-2xl font-light text-gray-700 tracking-wide">Journl</h1>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Text Editor */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <TextEditor
              value={textContent}
              onChange={setTextContent}
              placeholder="What's on your mind today?"
            />
          </div>

          {/* Media Items Display */}
          {mediaItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-600 px-1">Attachments</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mediaItems.map((item) => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onRemove={handleMediaRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Voice Recorder */}
          <VoiceRecorder onRecordingComplete={handleMediaAdd} />

          {/* Media Uploader */}
          <div className="flex justify-start">
            <MediaUploader onMediaAdd={handleMediaAdd} />
          </div>

          {/* Save Button */}
          <div className="pt-4">
            {hasContent && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-emerald-400 hover:bg-emerald-500 disabled:bg-gray-300 disabled:text-gray-500 text-white rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm font-medium"
              >
                <Save className="w-5 h-5" />
                <span>
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Entries</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {entries.slice(0, 5).map((entry) => (
                <div
                  key={entry.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {entry.createdAt.toLocaleDateString()} at {entry.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {entry.text && (
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                      {entry.text}
                    </p>
                  )}
                  
                  {entry.mediaItems.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{entry.mediaItems.length} attachment{entry.mediaItems.length > 1 ? 's' : ''}</span>
                      <div className="flex gap-1">
                        {entry.mediaItems.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-2 h-2 rounded-full bg-gray-300"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
