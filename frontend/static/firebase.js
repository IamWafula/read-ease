import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC47y3u6oM8P41MRMu7qyC6e6dn1oSpJt8",
  authDomain: "cs162readease.firebaseapp.com",
  projectId: "cs162readease",
  storageBucket: "cs162readease.appspot.com",
  messagingSenderId: "763128562280",
  appId: "1:763128562280:web:e405157c9c3e985c04b1dd",
  measurementId: "G-SH2YH90EST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();

// Export Firebase services
export { auth, provider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword };
