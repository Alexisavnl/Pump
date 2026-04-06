/* eslint-disable no-undef */
const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn().mockResolvedValue(true),
  signIn: jest.fn().mockResolvedValue({ data: { idToken: 'mock-id-token' } }),
  signOut: jest.fn().mockResolvedValue(undefined),
};

module.exports = { GoogleSignin };
