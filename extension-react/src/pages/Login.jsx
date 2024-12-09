import React from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const Login = () => {
  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        // User signed in
      })
      .catch((error) => {
        // Handle Errors
      });
  };

  return <button onClick={handleLogin}>Sign in with Google</button>;
};

export default Login;
