import { useEffect, useState } from 'react';
import { FileAudio, FileText, X } from 'lucide-react';
import { supabase, JournalEntry } from '../lib/supabase';

interface RecordingsListProps {
  onClose: () => void;
  onEntrySelect: (entry: JournalEntry) => void;
}

export function RecordingsList({ onClose, onEntrySelect }: RecordingsListProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-light text-gray-200">Journal Entries</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No entries yet. Start journaling!
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    onEntrySelect(entry);
                    onClose();
                  }}
                  className="w-full text-left p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl transition-colors border border-gray-700/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {entry.type === 'voice' ? (
                        <FileAudio className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <FileText className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm text-gray-400">
                          {formatDate(entry.created_at)}
                        </span>
                        {entry.type === 'voice' && entry.duration && (
                          <span className="text-xs text-gray-500 tabular-nums">
                            {formatDuration(entry.duration)}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 line-clamp-2 text-sm">
                        {entry.content || 'No content'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
