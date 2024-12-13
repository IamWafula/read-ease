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
  const [progressBarColor, setProgressBarColor] = useState("#FFD700"); // Default color


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
    console.log('Single click detected for highlighting:', index);

    // Highlight the text with a single click
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error('No active tab found.');
        return;
      }

      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'highlightWords',
        color: circles[index].color, // Use the clicked circle's color
        opacity: globalOpacity, // Use the global opacity
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
          console.log('Response from content script:', response);
        }
      });
    });

    // Set the active circle index
    setActiveCircle(index);
  };

  const handleDoubleClick = (index) => {
    console.log('Double click detected for toggling color picker:', index);

    // Update the circles state to toggle the color picker for the double-clicked circle
    setCircles((prevCircles) =>
      prevCircles.map((circle, i) => {
        if (i === index) {
          return { ...circle, isColorPickerOpen: !circle.isColorPickerOpen };
        }
        return { ...circle, isColorPickerOpen: false };
      })
    );
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

    if (activeCircle === index) {
      setProgressBarColor(color);
    }
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
      handleDoubleClick={handleDoubleClick}
      handleColorChange={handleColorChange}
      handleOpacityChange={handleOpacityChange}
      hexToRgba={hexToRgba}
      progressBarColor={progressBarColor}
    />
  );
}

export default App;