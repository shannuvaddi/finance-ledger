import React, {useState} from 'react';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../context/AuthContext';
import {useTheme} from '../hooks/useThemeColor';
import {useGoogleAuth} from '../hooks/useGoogleAuth';
import {brand} from '../constants/Colors';
import {cardShadow, linearGradient} from '../constants/gradients';
import {illustrations, logo} from '../constants/illustrations';

export default function AuthScreen() {
  const { login, register } = useAuth();
  const theme = useTheme();
  const { signIn: googleSignIn, isReady: googleReady } = useGoogleAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Name is required');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    const err = isRegister
      ? await register(name.trim(), email.trim(), password)
      : await login(email.trim(), password);
    setLoading(false);

    if (err) {
      setError(err);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    await googleSignIn();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Decorative background shapes */}
      <View style={[styles.blob, styles.blobTop, { backgroundColor: theme.accent + '14' }]} />
      <View style={[styles.blob, styles.blobBottom, { backgroundColor: theme.accent + '0F' }]} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={illustrations.hero.source}
            style={styles.hero}
            resizeMode="contain"
          />
          <View style={styles.brandRow}>
            <Image source={logo} style={styles.logo} />
            <Text style={[styles.title, { color: theme.text }]}>Chanakya</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </Text>
        </View>

        <View style={[styles.form, styles.formCard, cardShadow, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {isRegister && (
            <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <Ionicons name="person-outline" size={18} color={theme.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Full name"
                placeholderTextColor={theme.muted}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Ionicons name="mail-outline" size={18} color={theme.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Email"
              placeholderTextColor={theme.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={[styles.inputRow, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.muted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Password"
              placeholderTextColor={theme.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </View>

          {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, linearGradient(brand.orange, brand.orangeLight, 90), { backgroundColor: theme.accent }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{isRegister ? 'Create Account' : 'Sign In'}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.muted }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <TouchableOpacity
            style={[styles.googleBtn, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={handleGoogleSignIn}
            disabled={!googleReady}
            activeOpacity={0.7}
          >
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text style={[styles.googleText, { color: theme.text }]}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.switchRow} onPress={() => { setIsRegister(!isRegister); setError(''); }}>
          <Text style={[styles.switchText, { color: theme.textSecondary }]}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
          </Text>
          <Text style={[styles.switchLink, { color: theme.accent }]}>
            {isRegister ? ' Sign In' : ' Register'}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  scroll: { flexGrow: 1 },
  blob: { position: 'absolute', borderRadius: 999, pointerEvents: 'none' },
  blobTop: { width: 420, height: 420, top: -180, right: -160 },
  blobBottom: { width: 360, height: 360, bottom: -170, left: -150 },
  content: { flex: 1, justifyContent: 'center', padding: 24, paddingVertical: 40, width: '100%', maxWidth: 440, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  hero: { width: 260, height: 260 / illustrations.hero.aspectRatio, marginBottom: 8 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  logo: { width: 38, height: 38, borderRadius: 11 },
  title: { fontSize: 34, fontWeight: '700', letterSpacing: -0.5 },
  subtitle: { fontSize: 16 },
  form: { gap: 14 },
  formCard: { borderWidth: 1, borderRadius: 22, padding: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15 },
  error: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  submitBtn: { height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8, boxShadow: '0px 6px 16px rgba(230, 81, 0, 0.3)' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 14, fontSize: 13 },
  googleBtn: { height: 52, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  googleText: { fontSize: 15, fontWeight: '500' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: '600' },
});
