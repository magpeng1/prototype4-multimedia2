import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (duration: number) => void;
}

export function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (isRecording) {
      const startTime = Date.now() - duration * 1000;
      timerRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      console.log('Recording stopped. Duration:', duration, 'seconds');
      console.log('Mock audio blob saved');
      setIsRecording(false);
      setHasRecording(true);
      onRecordingComplete(duration);
    } else {
      console.log('Recording started');
      setIsRecording(true);
      setHasRecording(false);
      setDuration(0);
    }
  };

  const handlePlayback = () => {
    console.log('Playing back recording');
    setIsPlaying(true);
    setTimeout(() => {
      setIsPlaying(false);
      console.log('Playback finished');
    }, duration * 1000);
  };

  const generateWaveform = () => {
    const bars = 40;
    const heights = Array.from({ length: bars }, () =>
      isRecording ? Math.random() * 60 + 20 : 40
    );

    return heights;
  };

  const waveformHeights = generateWaveform();

  return (
    <div className="flex flex-col items-center gap-6">
      {(isRecording || hasRecording) && (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="text-2xl font-light text-gray-300 tabular-nums">
            {formatTime(duration)}
          </div>

          <div className="flex items-center justify-center gap-1 h-20 w-full max-w-md">
            {waveformHeights.map((height, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isRecording
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-gray-600'
                }`}
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 20}ms`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleRecordToggle}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50'
            : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30'
        }`}
      >
        {isRecording ? (
          <Square className="w-8 h-8 text-white" fill="white" />
        ) : (
          <Mic className="w-9 h-9 text-white" />
        )}
      </button>

      {hasRecording && !isRecording && (
        <button
          onClick={handlePlayback}
          disabled={isPlaying}
          className="flex items-center gap-2 px-6 py-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4 text-emerald-400" fill="currentColor" />
          <span className="text-sm text-gray-300">
            {isPlaying ? 'Playing...' : 'Playback'}
          </span>
        </button>
      )}
    </div>
  );
}
