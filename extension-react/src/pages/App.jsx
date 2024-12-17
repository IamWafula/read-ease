import './App.css';
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';
import Login from './login.jsx';
import Highlight from './highlight.jsx';
import logoutIcon from '../assets/logout.png';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [uid, setUid] = useState(null);

  const [loading, setLoading] = useState(true);
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const [circles, setCircles] = useState([
    { color: '#FFD700', isColorPickerOpen: false }
  ]);
  const [progressBarColor, setProgressBarColor] = useState("#FFD700");
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

  // NEW STATES for Vocabulary and Notes
  const [keywords, setKeywords] = useState([]);
  const [sentences, setSentences] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const uid = currentUser ? currentUser.uid : null;
      if (uid) {
        auth.currentUser.getIdToken().then((token) => {
          setToken(token);
          setUid(uid);
        });
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out successfully.');
        setUser(null);
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  };

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
        setProgressLoading(true);
        setStatusText('Fetching words...');
        setStatusVisible(true);

        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: 'highlightWords',
            color: currentColor,
            opacity: currentOpacity,
            uid: uid,
            auth_token: token
          },
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
              console.log('Highlighting complete');
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

              // Store returned keywords and sentences
              setKeywords(response.keywords || []);
              setSentences(response.sentences || []);

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
      handleDoubleClick(index);
    } else {
      const timeout = setTimeout(() => {
        handleCircleClick(index);
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
          keywords={keywords}
          sentences={sentences}
        />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
