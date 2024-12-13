import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from './firebase';
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider } from 'firebase/auth';

export default function SignupPage() {
  // States for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation


  const handleSubmit = async (e) => {
    e.preventDefault();
 

    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const auth = getAuth();
    try {
      // Create a new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile to include their name
      await updateProfile(user, { displayName: name });

      // Retrieve the Firebase ID token
      const idToken = await user.getIdToken();

      console.log("Signup successful:", user);
      console.log("ID Token:", idToken);

      // Optionally, store ID token in localStorage or pass it to your backend
      localStorage.setItem("idToken", idToken);

      // Redirect to another page after signup
      navigate('/');
    } catch (error) {
      console.error("Error during signup:", error.message);
      // Check for specific error codes
      if (error.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters long.");
      } else if (error.code === 'auth/email-already-in-use') {
        setError("Email is already in use. Please try logging in or use a different email.");
      } else {
        setError("Signup failed. Please try again later.");
      }
    }
  };



  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Create an Account</h2>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-gray-700 font-semibold mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirm-password" className="block text-gray-700 font-semibold mb-1">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200">
              Sign Up
            </button>
          </div>
        </form>

        <div className="mt-4 text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Log In
          </a>
        </div>
      </div>
    </div>
  );
}
