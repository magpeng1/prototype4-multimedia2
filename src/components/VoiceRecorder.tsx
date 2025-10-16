import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2 } from 'lucide-react';
import { MediaItem } from '../types/journal';
import { saveMediaFile, generateId } from '../utils/storage';

interface VoiceRecorderProps {
  onRecordingComplete: (media: MediaItem) => void;
}

export const VoiceRecorder = ({ onRecordingComplete }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for waveform
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start waveform animation
      updateWaveform();
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      
      setWaveformData([]);
    }
  };

  const updateWaveform = () => {
    if (!analyserRef.current || !isRecording) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Convert to normalized values and take a sample
    const sampleSize = 20;
    const step = Math.floor(bufferLength / sampleSize);
    const samples = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const index = i * step;
      samples.push(dataArray[index] / 255);
    }
    
    setWaveformData(samples);
    animationRef.current = requestAnimationFrame(updateWaveform);
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setWaveformData([]);
    setIsPlaying(false);
  };

  const saveRecording = async () => {
    if (!audioBlob) return;
    
    try {
      // Convert blob to file for storage
      const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const mediaId = await saveMediaFile(file);
      
      const mediaItem: MediaItem = {
        id: generateId(),
        type: 'voice',
        url: mediaId,
        name: `Voice Recording ${formatTime(recordingTime)}`,
        duration: recordingTime,
        size: audioBlob.size
      };
      
      onRecordingComplete(mediaItem);
      deleteRecording();
    } catch (error) {
      console.error('Error saving recording:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-col items-center space-y-4">
        {/* Recording Controls */}
        <div className="flex items-center gap-4">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="flex items-center justify-center w-16 h-16 bg-rose-100 hover:bg-rose-200 text-rose-600 rounded-full transition-colors"
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
          
          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center w-16 h-16 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors animate-pulse"
            >
              <Square className="w-6 h-6" />
            </button>
          )}
          
          {audioBlob && (
            <div className="flex items-center gap-2">
              <button
                onClick={isPlaying ? pauseRecording : playRecording}
                className="flex items-center justify-center w-12 h-12 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={deleteRecording}
                className="flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              <button
                onClick={saveRecording}
                className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Save Recording
              </button>
            </div>
          )}
        </div>

        {/* Timer */}
        {(isRecording || audioBlob) && (
          <div className="text-2xl font-mono text-gray-700">
            {formatTime(recordingTime)}
          </div>
        )}

        {/* Waveform Visualization */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1 h-12">
            {waveformData.map((amplitude, index) => (
              <div
                key={index}
                className="bg-rose-400 rounded-full transition-all duration-100"
                style={{
                  width: '3px',
                  height: `${Math.max(4, amplitude * 40)}px`,
                }}
              />
            ))}
          </div>
        )}

        {/* Playback Waveform (Static) */}
        {audioBlob && !isRecording && (
          <div className="flex items-center justify-center gap-1 h-8">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="bg-emerald-300 rounded-full"
                style={{
                  width: '3px',
                  height: `${Math.random() * 20 + 4}px`,
                }}
              />
            ))}
          </div>
        )}

        {/* Status Text */}
        <div className="text-center">
          {!isRecording && !audioBlob && (
            <p className="text-sm text-gray-500">Tap to start recording</p>
          )}
          {isRecording && (
            <p className="text-sm text-rose-600 font-medium">Recording...</p>
          )}
          {audioBlob && (
            <p className="text-sm text-gray-600">Recording ready to save</p>
          )}
        </div>
      </div>

      {/* Hidden audio element for playback */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
};
