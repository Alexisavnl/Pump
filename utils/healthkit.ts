import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
  HealthActivity,
} from 'react-native-health';
import { Platform } from 'react-native';

const PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.Workout],
    write: [AppleHealthKit.Constants.Permissions.Workout],
  },
};

const KCAL_PER_MINUTE = 5; // Rough estimate for strength training

let initialized = false;

export function initHealthKit(): Promise<void> {
  if (Platform.OS !== 'ios') return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (initialized) return resolve();
    AppleHealthKit.initHealthKit(PERMISSIONS, (error) => {
      if (error) {
        reject(new Error(`HealthKit init failed: ${error}`));
        return;
      }
      initialized = true;
      resolve();
    });
  });
}

export interface WorkoutToLog {
  startDate: Date;
  endDate: Date;
  durationSeconds: number;
  totalVolume: number; // kg
}

export function logWorkoutToHealthKit(workout: WorkoutToLog): Promise<void> {
  if (Platform.OS !== 'ios') return Promise.resolve();

  return new Promise((resolve, reject) => {
    const options = {
      type: HealthActivity.TraditionalStrengthTraining,
      startDate: workout.startDate.toISOString(),
      endDate: workout.endDate.toISOString(),
      duration: workout.durationSeconds,
      energyBurned: Math.round((workout.durationSeconds / 60) * KCAL_PER_MINUTE),
      energyBurnedUnit: 'kilocalorie' as const,
    };

    AppleHealthKit.saveWorkout(options, (error: string, _result: HealthValue) => {
      if (error) {
        reject(new Error(`HealthKit saveWorkout failed: ${error}`));
        return;
      }
      resolve();
    });
  });
}
