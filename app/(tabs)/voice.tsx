import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useThemeColor';
import { useVoiceRecord } from '../../hooks/useVoiceRecord';

export default function VoiceScreen() {
  const theme = useTheme();
  const { recording, loading, startRecording, stopRecording } = useVoiceRecord();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Voice Entry</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {recording
            ? 'Listening... tap the button to stop.'
            : 'Tap the microphone to dictate a transaction.'}
        </Text>

        <View style={styles.micArea}>
          {recording && (
            <View style={[styles.pulse, { borderColor: theme.accent + '40' }]} />
          )}
          <TouchableOpacity
            style={[styles.micBtn, { backgroundColor: recording ? theme.danger : theme.accent }]}
            onPress={recording ? stopRecording : startRecording}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons name={recording ? 'stop' : 'mic'} size={40} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading && (
          <Text style={[styles.status, { color: theme.textSecondary }]}>Processing...</Text>
        )}
      </View>

      <Text style={[styles.hint, { color: theme.muted }]}>
        e.g. "Spent forty dollars on dinner last night"
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 48, lineHeight: 22 },
  micArea: { alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 160, height: 160, borderRadius: 80, borderWidth: 3 },
  micBtn: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12 },
  status: { marginTop: 32, fontSize: 14 },
  hint: { textAlign: 'center', fontSize: 13, fontStyle: 'italic', paddingBottom: 24 },
});
