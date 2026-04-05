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

let initialized = false;

export function initHealthKit(): Promise<void> {
  if (Platform.OS !== 'ios') return Promise.resolve();

  return new Promise((resolve, reject) => {
    if (initialized) return resolve();
    AppleHealthKit.initHealthKit(PERMISSIONS, (error) => {
      if (error) {
        reject(new Error(error));
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
      totalEnergyBurned: estimateCalories(workout.durationSeconds),
      totalEnergyBurnedUnit: 'kilocalorie' as const,
    };

    AppleHealthKit.saveWorkout(options, (error: string, _result: HealthValue) => {
      if (error) {
        reject(new Error(error));
        return;
      }
      resolve();
    });
  });
}

// Rough estimate: ~5 kcal/min for strength training
function estimateCalories(durationSeconds: number): number {
  return Math.round((durationSeconds / 60) * 5);
}
