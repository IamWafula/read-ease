import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [globalOpacity, setGlobalOpacity] = useState(1);
  const [activeCircle, setActiveCircle] = useState(null);
  const [circles, setCircles] = useState([
    { color: '#FFD700', isColorPickerOpen: false },
    { color: '#FF69B4', isColorPickerOpen: false },
    { color: '#8A2BE2', isColorPickerOpen: false },
    { color: '#40E0D0', isColorPickerOpen: false },
  ]);

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

  const handleClickOutside = () => {
    setActiveCircle(null);
    setCircles((prevCircles) =>
      prevCircles.map((circle) => ({ ...circle, isColorPickerOpen: false }))
    );
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const hexToRgba = (hex, opacity) => {
    const rgbValues = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
  };

  return (
    <div id="body" onClick={(e) => e.stopPropagation()}>
      <div className="highlight-container">
        {circles.map((circle, index) => (
          <div
            key={index}
            className={`highlight-circle ${activeCircle === index ? 'selected' : ''}`}
            style={{ backgroundColor: hexToRgba(circle.color, globalOpacity) }}
            onClick={(e) => {
              e.stopPropagation();
              handleCircleClick(index);
            }}
          >
            <img
              src="static/img/down_arrow.png"
              className="arrow-icon"
              alt="Dropdown Arrow"
              style={{ display: activeCircle === index ? 'block' : 'none' }}
            />
            <input
              type="color"
              className="color-picker"
              style={{ display: circle.isColorPickerOpen ? 'block' : 'none' }}
              value={circle.color}
              onChange={(e) => handleColorChange(index, e.target.value)}
            />
          </div>
        ))}
      </div>

      <input
        type="range"
        id="opacity-slider"
        min="0"
        max="1"
        step="0.1"
        value={globalOpacity}
        className="custom-opacity-slider"
        onChange={handleOpacityChange}
      />

      <button id="highlight" className="highlight-button"
        onClick={() => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'highlightWords',
              words: ['test', 'the', 'and'], // Example test words
              color : circles[activeCircle].color,
              opacity: globalOpacity,
            });
          });
        }}
      >
        Highlight
      </button>        

    </div>
  );
}

export default App;
