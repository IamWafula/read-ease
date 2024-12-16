// jest/mocks/chromeApiMock.js
global.chrome = {
  runtime: {
    id: 'mocked-extension-id',
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(), // Ensure addListener is mocked
    },
    lastError: null, // Simulate no runtime errors by default
  },
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      callback([{ id: 1, url: 'http://example.com' }]); // Mock an active tab
    }),
    sendMessage: jest.fn((tabId, message, callback) => {
      if (message.action === 'highlightWords') {
        callback({ status: 'highlighted' }); // Simulate a successful highlight response
      } else if (message.action === 'applyHighlightStyles') {
        callback({ status: 'styles_updated' }); // Simulate a successful style update
      } else {
        callback({ status: 'unknown_action' }); // Simulate an unknown action response
      }
    }),
  },
};
