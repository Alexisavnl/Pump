/* eslint-disable no-undef */
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: jest.fn((callback) => {
    callback(null);
    return jest.fn(); // unsubscribe
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithCredential: jest.fn(),
  signOut: jest.fn(),
};

const authModule = jest.fn(() => mockAuth);
authModule.GoogleAuthProvider = {
  credential: jest.fn(() => ({ providerId: 'google.com' })),
};
authModule.OAuthProvider = {
  credential: jest.fn(() => ({ providerId: 'apple.com' })),
};

module.exports = authModule;
module.exports.default = authModule;
