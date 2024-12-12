// Highlight.jsx
import React from 'react';

const Highlight = ({
  globalOpacity,
  setGlobalOpacity,
  activeCircle,
  setActiveCircle,
  circles,
  setCircles,
  handleCircleClick,
  handleColorChange,
  handleOpacityChange,
  hexToRgba
}) => {
  const handleClickOutside = () => {
    setActiveCircle(null);
    setCircles((prevCircles) =>
      prevCircles.map((circle) => ({ ...circle, isColorPickerOpen: false }))
    );
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
              color: circles[activeCircle].color,
              opacity: globalOpacity,
            });
          });
        }}
      >
        Highlight
      </button>        
    </div>
  );
};

export default Highlight;