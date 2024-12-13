// Highlight.jsx
import React, { useState, useRef } from 'react';

const Highlight = ({
  globalOpacity,
  setGlobalOpacity,
  activeCircle,
  setActiveCircle,
  circles,
  setCircles,
  handleCircleClick,
  handleDoubleClick,
  handleColorChange,
  handleOpacityChange,
  hexToRgba
}) => {
  
  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastAngle, setLastAngle] = useState(null);

  const calculateAngle = (event) => {
    if (!sliderRef.current) return 0;
  
    const rect = sliderRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  
    // Calculate the raw angle
    let angle = Math.atan2(event.clientY - center.y, event.clientX - center.x) * (180 / Math.PI);
    angle = (angle + 90) % 360; // Normalize to 0-360
  
    // Adjust for wrapping angles
    if (angle < 15) angle += 360;
  
    // Determine movement direction
    if (lastAngle !== null) {
      if (angle > lastAngle && angle - lastAngle > 180) {
        // Counterclockwise wrap
        angle = Math.max(angle, 15);
      } else if (angle < lastAngle && lastAngle - angle > 180) {
        // Clockwise wrap
        angle = Math.min(angle, 345);
      }
    }
  
    // Clamp angle within 15° to 345°
    const constrainedAngle = Math.min(Math.max(angle, 15), 345);
  
    // Update the last angle for direction tracking
    setLastAngle(constrainedAngle);
  
    // Map the constrained angle to opacity (0–1)
    const normalizedAngle = constrainedAngle - 15; // Offset by start of arc
    return (normalizedAngle / 330).toFixed(2); // Scale to [0, 1]
  };


  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const getIndicatorPosition = (radius, opacity) => {
    const startAngle = 15; // Start of the arc
    const endAngle = 345; // End of the arc
  
    // Map opacity (0–1) to angle
    const angle = startAngle + opacity * (endAngle - startAngle);
  
    // Convert angle to Cartesian coordinates
    return polarToCartesian(50, 50, radius, angle);
  };


  const handleMouseUp = () => setIsDragging(false);

const handleMouseMove = (event) => {
  if (!isDragging) return;

  // Constrain the angle and calculate opacity
  const newOpacity = calculateAngle(event);
  setGlobalOpacity(newOpacity);
};

const handleMouseDown = (event) => {
  setIsDragging(true);

  // Constrain the angle and calculate opacity
  const newOpacity = calculateAngle(event);
  setGlobalOpacity(newOpacity);
};

  React.useEffect(() => {
    const handleMouseUpOutside = () => setIsDragging(false);
    document.addEventListener("mouseup", handleMouseUpOutside);
    return () => document.removeEventListener("mouseup", handleMouseUpOutside);
  }, []);
  

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
      {console.log('Rendering Highlight.jsx')}
      {console.log('Current circles:', circles)}
      {console.log('Current activeCircle:', activeCircle)}
  
      <div className="highlight-container">
        {circles.map((circle, index) => (
          <div
            key={index}
            className={`highlight-circle ${activeCircle === index ? 'selected' : ''}`}
            style={{ backgroundColor: hexToRgba(circle.color, globalOpacity) }}
            onClick={(e) => {
              e.stopPropagation();
              handleCircleClick(index);
  
              // Trigger highlight when a circle is clicked
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) {
                  console.error('No active tab found.');
                  return;
                }
  
                const message = {
                  action: 'highlightWords',
                  color: circles[index]?.color || '#FFFF00', // Default to yellow if undefined
                  opacity: globalOpacity,
                };
  
                console.log('Sending message to content script:', message);
  
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                  if (chrome.runtime.lastError) {
                    console.error('Error sending message:', chrome.runtime.lastError.message);
                  } else {
                    console.log('Response from content script:', response);
                  }
                });
              });
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              handleDoubleClick(index); // Double click for toggling color picker
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


      <svg
        ref={sliderRef}
        width="100"
        height="100"
        viewBox="0 0 100 100"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        >
        {/* Gradient Definition */}
        <defs>
            <linearGradient id="opacityGradient" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="rgba(0, 0, 0, 0)" /> {/* Transparent */}
            <stop offset="100%" stopColor="rgba(0, 0, 0, 1)" /> {/* Fully opaque */}
            </linearGradient>
        </defs>

        {/* Covered Arc */}
        <path
            d={describeArc(50, 50, 45, 15, 15 + globalOpacity * 330)} // Dynamic arc
            stroke="darkgray" // Slightly darker shade for covered part
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
        />

        {/* Remaining Arc */}
        <path
            d={describeArc(50, 50, 45, 15 + globalOpacity * 330, 345)} // Dynamic arc
            stroke="#d3d3d3" // Pale elephant gray for remaining part
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
        />

        {/* Handle (Movable Indicator) */}
        {(() => {
            const position = getIndicatorPosition(45, globalOpacity);
            return (
            <circle
                cx={position.x}
                cy={position.y}
                r="5"
                fill="white"
                stroke="black"
                strokeWidth="2"
                style={{ cursor: "pointer" }}
                onMouseDown={handleMouseDown}
            />
            );
        })()}
    </svg>

      {/* <button id="highlight" className="highlight-button"
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
      </button>         */}
    </div>
  );
};

export default Highlight;