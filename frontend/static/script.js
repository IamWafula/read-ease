import { auth, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider } from './firebase.js';

// Elements
const loginPage = document.getElementById('login-page');
const mainPage = document.getElementById('main-page');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const colorOptions = document.querySelectorAll('.color-option');

// Initialize Google Auth provider
const provider = new GoogleAuthProvider();

// Handle Firebase user login
loginBtn.addEventListener('click', () => {
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Logged in successfully:", userCredential.user);
      loginPage.classList.add('hidden');
      mainPage.classList.remove('hidden');
    })
    .catch((error) => {
      console.error("Login error:", error);
      alert("Login failed.");
    });
});

// Handle Firebase user registration
registerBtn.addEventListener('click', () => {
  const email = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User registered:", userCredential.user);
      alert("Registration successful. You can now log in.");
    })
    .catch((error) => {
      console.error("Registration error:", error);
      alert("Registration failed.");
    });
});

// Google login
googleLoginBtn.addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Google sign-in successful:", result.user);
      loginPage.classList.add('hidden');
      mainPage.classList.remove('hidden');
    })
    .catch((error) => {
      console.error("Google sign-in error:", error);
      alert("Google sign-in failed.");
    });
});

// Color palette selection
colorOptions.forEach(option => {
  option.addEventListener('click', () => {
    const color = option.dataset.color;
    console.log("Color selected:", color);
    alert(`Color selected: ${color}`);
  });
});

