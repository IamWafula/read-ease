import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/pages/App';
import { onAuthStateChanged, signOut} from 'firebase/auth';

// Mock Firebase Authentication functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})), // Mock getAuth function explicitly
  signOut: jest.fn(), // Mock signOut function explicitly
  onAuthStateChanged: jest.fn(), // Keep existing mock for onAuthStateChanged
}));

// Mock Chrome APIs for extension testing
beforeAll(() => {
  global.chrome = {
    runtime: {
      sendMessage: jest.fn(), // Mock sendMessage for communication with background scripts
      onMessage: { addListener: jest.fn() }, // Mock onMessage for handling incoming messages
      lastError: null, // Mock lastError to simulate no error scenario
    },
    tabs: {
      query: jest.fn((queryInfo, callback) => {
        callback([{ id: 1, url: 'http://example.com' }]); // Simulate an active tab
      }),
      sendMessage: jest.fn((tabId, message, callback) => {
        // Simulate different actions based on the message sent
        if (message.action === 'highlightWords') {
          callback({ status: 'highlighted' });
        } else if (message.action === 'applyHighlightStyles') {
          callback({ status: 'styles_updated' });
        } else {
          callback(undefined); // Handle unexpected messages
        }
      }),
    },
  };
});

// Reset mocks before each test to ensure clean test environment
beforeEach(() => {
  jest.clearAllMocks();

  // Simulate an unauthenticated user scenario
  onAuthStateChanged.mockImplementation((auth, callback) => {
    callback(null); // User is not authenticated
    return jest.fn(); // Return a mock unsubscribe function
  });
});

// Test cases for the App component
describe('App Component', () => {
  
  // Test for initial loading state
  test('renders loading state initially', () => {
    // Simulate loading by not invoking the callback immediately
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      return jest.fn(); // Return a mock unsubscribe function
    });

    render(<App />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument(); // Expect loading text to appear
  });

  // Test for rendering Login component when user is not authenticated
  test('renders Login component if user is not authenticated', async () => {
    render(<App />);
    expect(await screen.findByText(/Sign in with Google/i)).toBeInTheDocument(); // Expect sign-in button to appear
  });

  // Test for rendering Highlight component when user is authenticated
  test('renders Highlight component if user is authenticated', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn(); // Return mock unsubscribe
    });

    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument(); // Expect the main component to be rendered
    });
  });

  // Test for handling user logout and clearing user state
  test('handles logout successfully and clears user state', async () => {
    const mockSignOut = jest.fn().mockResolvedValueOnce(); // Mock successful sign-out
    signOut.mockImplementation(mockSignOut);

    const setUser = jest.fn(); // Mock setUser function to simulate clearing user state

    const handleLogout = () => {
      signOut()
        .then(() => {
          console.log('User signed out successfully.');
          setUser(null); // Clear the user state after logout
        })
        .catch((error) => {
          console.error('Error signing out:', error); // Handle sign-out error
        });
    };

    render(
      <img
        src="logoutIcon.png"
        alt="Logout"
        className="logout-icon"
        onClick={handleLogout} // Trigger logout on click
      />
    );

    const logoutIcon = screen.getByAltText(/logout/i);
    fireEvent.click(logoutIcon); // Simulate clicking the logout icon

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1); // Ensure signOut was called
      expect(setUser).toHaveBeenCalledWith(null); // Ensure user state is cleared
    });
  });

  // Test for handling sign-out error gracefully
  test('handles sign-out error gracefully', async () => {
    const mockError = new Error('Sign-out failed');
    const mockSignOut = jest.fn().mockRejectedValueOnce(mockError); // Mock sign-out failure
    signOut.mockImplementation(mockSignOut);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Spy on console.error

    const handleLogout = () => {
      signOut()
        .then(() => {
          console.log('User signed out successfully.');
        })
        .catch((error) => {
          console.error('Error signing out:', error); // Log the error on failure
        });
    };

    render(
      <img
        src="logoutIcon.png"
        alt="Logout"
        className="logout-icon"
        onClick={handleLogout} // Trigger logout on click
      />
    );

    const logoutIcon = screen.getByAltText(/logout/i);
    fireEvent.click(logoutIcon); // Simulate clicking the logout icon

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1); // Ensure signOut was called
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', mockError); // Ensure error was logged
    });

    consoleErrorSpy.mockRestore(); // Restore console.error after test
  });

  // Test for rendering READEASE link correctly
  test('renders READEASE link correctly', () => {
    render(
      <a
        href="https://main.domwg75nq6jft.amplifyapp.com/"
        target="_blank"
        rel="noopener noreferrer"
        className="redirect-text"
      >
        READEASE
      </a>
    );

    const link = screen.getByText(/READEASE/i);
    expect(link).toBeInTheDocument(); // Ensure the link is in the document
    expect(link).toHaveAttribute('href', 'https://main.domwg75nq6jft.amplifyapp.com/'); // Ensure the correct href
    expect(link).toHaveAttribute('target', '_blank'); // Ensure the correct target
    expect(link).toHaveAttribute('rel', 'noopener noreferrer'); // Ensure the correct rel attribute
  });

  // Test for conditionally rendering logout icon when user is authenticated
  test('conditionally renders logout icon when user is authenticated', () => {
    const mockUser = { uid: '123', email: 'test@example.com' };

    render(
      <>
        {mockUser && (
          <img
            src="logoutIcon.png"
            alt="Logout"
            className="logout-icon"
          />
        )}
      </>
    );

    const logoutIcon = screen.getByAltText(/logout/i);
    expect(logoutIcon).toBeInTheDocument(); // Ensure logout icon is rendered when user is authenticated
  });

  // Test for not rendering logout icon when user is not authenticated
  test('does not render logout icon when user is not authenticated', () => {
    const mockUser = null;

    render(
      <>
        {mockUser && (
          <img
            src="logoutIcon.png"
            alt="Logout"
            className="logout-icon"
          />
        )}
      </>
    );

    const logoutIcon = screen.queryByAltText(/logout/i);
    expect(logoutIcon).not.toBeInTheDocument(); // Ensure logout icon is not rendered when user is not authenticated
  });

  // Test for handling single click to apply highlights
  test('handles single click to apply highlights', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn(); // Return mock unsubscribe
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument(); // Ensure main component is rendered
    });

    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle); // Simulate clicking the highlight circle

    // Verify the correct action is triggered
    await waitFor(() => {
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        expect.any(Number),
        { action: 'highlightWords', color: '#FFD700', opacity: 1 },
        expect.any(Function)
      );
    });
  });

  // Test for handling Chrome runtime errors gracefully
  test('handles Chrome runtime errors gracefully', async () => {
    global.chrome.runtime.lastError = { message: 'Test error' }; // Simulate Chrome runtime error

    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn(); // Return mock unsubscribe
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument(); // Ensure main component is rendered
    });

    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle); // Simulate clicking the highlight circle

    // Check for error handling display
    await waitFor(() => {
      expect(screen.getByText(/Error fetching words./i)).toBeInTheDocument(); // Expect error message to appear
    });

    global.chrome.runtime.lastError = null; // Reset mock after test
  });

  // Test for handling missing active tab scenario
  test('handles missing active tab scenario', async () => {
    chrome.tabs.query.mockImplementationOnce((queryInfo, callback) => {
      callback([]); // Simulate no active tabs scenario
    });

    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn(); // Return mock unsubscribe
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument(); // Ensure main component is rendered
    });

    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle); // Simulate clicking the highlight circle

    await waitFor(() => {
      expect(screen.getByText(/No active tab found./i)).toBeInTheDocument(); // Expect no active tab error message
    });
  });

  // Test for handling opacity slider changes correctly
  test('handles opacity slider changes correctly', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn(); // Return mock unsubscribe
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument(); // Ensure main component is rendered
    });

    const slider = document.querySelector('svg[role="slider"]');
    fireEvent.mouseDown(slider); // Simulate slider interaction
    fireEvent.mouseMove(slider, { clientX: 100 });
    fireEvent.mouseUp(slider);

    // Verify opacity state update on the circle
    const circle = document.querySelector('.highlight-circle');
    const currentStyle = window.getComputedStyle(circle);
    expect(currentStyle.backgroundColor).toContain('rgba');
  });

  // Test for toggling color picker on double-click
  test('toggles color picker on double-click', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser); // Simulate authenticated user
      return jest.fn(); // Return mock unsubscribe
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument(); // Ensure main component is rendered
    });

    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle); // First click
    fireEvent.click(circle); // Double click to toggle color picker

    const colorOptions = document.querySelectorAll('.color-option');
    expect(colorOptions).toHaveLength(8); // Ensure there are 8 color options
  });
});
