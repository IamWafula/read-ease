import React from 'react';
import { auth } from './firebase';
import { signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { clientId } from './config';

export default function Login (){
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await auth.signInWithPopup(provider);
            // User signed in
            console.log(result.user);
        } catch (error) {
            // Handle Errors
            console.error('Auth error:', error);
        }
    };

  return <button onClick={handleLogin}>Sign in with Google</button>;
};

