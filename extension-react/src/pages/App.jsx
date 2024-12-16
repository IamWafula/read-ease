import './App.css';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import Login from './login.jsx';
import Highlight from './highlight.jsx';
import logoutIcon from '../assets/logout.png';

// Main application component
function App() {

  // State management
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [uid, setUid] = useState(null)

  const [loading, setLoading] = useState(true);
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const [circles, setCircles] = useState([
    { color: '#FFD700', isColorPickerOpen: false } // Initial circle with default color
  ]);
  const [progressBarColor, setProgressBarColor] = useState("#FFD700"); // Color of progress bar
  const [progressLoading, setProgressLoading] = useState(false); // Tracks progress bar visibility
  const [statusText, setStatusText] = useState(''); // Text displayed for status messages
  const [statusVisible, setStatusVisible] = useState(true); // Controls visibility of status messages
  const [clickTimeout, setClickTimeout] = useState(null); // Tracks single vs double-click events
  const [lastHighlightSettings, setLastHighlightSettings] = useState({
    color: null, // Last used highlight color
    opacity: null, // Last used opacity
    pageUrl: null, // URL of the last highlighted page
    highlighted: false, // Whether text was highlighted on the last interaction
  });

  // Authentication: Check if user is signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {

      const uid = currentUser ? currentUser.uid : null;
      if (uid) {
        auth.currentUser.getIdToken().then((token) => {
          setToken(token);
          setUid(uid)
        });
      }
      setUser(currentUser);
      setLoading(false);
    });
    console.log(user)
    return () => unsubscribe();
    
  }, []);

  // Render loading state
  if (loading) return <div>Loading...</div>;

  // Render login component if user is not authenticated
  if (!user) return <Login />;

  // Handles user logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully.');
        setUser(null); // Clear user state
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

  // Handles single-click events on highlight circles
  const handleCircleClick = (index) => {
    const currentColor = circles[0].color; // Get current highlight color
    const currentOpacity = globalOpacity; // Get current opacity

    // Query the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error('No active tab found.');
        setStatusText('No active tab found.');
        setStatusVisible(true);
        setTimeout(() => setStatusVisible(false), 2000); // Hide status message
        return;
      }

      const currentPageUrl = tabs[0].url;

      // Check if the current page has already been highlighted
      if (
        lastHighlightSettings.highlighted &&
        lastHighlightSettings.pageUrl === currentPageUrl
      ) {
        // Update highlight styles if color or opacity has changed
        if (
          lastHighlightSettings.color !== currentColor ||
          lastHighlightSettings.opacity !== currentOpacity
        ) {
          console.log('Updating highlight styles...');
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: 'applyHighlightStyles',
              color: currentColor,
              opacity: currentOpacity,
            },
            (response) => {
              if (chrome.runtime.lastError) {
                  console.error('Error sending message:', chrome.runtime.lastError.message);
              } else if (response?.status === 'styles_updated') {
                  console.log('Highlight styles updated successfully.');
                  // Update last highlight settings
                  setLastHighlightSettings((prev) => ({
                    ...prev,
                    color: currentColor,
                    opacity: currentOpacity,
                }));
              } else {
                  console.warn('Unexpected response:', response);
              }
          }
      );

        } else {
          // No changes, do nothing
          console.log('Highlight skipped: Settings unchanged.');
        }
      } else {
        // Proceed to highlight the text by processing it again
          setProgressLoading(true); 
          setStatusText('Fetching words...');  
          setStatusVisible(true);   
  
          chrome.tabs.sendMessage(
            tabs[0].id,
            { action: 'highlightWords', 
              color: currentColor, 
              opacity: currentOpacity, 
              uid: uid,
              auth_token : token
            },
            (response) => {
              if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError.message);
              } else if (response?.status === 'styles_updated') {
                console.log('Highlight styles updated successfully.');
                setLastHighlightSettings((prev) => ({
                  ...prev,
                  color: currentColor,
                  opacity: currentOpacity,
                }));
              } else {
                console.warn('Unexpected response:', response);
              }
            }
          );
        } else {
          console.log('Highlight skipped: Settings unchanged.');
        }
      } else {
        // Highlight text if not already highlighted
        setProgressLoading(true); // Show progress bar
        setStatusText('Fetching words...'); // Set status text
        setStatusVisible(true);

        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'highlightWords', color: currentColor, opacity: currentOpacity },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError.message);
              setProgressLoading(false);
              setStatusText('Error fetching words.');
              setStatusVisible(true);
              setTimeout(() => setStatusVisible(false), 1000);
              return;
            }

            if (response?.status === 'highlighted') {
              console.log('Highlighting complete, hiding progress bar');
              setProgressLoading(false);
              setStatusText('Highlighting complete!');
              setStatusVisible(true);
              setTimeout(() => setStatusVisible(false), 1000);
              setLastHighlightSettings({
                color: currentColor,
                opacity: currentOpacity,
                pageUrl: currentPageUrl,
                highlighted: true,
              });
            } else {
              console.warn('Unexpected response:', response);
              setProgressLoading(false);
            }
          }
        );
      }
    });
  };

  // Handles double-click events to toggle the color picker
  const handleDoubleClick = (index) => {
    console.log('Double click detected for toggling color picker:', index);
    setCircles((prevCircles) =>
      prevCircles.map((circle, i) => {
        if (i === index) {
          return { ...circle, isSpeechBubbleOpen: !circle.isSpeechBubbleOpen };
        }
        return { ...circle, isSpeechBubbleOpen: false };
      })
    );
  };

  // Manages click timing for single vs. double-click differentiation
  const handleClick = (index) => {
    if (clickTimeout) {
      clearTimeout(clickTimeout); // Cancel single-click timeout
      setClickTimeout(null);
      handleDoubleClick(index); // Handle double-click
    } else {
      const timeout = setTimeout(() => {
        handleCircleClick(index); // Handle single-click
        setClickTimeout(null);
      }, 550); // Timeout to differentiate clicks
      setClickTimeout(timeout);
    }
  };

  // Updates color of a specific circle
  const handleColorChange = (index, color) => {
    setCircles((prevCircles) =>
      prevCircles.map((circle, i) => {
        if (i === index) {
          return { ...circle, color, isSpeechBubbleOpen: false };
        }
        return circle;
      })
    );
    setProgressBarColor(color); // Update progress bar color
  };

  // Updates global opacity for highlights
  const handleOpacityChange = (event) => {
    const newOpacity = parseFloat(event.target.value);
    setGlobalOpacity(newOpacity);
  };

  return (
    <div>
      <a
        href="https://main.domwg75nq6jft.amplifyapp.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="redirect-text"
      >
        READEASE
      </a>

      {user && (
        <img
          src={logoutIcon}
          alt="Logout"
          className="logout-icon"
          onClick={handleLogout}
        />
      )}

      {user ? (
        <Highlight
          globalOpacity={globalOpacity}
          setGlobalOpacity={setGlobalOpacity}
          setCircles={setCircles}
          circles={circles}
          handleClick={handleClick}
          handleColorChange={handleColorChange}
          handleOpacityChange={handleOpacityChange}
          progressBarColor={progressBarColor}
          progressLoading={progressLoading}
          statusText={statusText}
          statusVisible={statusVisible}
        />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
