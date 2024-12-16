import React from 'react';
import { auth } from '../firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { clientId } from '../config';

// Login component to handle Google OAuth authentication
const Login = () => {
  // Function to handle the login process using Google's OAuth flow
  const handleLogin = () => {
    // Google OAuth 2.0 URL for authentication
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=https://${chrome.runtime.id}.chromiumapp.org/&response_type=token&scope=email%20profile%20openid`;

    // Launch the Google authentication flow
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl, // URL to initiate the OAuth flow
        interactive: true // Opens an interactive popup for the user
      },
      async (redirectUrl) => {
        // Handle errors during the authentication process
        if (chrome.runtime.lastError || redirectUrl?.includes('access_denied')) {
          console.error('Auth error:', chrome.runtime.lastError); // Log the error
          return; // Exit if there was an error or the user denied access
        }

        // Extract the access token from the redirect URL
        const urlParams = new URLSearchParams(new URL(redirectUrl).hash.substring(1));
        const accessToken = urlParams.get('access_token'); // Retrieve the access token

        // Use the access token to create Firebase credential
        const credential = GoogleAuthProvider.credential(null, accessToken);
        try {
          // Sign in the user with the credential
          await signInWithCredential(auth, credential);
          console.log('User signed in successfully.');
          // User is now authenticated
        } catch (error) {
          console.error('Error during sign-in:', error); // Handle sign-in errors
        }
      }
    );
  };

  // Render a button to trigger the login process
  return <button onClick={handleLogin}>Sign in with Google</button>;
};

export default Login;
