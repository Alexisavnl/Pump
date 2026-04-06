/* eslint-disable no-undef */
const AppleHealthKit = {
  Constants: {
    Permissions: {
      Workout: 'Workout',
      Steps: 'Steps',
    },
  },
  initHealthKit: jest.fn((_permissions, callback) => callback(null)),
  saveWorkout: jest.fn((_options, callback) => callback(null, {})),
};

const HealthActivity = {
  TraditionalStrengthTraining: 'TraditionalStrengthTraining',
};

module.exports = {
  default: AppleHealthKit,
  ...AppleHealthKit,
  HealthActivity,
};
