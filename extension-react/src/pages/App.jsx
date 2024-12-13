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
  const [progressLoading, setProgressLoading] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);


  // Authentication (State + Effect)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed, currentUser:', currentUser);
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;

  // Event handlers
  const handleCircleClick = (index) => {
    setProgressLoading(true); // Show the progress bar
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error('No active tab found.');
        setProgressLoading(false); // Hide the progress bar on error
        return;
      }
  
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'highlightWords', color: circles[index].color, opacity: globalOpacity },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
            setProgressLoading(false); // Hide the progress bar on error
          } else {
            console.log('Response from content script:', response);
          }
  
          // Hide the progress bar if the highlighting is complete
          if (response?.status === "highlighted") {
            console.log('Highlighting complete, hiding progress bar');
            setProgressLoading(false);
          }
        }
      );
    });
  
    setActiveCircle(index); // Set the active circle
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

  const handleClick = (index) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
      handleDoubleClick(index); // Handle double click
    } else {
      const timeout = setTimeout(() => {
        handleCircleClick(index); // Handle single click
        setClickTimeout(null);
      }, 550);
      setClickTimeout(timeout);
    }
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



  return (
    <Highlight
      globalOpacity={globalOpacity}
      setGlobalOpacity={setGlobalOpacity}
      activeCircle={activeCircle}
      circles={circles}
      handleClick={handleClick}
      handleColorChange={handleColorChange}
      handleOpacityChange={handleOpacityChange}
      progressBarColor={progressBarColor}
      progressLoading={progressLoading}
    />
  );
}

export default App;