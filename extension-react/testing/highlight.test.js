import React from 'react'; 
import { render, fireEvent, act } from '@testing-library/react';
import Highlight from '../src/pages/highlight';

describe('Highlight Component - Extended Tests', () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      globalOpacity: 0.5,
      setGlobalOpacity: jest.fn(),
      setCircles: jest.fn(),
      circles: [{ color: '#FFD700', isSpeechBubbleOpen: false }],
      handleClick: jest.fn(),
      handleColorChange: jest.fn(),
      progressBarColor: '#FFD700',
      progressLoading: false,
      statusText: 'Highlighting complete!',
      statusVisible: true,
    };
  });

  test('opens and closes speech bubble on circle click and outside click', () => {
    const { container, rerender } = render(<Highlight {...mockProps} />);
    const circle = container.querySelector('.highlight-circle');
    expect(circle).toBeInTheDocument();

    // Simulate circle click to open speech bubble
    fireEvent.click(circle);
    expect(mockProps.handleClick).toHaveBeenCalled();

    // Update props to simulate speech bubble open
    mockProps.circles[0].isSpeechBubbleOpen = true;
    rerender(<Highlight {...mockProps} />);

    const speechBubble = container.querySelector('.speech-bubble');
    expect(speechBubble).toBeInTheDocument();

    // Simulate outside click to close speech bubble
    fireEvent.click(document.body);
    expect(mockProps.setCircles).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  test('handles color change when color option is clicked', () => {
    mockProps.circles[0].isSpeechBubbleOpen = true;
    const { container } = render(<Highlight {...mockProps} />);

    const colorOption = container.querySelector('.color-option');
    expect(colorOption).toBeInTheDocument();

    // Simulate color option click
    fireEvent.click(colorOption);
    expect(mockProps.handleColorChange).toHaveBeenCalledWith(0, expect.any(String));
  });

  
  test('updates opacity when dragging the slider', () => {
    const { container } = render(<Highlight {...mockProps} />);
    const slider = container.querySelector('svg');

    // Simulate mouse events for dragging
    fireEvent.mouseDown(slider);
    act(() => {
      fireEvent.mouseMove(slider, { clientX: 100, clientY: 100 });
    });
    fireEvent.mouseUp(slider);

    expect(mockProps.setGlobalOpacity).toHaveBeenCalledWith(expect.any(Number));
  });

  test('renders correct opacity indicator position', () => {
    const { container } = render(<Highlight {...mockProps} />);

    // Check for indicator circle position
    const indicator = container.querySelector('circle');
    expect(indicator).toBeInTheDocument();
    expect(indicator.getAttribute('cx')).toBeTruthy();
    expect(indicator.getAttribute('cy')).toBeTruthy();
  });

  test('renders status text correctly', () => {
    const { getByText } = render(<Highlight {...mockProps} />);

    // Check for status text
    expect(getByText('Highlighting complete!')).toBeInTheDocument();
  });
  
  
  test('speech bubble toggles open/close for multiple circles', () => {
    mockProps.circles = [
      { color: '#FFD700', isSpeechBubbleOpen: false },
      { color: '#00FF00', isSpeechBubbleOpen: false },
    ];
    const { container, rerender } = render(<Highlight {...mockProps} />);
    const circles = container.querySelectorAll('.highlight-circle');
  
    // Click on first circle
    fireEvent.click(circles[0]);
    expect(mockProps.handleClick).toHaveBeenCalledWith(0);
  
    // Update props to simulate speech bubble open for first circle
    mockProps.circles[0].isSpeechBubbleOpen = true;
    rerender(<Highlight {...mockProps} />);
    expect(container.querySelector('.speech-bubble')).toBeInTheDocument();
  
    // Click outside to close
    fireEvent.click(document.body);
    expect(mockProps.setCircles).toHaveBeenCalledWith(expect.any(Function));
  });
  
  test('hexToRgba produces correct RGBA colors', () => {
    const { container } = render(<Highlight {...mockProps} />);
    const circle = container.querySelector('.highlight-circle');
    expect(circle).toBeInTheDocument();
  
    // Verify style applied with proper RGBA conversion
    expect(circle.style.backgroundColor).toBe('rgba(255, 215, 0, 0.5)'); // Based on mockProps
  });
  
  test('renders progress bar when loading', () => {
    mockProps.progressLoading = true;
    const { container } = render(<Highlight {...mockProps} />);
  
    // Check progress bar existence
    const progressBar = container.querySelector('.progress-bar-indeterminate');
    expect(progressBar).toBeInTheDocument();
  
    // Utility to convert hex to RGB
    const hexToRgb = (hex) => {
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgb(${r}, ${g}, ${b})`;
    };
  
    // Verify progress bar color
    const expectedRgbColor = hexToRgb(mockProps.progressBarColor);
    expect(progressBar.style.backgroundColor).toBe(expectedRgbColor);
  });
  
  
});