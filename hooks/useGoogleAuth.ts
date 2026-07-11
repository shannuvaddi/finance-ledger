import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';

export function useGoogleAuth() {
  const { googleAuth } = useAuth();

  const redirectUri = AuthSession.makeRedirectUri();

  useEffect(() => {
    console.log('[GoogleAuth] Redirect URI:', redirectUri);
  }, [redirectUri]);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token;
      if (idToken) {
        googleAuth(idToken);
      }
    }
  }, [response]);

  const signIn = () => promptAsync();

  return { signIn, isReady: !!request, redirectUri };
}
