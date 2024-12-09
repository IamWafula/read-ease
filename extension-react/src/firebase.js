import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC47y3u6oM8P41MRMu7qyC6e6dn1oSpJt8",
    authDomain: "cs162readease.firebaseapp.com",
    projectId: "cs162readease",
    storageBucket: "cs162readease.firebasestorage.app",
    messagingSenderId: "763128562280",
    appId: "1:763128562280:web:e405157c9c3e985c04b1dd",
    measurementId: "G-SH2YH90EST"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };