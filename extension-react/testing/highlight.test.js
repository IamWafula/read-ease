import React from 'react'; 
import { render, fireEvent, act } from '@testing-library/react';
import Highlight from '../src/pages/highlight';

describe('Highlight Component - Extended Tests', () => {
  let mockProps;

  // Set up mock props before each test to simulate component behavior
  beforeEach(() => {
    mockProps = {
      globalOpacity: 0.5, // Mock global opacity for the highlight
      setGlobalOpacity: jest.fn(), // Mock function to set global opacity
      setCircles: jest.fn(), // Mock function to update circle states
      circles: [{ color: '#FFD700', isSpeechBubbleOpen: false }], // Mock circles with initial properties
      handleClick: jest.fn(), // Mock click handler for circle clicks
      handleColorChange: jest.fn(), // Mock handler for color change
      progressBarColor: '#FFD700', // Mock progress bar color
      progressLoading: false, // Mock loading state for progress
      statusText: 'Highlighting complete!', // Mock status text
      statusVisible: true, // Mock visibility of the status text
    };
  });

  // Test for opening and closing speech bubble when clicking on a circle and outside the circle
  test('opens and closes speech bubble on circle click and outside click', () => {
    const { container, rerender } = render(<Highlight {...mockProps} />);
    const circle = container.querySelector('.highlight-circle');
    expect(circle).toBeInTheDocument(); // Ensure the circle is rendered

    // Simulate circle click to open speech bubble
    fireEvent.click(circle);
    expect(mockProps.handleClick).toHaveBeenCalled(); // Ensure handleClick is called

    // Update props to simulate speech bubble open
    mockProps.circles[0].isSpeechBubbleOpen = true;
    rerender(<Highlight {...mockProps} />);

    const speechBubble = container.querySelector('.speech-bubble');
    expect(speechBubble).toBeInTheDocument(); // Ensure the speech bubble is rendered

    // Simulate outside click to close speech bubble
    fireEvent.click(document.body);
    expect(mockProps.setCircles).toHaveBeenCalledWith(
      expect.any(Function) // Ensure setCircles is called with the correct argument
    );
  });

  // Test for handling color change when color option is clicked
  test('handles color change when color option is clicked', () => {
    mockProps.circles[0].isSpeechBubbleOpen = true;
    const { container } = render(<Highlight {...mockProps} />);

    const colorOption = container.querySelector('.color-option');
    expect(colorOption).toBeInTheDocument(); // Ensure the color option is rendered

    // Simulate color option click
    fireEvent.click(colorOption);
    expect(mockProps.handleColorChange).toHaveBeenCalledWith(0, expect.any(String)); // Ensure handleColorChange is called with correct arguments
  });

  // Test for updating opacity when dragging the slider
  test('updates opacity when dragging the slider', () => {
    const { container } = render(<Highlight {...mockProps} />);
    const slider = container.querySelector('svg'); // Find the slider element

    // Simulate mouse events for dragging the slider
    fireEvent.mouseDown(slider);
    act(() => {
      fireEvent.mouseMove(slider, { clientX: 100, clientY: 100 }); // Simulate mouse movement
    });
    fireEvent.mouseUp(slider); // Simulate mouse release

    expect(mockProps.setGlobalOpacity).toHaveBeenCalledWith(expect.any(Number)); // Ensure setGlobalOpacity is called with a number
  });

  // Test for rendering the opacity indicator at the correct position
  test('renders correct opacity indicator position', () => {
    const { container } = render(<Highlight {...mockProps} />);

    // Check for the indicator circle's position attributes
    const indicator = container.querySelector('circle');
    expect(indicator).toBeInTheDocument(); // Ensure the indicator circle is rendered
    expect(indicator.getAttribute('cx')).toBeTruthy(); // Ensure cx (x position) is set
    expect(indicator.getAttribute('cy')).toBeTruthy(); // Ensure cy (y position) is set
  });

  // Test for rendering the status text correctly
  test('renders status text correctly', () => {
    const { getByText } = render(<Highlight {...mockProps} />);

    // Check for the status text to be rendered
    expect(getByText('Highlighting complete!')).toBeInTheDocument();
  });

  // Test for toggling speech bubble open/close for multiple circles
  test('speech bubble toggles open/close for multiple circles', () => {
    mockProps.circles = [
      { color: '#FFD700', isSpeechBubbleOpen: false },
      { color: '#00FF00', isSpeechBubbleOpen: false },
    ];
    const { container, rerender } = render(<Highlight {...mockProps} />);
    const circles = container.querySelectorAll('.highlight-circle'); // Get all circle elements
  
    // Click on the first circle
    fireEvent.click(circles[0]);
    expect(mockProps.handleClick).toHaveBeenCalledWith(0); // Ensure handleClick is called with the correct circle index
  
    // Update props to simulate speech bubble open for the first circle
    mockProps.circles[0].isSpeechBubbleOpen = true;
    rerender(<Highlight {...mockProps} />);
    expect(container.querySelector('.speech-bubble')).toBeInTheDocument(); // Ensure speech bubble is rendered
  
    // Click outside to close the speech bubble
    fireEvent.click(document.body);
    expect(mockProps.setCircles).toHaveBeenCalledWith(expect.any(Function)); // Ensure setCircles is called to close speech bubble
  });

  // Test for hexToRgba function producing correct RGBA color values
  test('hexToRgba produces correct RGBA colors', () => {
    const { container } = render(<Highlight {...mockProps} />);
    const circle = container.querySelector('.highlight-circle');
    expect(circle).toBeInTheDocument(); // Ensure the circle is rendered
  
    // Verify the background color style using RGBA conversion
    expect(circle.style.backgroundColor).toBe('rgba(255, 215, 0, 0.5)'); // Based on mockProps color and opacity
  });

  // Test for rendering a progress bar when loading is true
  test('renders progress bar when loading', () => {
    mockProps.progressLoading = true; // Set loading state to true
    const { container } = render(<Highlight {...mockProps} />);

    // Check for progress bar existence
    const progressBar = container.querySelector('.progress-bar-indeterminate');
    expect(progressBar).toBeInTheDocument(); // Ensure the progress bar is rendered
  
    // Utility to convert hex to RGB format
    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgb(${r}, ${g}, ${b})`;
    };
  
    // Verify the progress bar color by converting hex to RGB and comparing
    const expectedRgbColor = hexToRgb(mockProps.progressBarColor);
    expect(progressBar.style.backgroundColor).toBe(expectedRgbColor); // Ensure the correct color is applied to the progress bar
  });
});
