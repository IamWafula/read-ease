// highlight.jsx
import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ text, style }) => {
  return (
    <div className="tooltip" style={{ 
      position: 'absolute', 
      backgroundColor: '#333', 
      color: '#fff', 
      padding: '5px 10px', 
      borderRadius: '5px', 
      fontSize: '10px', 
      zIndex: 1000, 
      whiteSpace: 'wrap',
      ...style 
    }}>
      {text}
    </div>
  );
};



const Highlight = ({
  globalOpacity, // Current global opacity for highlights
  setGlobalOpacity, // Function to update the global opacity
  setCircles, // Function to update the circle state
  circles, // Array of highlight circles with color and state information
  handleClick, // Function to handle single or double-click events
  handleColorChange, // Function to update the circle color
  progressBarColor, // Color of the progress bar
  progressLoading, // Boolean to control progress bar visibility
  statusText, // Text to display as the current status
  statusVisible,// Boolean to control the visibility of status text
  applyHighlightStyles // Function to apply highlight styles to the selected text
}) => {
  
  // State and references for opacity slider
  const sliderRef = useRef(null); // Reference to the SVG slider element
  const [isDragging, setIsDragging] = useState(false); // Tracks if the opacity slider is being dragged
  const [lastAngle, setLastAngle] = useState(null); // Tracks the last angle for drag direction
  const [tooltip, setTooltip] = useState({ visible: false, text: '', x: 0, y: 0 });

  // Function to calculate the angle for the opacity slider based on mouse movement
  const calculateAngle = (event) => {
    if (!sliderRef.current) return 0; // Exit if the slider is not available
    const rect = sliderRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2, // X-coordinate of the slider center
      y: rect.top + rect.height / 2, // Y-coordinate of the slider center
    };

    // Calculate the raw angle based on the mouse position
    let angle = Math.atan2(event.clientY - center.y, event.clientX - center.x) * (180 / Math.PI);
    angle = (angle + 90) % 360; // Normalize the angle to the range 0-360

    // Handle angle wrapping for smooth slider interaction
    if (angle < 15) angle += 360;
    if (lastAngle !== null) {
      if (angle > lastAngle && angle - lastAngle > 180) {
        angle = Math.max(angle, 15); // Prevent counterclockwise wrapping
      } else if (angle < lastAngle && lastAngle - angle > 180) {
        angle = Math.min(angle, 345); // Prevent clockwise wrapping
      }
    }

    // Clamp the angle within the allowed range (15° to 345°)
    const constrainedAngle = Math.min(Math.max(angle, 15), 345);
    setLastAngle(constrainedAngle); // Save the constrained angle for future calculations

    // Map the constrained angle to an opacity value (0-1)
    const normalizedAngle = constrainedAngle - 15; // Offset to start at 15°
    return parseFloat((normalizedAngle / 330).toFixed(2)); // Scale to [0, 1] with two decimal precision
  };

  // SVG path generator for drawing the arc
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"; // Determine if arc is large
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // Helper function to convert polar coordinates to Cartesian
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0; // Adjust angle for SVG orientation
    return {
      x: centerX + (radius * Math.cos(angleInRadians)), // X-coordinate
      y: centerY + (radius * Math.sin(angleInRadians))  // Y-coordinate
    };
  };

  // Calculate the position of the indicator on the slider arc based on opacity
  const getIndicatorPosition = (radius, opacity) => {
    const startAngle = 15; // Start of the arc
    const endAngle = 345; // End of the arc
    const angle = startAngle + opacity * (endAngle - startAngle); // Map opacity to angle
    return polarToCartesian(50, 50, radius, angle); // Convert to Cartesian coordinates
  };

  // Convert a hex color to RGBA with specified opacity
  const hexToRgba = (hex, opacity) => {
    const rgbValues = hex.match(/\w\w/g).map((x) => parseInt(x, 16)); // Extract RGB values
    return `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${opacity})`; // Return RGBA string
  };

  // Predefined set of color options for the speech bubble
  const colorOptions = ['#FF00A2','#FF0000', '#FF9000', '#FFC900', '#FFFF00', '#00FF00', '#00CFFF', '#9B00FF'];

  // Effect to handle clicks outside the speech bubble
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".speech-bubble") && !event.target.closest(".highlight-circle")) {
        setCircles((prevCircles) =>
          prevCircles.map((circle) => ({ ...circle, isSpeechBubbleOpen: false }))
        );
      }
    };
    document.addEventListener("click", handleOutsideClick); // Add event listener for clicks
    return () => document.removeEventListener("click", handleOutsideClick); // Cleanup on unmount
  }, []);

  // Event handlers for slider interaction
  const handleMouseDown = () => setIsDragging(true); // Start dragging
  const handleMouseMove = (event) => {
    if (isDragging) {
      const newOpacity = calculateAngle(event);
      setGlobalOpacity(newOpacity);
            
      // Show tooltip with opacity percentage
      const percentage = Math.round(newOpacity * 100);
      setTooltip({
        visible: true,
        text: `${percentage}%`,
        x: event.clientX + 10,
        y: event.clientY + 10
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTooltip({ visible: false, text: '', x: 0, y: 0 });
    
    // Add snap effect
    if (globalOpacity === 0 || globalOpacity === 1) {
      sliderRef.current.classList.add('snap-effect');
      setTimeout(() => {
        sliderRef.current?.classList.remove('snap-effect');
      }, 200);
    }
    
    applyHighlightStyles(null, globalOpacity);
  }

  // Effect to detect mouse release outside the slider
  React.useEffect(() => {
    const handleMouseUpOutside = () => setIsDragging(false);
    document.addEventListener('mouseup', handleMouseUpOutside);
    return () => document.removeEventListener('mouseup', handleMouseUpOutside);
  }, []);

  const handleMouseOver = (e, text) => {
    const { clientX: x, clientY: y } = e;
    setTooltip({ visible: true, text, x, y });
  };

  const handleMouseOut = () => {
    setTooltip({ visible: false, text: '', x: 0, y: 0 });
  };

  return ( 
    <div id="body" onClick={(e) => e.stopPropagation()}> {/* Prevent propagation of clicks */}
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
            {/* Gradient for opacity slider */}
            <defs>
              <linearGradient 
                id="opacityGradient" 
                gradientUnits="userSpaceOnUse"
                x1="80" y1="50" 
                x2="20" y2="50"
              >
                <stop offset="0%" stopColor="#d3d3d3" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#808080" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Active arc representing current opacity */}
            <path
              d={describeArc(50, 50, 45, 15, 15 + globalOpacity * 330)}
              stroke="url(#opacityGradient)"
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />

            {/* Inactive arc for the remainder of the slider */}
            <path
              d={describeArc(50, 50, 45, 15 + globalOpacity * 330, 345)}
              stroke="#d3d3d3"
              strokeWidth="10"
              strokeOpacity="0.2"
              strokeLinecap="round"
              fill="none"
            />
            
            {/* Slider indicator */}
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

          {/* Render highlight circles */}
          {circles.map((circle, index) => (
            <div
              key={`circle-${index}`}
              className={`highlight-circle selected`}
              aria-label={`highlight-circle-${index}`}
              style={{ backgroundColor: hexToRgba(circle.color, globalOpacity) }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent bubbling
                handleClick(index); // Handle click events
                }}
                onMouseOver={(e) => {
                setTimeout(() => handleMouseOver(e, `double-click to change color`), 1500);
                }}
                
                onMouseOut={handleMouseOut}
              >
                {/* Render speech bubble for color options */}
              {circle.isSpeechBubbleOpen && (
                <div className="speech-bubble">
                  {colorOptions.map((color, i) => (
                    <div
                      key={`color-option-${i}`}
                      className="color-option"
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent bubbling
                        handleColorChange(index, color); // Update circle color
                      }} 
                    ></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {progressLoading && (
          <div className="progress-bar">
            <div 
              className="progress-bar-indeterminate"
              style={{ backgroundColor: progressBarColor }}
            ></div>
          </div>
        )}

        {/* Status text */}
        <div className={`status-text ${statusVisible ? '' : 'hidden'}`}>{statusText}</div>
      </div>
      {tooltip.visible && (
        <Tooltip text={tooltip.text} style={{ top: tooltip.y, left: tooltip.x }} />
      )}
    </div>
  );
};

export default Highlight;
