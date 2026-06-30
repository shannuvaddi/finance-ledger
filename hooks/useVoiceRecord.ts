import {useCallback, useRef, useState} from 'react';
import {Audio} from 'expo-av';
import {useAuth} from '../context/AuthContext';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

interface VoiceResult {
  transcription: string;
  chat: {
    reply: string;
    transaction?: {
      description: string;
      amount: number;
      category?: string;
      date: string;
    };
  };
}

export function useVoiceRecord() {
  const { token } = useAuth();
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceResult | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission denied');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = rec;
      setRecording(true);
    } catch (e: any) {
      setError(e.message || 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return null;
    setRecording(false);
    setLoading(true);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) throw new Error('No recording URI');

      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const res = await fetch(`${BASE_URL}/voice/transcribe`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: VoiceResult = await res.json();
      setResult(data);
      setLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message || 'Failed to process recording');
      setLoading(false);
      return null;
    }
  }, [token]);

  return { recording, loading, error, result, startRecording, stopRecording };
}
