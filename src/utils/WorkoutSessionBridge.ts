import { NativeModules, Platform } from 'react-native';

const { WorkoutSessionModule } = NativeModules;
const isAvailable = Platform.OS === 'ios' && !!WorkoutSessionModule;

export const WorkoutSessionBridge = {
  start(): Promise<void> {
    if (!isAvailable) return Promise.resolve();
    return WorkoutSessionModule.start();
  },
  stop(): void {
    if (!isAvailable) return;
    WorkoutSessionModule.stop();
  },
};
