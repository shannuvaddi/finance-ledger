import {useCallback, useState} from 'react';
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
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
      type?: 'credit' | 'debit';
      date: string;
    };
  };
}

export function useVoiceRecord() {
  const { token } = useAuth();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VoiceResult | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone permission denied');
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setRecording(true);
    } catch (e: any) {
      setError(e.message || 'Failed to start recording');
    }
  }, [audioRecorder]);

  const stopRecording = useCallback(async () => {
    if (!recording) return null;
    setRecording(false);
    setLoading(true);
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      if (!uri) throw new Error('No recording URI');

      const data: VoiceResult = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${BASE_URL}/voice/transcribe`);
        if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network request failed'));

        const formData = new FormData();
        formData.append('audio', {
          uri,
          type: 'audio/m4a',
          name: 'recording.m4a',
        } as any);

        xhr.send(formData);
      });
      setResult(data);
      setLoading(false);
      return data;
    } catch (e: any) {
      setError(e.message || 'Failed to process recording');
      setLoading(false);
      return null;
    }
  }, [token, recording, audioRecorder]);

  return { recording, loading, error, result, startRecording, stopRecording };
}
