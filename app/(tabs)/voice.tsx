import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useTheme} from '../../hooks/useThemeColor';
import {useVoiceRecord} from '../../hooks/useVoiceRecord';
import {TransactionCard} from '../../components/ui/TransactionCard';
import {PeriodHeader} from '../../components/ui/PeriodHeader';
import {brand} from '../../constants/Colors';
import {cardShadow, linearGradient} from '../../constants/gradients';
import {illustrations} from '../../constants/illustrations';

export default function VoiceScreen() {
  const theme = useTheme();
  const { recording, loading, error, result, startRecording, stopRecording } = useVoiceRecord();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <PeriodHeader />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Voice Entry</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {recording
            ? 'Listening... tap the button to stop.'
            : 'Tap the microphone to dictate a transaction.'}
        </Text>

        <View style={styles.micArea}>
          <View style={[styles.halo, styles.haloOuter, { backgroundColor: (recording ? theme.danger : theme.accent) + '0F' }]} />
          <View style={[styles.halo, styles.haloInner, { backgroundColor: (recording ? theme.danger : theme.accent) + '1A' }]} />
          {recording && (
            <View style={[styles.pulse, { borderColor: theme.danger + '55' }]} />
          )}
          <TouchableOpacity
            style={[
              styles.micBtn,
              recording ? { backgroundColor: theme.danger } : [linearGradient(brand.orange, brand.orangeLight), { backgroundColor: theme.accent }],
            ]}
            onPress={recording ? stopRecording : startRecording}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Ionicons name={recording ? 'stop' : 'mic'} size={40} color="#fff" />
          </TouchableOpacity>
        </View>

        <Image
          source={illustrations.voice.source}
          style={[styles.wave, { opacity: recording ? 1 : 0.35 }]}
          resizeMode="contain"
        />

        {loading && (
          <Text style={[styles.status, { color: theme.textSecondary }]}>Processing...</Text>
        )}

        {error && (
          <Text style={[styles.status, { color: theme.danger }]}>{error}</Text>
        )}

        {result && (
          <View style={[styles.resultArea, cardShadow, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.transcription, { color: theme.text }]}>"{result.transcription}"</Text>
            <Text style={[styles.reply, { color: theme.textSecondary }]}>{result.chat.reply}</Text>
            {result.chat.transaction && (
              <TransactionCard
                description={result.chat.transaction.description}
                amount={result.chat.transaction.amount}
                category={result.chat.transaction.category}
                type={result.chat.transaction.type}
                date={result.chat.transaction.date}
              />
            )}
          </View>
        )}
      </View>

      <View style={[styles.hintPill, { backgroundColor: theme.accent + '14' }]}>
        <Ionicons name="bulb-outline" size={14} color={theme.accent} />
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          e.g. "Spent forty kronor on dinner last night"
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 56, lineHeight: 22 },
  micArea: { alignItems: 'center', justifyContent: 'center', width: 220, height: 220 },
  halo: { position: 'absolute' },
  haloOuter: { width: 220, height: 220, borderRadius: 110 },
  haloInner: { width: 164, height: 164, borderRadius: 82 },
  pulse: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 3 },
  micBtn: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center', boxShadow: '0px 10px 24px rgba(230, 81, 0, 0.35)' },
  wave: { width: 240, height: 240 / illustrations.voice.aspectRatio, marginTop: 28 },
  status: { marginTop: 20, fontSize: 14 },
  resultArea: { marginTop: 24, alignItems: 'center', padding: 16, gap: 10, borderWidth: 1, borderRadius: 18, width: '100%', maxWidth: 360 },
  transcription: { fontSize: 15, fontStyle: 'italic', textAlign: 'center' },
  reply: { fontSize: 14, textAlign: 'center' },
  hintPill: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginBottom: 24, marginHorizontal: 24 },
  hint: { textAlign: 'center', fontSize: 13, fontStyle: 'italic', flexShrink: 1 },
});
