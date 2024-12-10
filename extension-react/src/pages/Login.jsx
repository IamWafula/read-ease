import React from 'react';
import { auth } from '../firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { clientId } from '../config';

const Login = () => {
  const handleLogin = () => {
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=https://${chrome.runtime.id}.chromiumapp.org/&response_type=token&scope=email%20profile%20openid`;

    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl,
        interactive: true
      },
      async (redirectUrl) => {
        if (chrome.runtime.lastError || redirectUrl?.includes('access_denied')) {
          console.error('Auth error:', chrome.runtime.lastError);
          return;
        }

        const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
        const accessToken = urlParams.get('access_token');

        const credential = GoogleAuthProvider.credential(null, accessToken);
        try {
          await signInWithCredential(auth, credential);
          // User signed in
        } catch (error) {
          // Handle Errors
        }
      }
    );
  };

  return <button onClick={handleLogin}>Sign in with Google</button>;
};

export default Login;