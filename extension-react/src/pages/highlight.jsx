// highlight.jsx
import React, { useState, useRef, useEffect } from 'react';

const Highlight = ({
  globalOpacity,
  setGlobalOpacity,
  setCircles,
  circles,
  handleClick,
  handleColorChange,
  progressBarColor,
  progressLoading,
  statusText,
  statusVisible
}) => {
  
  //opacity slider

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
    return parseFloat((normalizedAngle / 330).toFixed(2)); // Scale to [0, 1]
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
  
  const hexToRgba = (hex, opacity) => {
    const rgbValues = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`;
  };

  // Color Palette

  const colorOptions = ['#FF00A2','#FF0000', '#FF9000', '#FFC900', '#FFFF00', '#00FF00', '#00CFFF', '#9B00FF'];

  // Handle outside click to close the speech bubble
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".speech-bubble") && !event.target.closest(".highlight-circle")) {
        setCircles((prevCircles) =>
          prevCircles.map((circle) => ({ ...circle, isSpeechBubbleOpen: false }))
        );
      }
    };
    document.addEventListener("click", handleOutsideClick);
    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseMove = (event) => {
    if (isDragging) setGlobalOpacity(calculateAngle(event));
  };
  const handleMouseUp = () => setIsDragging(false);

  React.useEffect(() => {
    const handleMouseUpOutside = () => setIsDragging(false);
    document.addEventListener('mouseup', handleMouseUpOutside);
    return () => document.removeEventListener('mouseup', handleMouseUpOutside);
  }, []);


    return ( 
      <div id="body" onClick={(e) => e.stopPropagation()}>
        {console.log('Rendering Highlight.jsx')}
        {console.log('Current circles:', circles)}
        
        <div className="parent-container">
          <div className="highlight-opacity-container">
            <svg
              role="slider"
              ref={sliderRef}
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
            >
              <defs>
                <linearGradient id="opacityGradient" gradientUnits="objectBoundingBox">
                  <stop offset="0%" stopColor="rgba(0, 0, 0, 0)" />
                  <stop offset="100%" stopColor="rgba(0, 0, 0, 1)" />
                </linearGradient>
              </defs>

              <path
                d={describeArc(50, 50, 45, 15, 15 + globalOpacity * 330)}
                stroke="darkgray"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />

              <path
                d={describeArc(50, 50, 45, 15 + globalOpacity * 330, 345)}
                stroke="#d3d3d3"
                strokeWidth="10"
                strokeLinecap="round"
                fill="none"
              />

              {(() => {
                const position = getIndicatorPosition(45, globalOpacity);
                return (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="5"
                    fill="white"
                    style={{ cursor: "pointer" }}
                    onMouseDown={handleMouseDown}
                  />
                );
              })()}
            </svg>

            {circles.map((circle, index) => (
              <div
                key={`circle-${index}`}
                className={`highlight-circle selected`}
                aria-label={`highlight-circle-${index}`}
                style={{ backgroundColor: hexToRgba(circle.color, globalOpacity) }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(index);
                }}
              >
              {circle.isSpeechBubbleOpen && (
                <div className="speech-bubble">
                  {colorOptions.map((color, i) => (
                    <div
                      key={`color-option-${i}`}
                      className="color-option"
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleColorChange(index, color);
                      }} 
                    ></div>
                  ))}
                </div>
                )}
              </div>
            ))}
          </div>

          {progressLoading && (
            <div className="progress-bar">
              <div 
              className="progress-bar-indeterminate"
              style={{ backgroundColor: progressBarColor }}
              ></div>
            </div>
          )}
          <div className={`status-text ${statusVisible ? '' : 'hidden'}`}>{statusText}</div>
        </div>
        </div>
      );
    };

export default Highlight;
