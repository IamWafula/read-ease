// jest/mocks/firebaseAuthMock.js
export const onAuthStateChanged = jest.fn((auth, callback) => {
  callback(null); // Simulate no user by default
  return () => {}; // Ensure it returns a no-op function
});

export const getAuth = jest.fn(() => ({}));

