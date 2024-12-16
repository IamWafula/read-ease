// cs162-read-ease/extension-react/src/pages/App.jsx
import './App.css';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.js';
import Login from './login.jsx';
import Highlight from './highlight.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [uid, setUid] = useState(null)


  const [loading, setLoading] = useState(true);
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const [circles, setCircles] = useState([
    { color: '#FFD700', isColorPickerOpen: false }
  ]);
  const [progressBarColor, setProgressBarColor] = useState("#FFD700"); // Default color
  const [progressLoading, setProgressLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [statusVisible, setStatusVisible] = useState(true);
  const [clickTimeout, setClickTimeout] = useState(null);
  const [lastHighlightSettings, setLastHighlightSettings] = useState({
    color: null,
    opacity: null,
    pageUrl: null,
    highlighted: false,
  });

  // New state for storing keywords and sentences
  const [keywords, setKeywords] = useState([]);
  const [sentences, setSentences] = useState([]);

  // Authentication (State + Effect)
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

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!user) return <Login />;

  // Event handlers
  const handleCircleClick = (index) => {
    const currentColor = circles[0].color;
    const currentOpacity = globalOpacity;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        console.error('No active tab found.');
        setStatusText('No active tab found.');
        setStatusVisible(true);
        setTimeout(() => setStatusVisible(false), 2000);
        return;
      }

      const currentPageUrl = tabs[0].url;

      if (
        lastHighlightSettings.highlighted &&
        lastHighlightSettings.pageUrl === currentPageUrl
      ) {
        // Just update styles if needed
        if (
          lastHighlightSettings.color !== currentColor ||
          lastHighlightSettings.opacity !== currentOpacity
        ) {
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
                setProgressLoading(false);
                setStatusText('Error fetching words.');
                setStatusVisible(true);
                setTimeout(() => setStatusVisible(false), 1000);
                return; // Hide the progress bar on error
              } 

            if (response?.status === 'highlighted') {
              console.log('Highlighting complete, hiding progress bar');
              setProgressLoading(false);
              setStatusText('Highlighting complete!');
              setStatusVisible(true);
              setTimeout(() => setStatusVisible(false), 1000);

              // Store the returned keywords and sentences
              setKeywords(response.keywords || []);
              setSentences(response.sentences || []);

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
          return { ...circle, color, isSpeechBubbleOpen: false };
        }
        return circle;
      })
    );

    setProgressBarColor(color);
  };
  
  const handleOpacityChange = (event) => {
    const newOpacity = parseFloat(event.target.value);
    setGlobalOpacity(newOpacity);
  };

  return (
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
      keywords={keywords}
      sentences={sentences}
    />
  );
}

export default App;
