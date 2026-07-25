import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

// Web client ID: used in Expo Go / web, and required to mint the id_token on Android.
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
// Android client ID: required for standalone Android builds. Bound to the app's
// package name (com.anonymous.chanakya) + signing-key SHA-1 in Google Cloud Console.
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

export function useGoogleAuth() {
  const { googleAuth } = useAuth();

  // Let the Google provider compute the correct redirect per platform:
  // - Expo Go / web  -> web client + proxy/localhost redirect
  // - standalone Android -> reversed-client-id scheme of the Android client
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
  });

  useEffect(() => {
    console.log('[GoogleAuth] Redirect URI:', request?.redirectUri);
  }, [request?.redirectUri]);

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        googleAuth(idToken);
      }
    }
  }, [response]);

  const signIn = () => promptAsync();

  return { signIn, isReady: !!request, redirectUri: request?.redirectUri };
}
