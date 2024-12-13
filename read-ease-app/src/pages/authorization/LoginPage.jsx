
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from './firebase';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { clientId } from './config';

export default function LoginPage() {
  const navigate = useNavigate();

  // State to hold form data and errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Handle email/password form submission
  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();

    // Check if the email and password are filled in
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    try {
      // Replace with your actual login API request
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // Redirect to the dashboard or main page after successful login
        navigate('/');
      } else {
        // Handle incorrect login credentials
        setErrorMessage('Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('Something went wrong. Please try again later.');
    }
  };

  // Handle Google sign-in
  const handleGoogleLogin = async () => {
    const auth = getAuth();
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;

        console.log('Google Login Successful:', user);
        navigate('/');
      })
      .catch((error) => {
        console.error('Error during Google login:', error);
        setErrorMessage('Google login failed. Please try again later.');
      });
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

      <form onSubmit={handleEmailPasswordLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 border rounded-md mt-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-4 py-2 border rounded-md mt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        {errorMessage && (
          <p className="text-red-500 text-sm mb-4">{errorMessage}</p>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Login
        </button>
      </form>
      <div className="text-center my-4 text-gray-500">or</div>
      <button
        onClick={handleGoogleLogin}
        className="w-full py-2 mb-4 bg-red-500 text-white rounded-md hover:bg-red-600"
      >
        Sign in with Google
      </button>

      
      <div className="mt-4 text-center">
        <p className="text-sm">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:text-blue-700">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
