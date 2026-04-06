/* eslint-disable no-undef */
const AppleAuthenticationButtonType = { SIGN_IN: 'SIGN_IN', SIGN_UP: 'SIGN_UP' };
const AppleAuthenticationButtonStyle = { WHITE: 'WHITE', BLACK: 'BLACK' };
const AppleAuthenticationScope = { FULL_NAME: 0, EMAIL: 1 };

const { View } = require('react-native');
const { createElement } = require('react');
const AppleAuthenticationButton = jest.fn(({ testID, onPress }) =>
  createElement(View, { testID, onPress })
);

const signInAsync = jest.fn().mockResolvedValue({ identityToken: 'mock-identity-token' });

module.exports = {
  AppleAuthenticationButtonType,
  AppleAuthenticationButtonStyle,
  AppleAuthenticationScope,
  AppleAuthenticationButton,
  signInAsync,
};
