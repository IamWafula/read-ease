import React from 'react'; 
import { render, fireEvent } from '@testing-library/react';
import Highlight from '../src/pages/highlight';

describe('Highlight Component', () => {
  const mockProps = {
    globalOpacity: 1,
    setGlobalOpacity: jest.fn(),
    setCircles: jest.fn(),
    circles: [{ color: '#FFD700', isColorPickerOpen: false }],
    handleClick: jest.fn(),
    handleColorChange: jest.fn(),
    handleOpacityChange: jest.fn(),
    progressBarColor: '#FFD700',
    progressLoading: false,
    statusText: 'Highlighting complete!',
    statusVisible: true,
  };

  test('renders opacity slider and circles', () => {
    const { getByText, container } = render(<Highlight {...mockProps} />);
    
    // Check for status text
    expect(getByText('Highlighting complete!')).toBeInTheDocument();

    // Check for slider using classname
    const slider = container.querySelector('.highlight-opacity-container svg');
    expect(slider).toBeInTheDocument();

    // Check for circle using classname
    const circle = container.querySelector('.highlight-circle');
    expect(circle).toBeInTheDocument();
  });

  test('calls handleClick when circle is clicked', () => {
    const { container } = render(<Highlight {...mockProps} />);
    
    // Find circle by classname and simulate click
    const circle = container.querySelector('.highlight-circle');
    fireEvent.click(circle);

    // Check if handleClick was called
    expect(mockProps.handleClick).toHaveBeenCalled();
  });

  test('calls handleOpacityChange on slider interaction', () => {
    const { container } = render(<Highlight {...mockProps} />);
    
    // Find slider by classname
    const slider = container.querySelector('.highlight-opacity-container svg');
    
    // Simulate slider interaction
    fireEvent.mouseDown(slider);
    fireEvent.mouseMove(slider, { clientX: 200, clientY: 200 }); // Simulate movement
    fireEvent.mouseUp(slider);
    
    // Check if setGlobalOpacity was called with any number
    expect(mockProps.setGlobalOpacity).toHaveBeenCalledWith(expect.any(Number));
  });
});
