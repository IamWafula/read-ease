import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/pages/App';
import { onAuthStateChanged } from 'firebase/auth';

jest.mock('firebase/auth');

// Mocking Chrome APIs
beforeAll(() => {
  global.chrome = {
    runtime: {
      sendMessage: jest.fn(),
      onMessage: { addListener: jest.fn() },
      lastError: null,
    },
    tabs: {
      query: jest.fn((queryInfo, callback) => {
        callback([{ id: 1, url: 'http://example.com' }]); // Mock an active tab
      }),
      sendMessage: jest.fn((tabId, message, callback) => {
        if (message.action === 'highlightWords') {
          callback({ status: 'highlighted' }); // Simulate highlighting success
        } else if (message.action === 'applyHighlightStyles') {
          callback({ status: 'styles_updated' }); // Simulate style update success
        }
      }),
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();

  // Default `onAuthStateChanged` mock
  onAuthStateChanged.mockImplementation((auth, callback) => {
    callback(null); // Simulate unauthenticated user
    return jest.fn(); // Return a mock function to act as the unsubscribe function
  });  
});

describe('App Component', () => {
    test('renders loading state initially', () => {
      // Simulate loading by not invoking the callback immediately
      onAuthStateChanged.mockImplementationOnce((auth, callback) => {
        return jest.fn(); // Return a mock unsubscribe function
      });
  
      render(<App />);
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

  test('renders Login component if user is not authenticated', async () => {
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(null); // Simulate unauthenticated user
      return jest.fn();
    });

    render(<App />);
    expect(await screen.findByText(/Sign in with Google/i)).toBeInTheDocument();
  });

  test('renders Highlight component if user is authenticated', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn();
    });

    render(<App />);
    await waitFor(() => {
      const highlightContainer = document.querySelector('.parent-container');
      expect(highlightContainer).toBeInTheDocument();
    });
  });

  test('handles double click and toggles color picker', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      const highlightContainer = document.querySelector('.parent-container');
      expect(highlightContainer).toBeInTheDocument();
    });

    // Simulate a double click to toggle the color picker
    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle);
    fireEvent.click(circle);

    // Ensure the color picker is visible
    const colorOptions = document.querySelectorAll('.color-option');
    expect(colorOptions).toHaveLength(8); // Assuming 8 color options
  });

  test('handles opacity change', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      const highlightContainer = document.querySelector('.parent-container');
      expect(highlightContainer).toBeInTheDocument();
    });

    const slider = document.querySelector('svg[role="slider"]');
    fireEvent.mouseDown(slider);
    fireEvent.mouseMove(slider, { clientX: 100, clientY: 100 });
    fireEvent.mouseUp(slider);

    // Verify that opacity value changes in the circles
    const circle = document.querySelector('.highlight-circle');
    const currentStyle = window.getComputedStyle(circle);
    expect(currentStyle.backgroundColor).toContain('rgba');
  });
});
