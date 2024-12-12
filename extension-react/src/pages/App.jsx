import './App.css';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';
import Login from './login.jsx';
import Highlight from './highlight.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const [activeCircle, setActiveCircle] = useState(null);
  const [circles, setCircles] = useState([
    { color: '#FFD700', isColorPickerOpen: false }
  ]);

  // Auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed, currentUser:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Event handlers
  const handleCircleClick = (index) => {
    setCircles((prevCircles) =>
      prevCircles.map((circle, i) => {
        if (i === index) {
          return { ...circle, isColorPickerOpen: !circle.isColorPickerOpen };
        }
        return { ...circle, isColorPickerOpen: false };
      })
    );
    setActiveCircle(index);
  };

  const handleColorChange = (index, color) => {
    setCircles((prevCircles) =>
      prevCircles.map((circle, i) => {
        if (i === index) {
          return { ...circle, color };
        }
        return circle;
      })
    );
  };
  
  const handleOpacityChange = (event) => {
    setGlobalOpacity(event.target.value);
  };

  const hexToRgba = (hex, opacity) => {
    const rgbValues = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
  };

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Login />;
  }

  return (
    <Highlight
      globalOpacity={globalOpacity}
      setGlobalOpacity={setGlobalOpacity}
      activeCircle={activeCircle}
      setActiveCircle={setActiveCircle}
      circles={circles}
      setCircles={setCircles}
      handleCircleClick={handleCircleClick}
      handleColorChange={handleColorChange}
      handleOpacityChange={handleOpacityChange}
      hexToRgba={hexToRgba}
    />
  );
}

export default App;