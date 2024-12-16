import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../src/pages/App';
import { onAuthStateChanged, signOut} from 'firebase/auth';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})), // Mock getAuth function explicitly
  signOut: jest.fn(), // Mock signOut function explicitly
  onAuthStateChanged: jest.fn(), // Keep existing mock
}));


// Mock Chrome APIs
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
          callback({ status: 'highlighted' });
        } else if (message.action === 'applyHighlightStyles') {
          callback({ status: 'styles_updated' });
        } else {
          callback(undefined);
        }
      }),
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();

  onAuthStateChanged.mockImplementation((auth, callback) => {
    callback(null); // Simulate unauthenticated user
    return jest.fn(); // Return a mock unsubscribe function
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
    render(<App />);
    expect(await screen.findByText(/Sign in with Google/i)).toBeInTheDocument();
  });



  test('renders Highlight component if user is authenticated', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    render(<App />);
    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument();
    });
  });

  test('handles logout successfully and clears user state', async () => {
    const mockSignOut = jest.fn().mockResolvedValueOnce(); // Mock successful sign-out
    signOut.mockImplementation(mockSignOut);

    const setUser = jest.fn(); // Mock setUser function

    const handleLogout = () => {
      signOut()
        .then(() => {
          console.log('User signed out successfully.');
          setUser(null); // Clear the user state after logout
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        });
    };

    render(
      <img
        src="logoutIcon.png"
        alt="Logout"
        className="logout-icon"
        onClick={handleLogout}
      />
    );

    const logoutIcon = screen.getByAltText(/logout/i);
    fireEvent.click(logoutIcon);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1); // Ensure signOut was called
      expect(setUser).toHaveBeenCalledWith(null); // Ensure user state is cleared
    });
  });

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
          console.error('Error signing out:', error);
        });
    };

    render(
      <img
        src="logoutIcon.png"
        alt="Logout"
        className="logout-icon"
        onClick={handleLogout}
      />
    );

    const logoutIcon = screen.getByAltText(/logout/i);
    fireEvent.click(logoutIcon);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1); // Ensure signOut was called
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error signing out:', mockError); // Ensure error was logged
    });

    consoleErrorSpy.mockRestore(); // Restore console.error
  });

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
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://main.domwg75nq6jft.amplifyapp.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

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
    expect(logoutIcon).toBeInTheDocument();
  });

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
    expect(logoutIcon).not.toBeInTheDocument();
  });

  test('handles single click to apply highlights', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument();
    });

    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle);

    // Verify highlighting
    await waitFor(() => {
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        expect.any(Number),
        { action: 'highlightWords', color: '#FFD700', opacity: 1 },
        expect.any(Function)
      );
    });
  });

  test('handles Chrome runtime errors gracefully', async () => {
    global.chrome.runtime.lastError = { message: 'Test error' };

    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument();
    });

    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle);

    // Check for error handling
    await waitFor(() => {
      expect(screen.getByText(/Error fetching words./i)).toBeInTheDocument();
    });

    global.chrome.runtime.lastError = null; // Reset mock
  });

  test('handles missing active tab scenario', async () => {
    chrome.tabs.query.mockImplementationOnce((queryInfo, callback) => {
      callback([]); // Simulate no active tabs
    });

    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument();
    });

    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle);

    await waitFor(() => {
      expect(screen.getByText(/No active tab found./i)).toBeInTheDocument();
    });
  });


  test('handles opacity slider changes correctly', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument();
    });

    const slider = document.querySelector('svg[role="slider"]');
    fireEvent.mouseDown(slider);
    fireEvent.mouseMove(slider, { clientX: 100 });
    fireEvent.mouseUp(slider);

    // Verify opacity state update
    const circle = document.querySelector('.highlight-circle');
    const currentStyle = window.getComputedStyle(circle);
    expect(currentStyle.backgroundColor).toContain('rgba');
  });

  test('toggles color picker on double-click', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(mockUser);
      return jest.fn();
    });

    render(<App />);

    await waitFor(() => {
      expect(document.querySelector('.parent-container')).toBeInTheDocument();
    });

    const circle = document.querySelector('.highlight-circle');
    fireEvent.click(circle);
    fireEvent.click(circle);

    const colorOptions = document.querySelectorAll('.color-option');
    expect(colorOptions).toHaveLength(8); // Assuming 8 color options
  });
});




