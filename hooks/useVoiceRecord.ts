import { useState, useCallback } from 'react';
import { useApi } from './useApi';

export function useVoiceRecord() {
  const [recording, setRecording] = useState(false);
  const { loading, error, request } = useApi<{ transcription: string }>();

  const startRecording = useCallback(() => {
    setRecording(true);
  }, []);

  const stopRecording = useCallback(async () => {
    setRecording(false);
    // In production, send actual audio blob to backend
    return request('/voice/transcribe', 'POST', { audio: 'mock-base64-data' });
  }, [request]);

  return { recording, loading, error, startRecording, stopRecording };
}
