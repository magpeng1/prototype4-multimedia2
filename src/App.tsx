import { useState, useEffect } from 'react';
import { BookOpen, Save } from 'lucide-react';
import { VoiceRecorder } from './components/VoiceRecorder';
import { TextEditor } from './components/TextEditor';
import { RecordingsList } from './components/RecordingsList';
import { supabase, JournalEntry } from './lib/supabase';

function App() {
  const [textContent, setTextContent] = useState('');
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [showRecordings, setShowRecordings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Auth error:', error);
      } else {
        setUserId(data.user?.id || null);
      }
    } else {
      setUserId(session.user.id);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      console.error('No user authenticated');
      return;
    }

    if (!textContent.trim() && voiceDuration === 0) {
      return;
    }

    setIsSaving(true);

    try {
      const hasText = textContent.trim().length > 0;
      const hasVoice = voiceDuration > 0;

      const entry = {
        user_id: userId,
        type: hasVoice ? 'voice' : 'text',
        content: hasText
          ? textContent
          : `Voice recording (${voiceDuration}s)`,
        duration: hasVoice ? voiceDuration : undefined,
      };

      const { error } = await supabase
        .from('journal_entries')
        .insert(entry);

      if (error) throw error;

      console.log('Entry saved successfully');

      setTextContent('');
      setVoiceDuration(0);
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEntrySelect = (entry: JournalEntry) => {
    if (entry.type === 'text') {
      setTextContent(entry.content);
      setVoiceDuration(0);
    } else {
      setVoiceDuration(entry.duration || 0);
      setTextContent('');
    }
  };

  const hasContent = textContent.trim().length > 0 || voiceDuration > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col min-h-screen">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-emerald-400" />
            <h1 className="text-2xl font-light tracking-wide">Journl</h1>
          </div>

          <button
            onClick={() => setShowRecordings(true)}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            aria-label="View recordings"
          >
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            </div>
          </button>
        </header>

        <div className="flex-1 flex flex-col">
          <div className="mb-8 space-y-8">
            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800/50 backdrop-blur-sm">
              <TextEditor
                value={textContent}
                onChange={setTextContent}
                placeholder="What's on your mind today?"
              />
            </div>

            <div className="flex items-center justify-center py-8">
              <VoiceRecorder onRecordingComplete={setVoiceDuration} />
            </div>
          </div>

          <div className="mt-auto pt-8">
            {hasContent && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-5 h-5" />
                <span className="font-light">
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showRecordings && (
        <RecordingsList
          onClose={() => setShowRecordings(false)}
          onEntrySelect={handleEntrySelect}
        />
      )}
    </div>
  );
}

export default App;
