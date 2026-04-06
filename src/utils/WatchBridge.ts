import { NativeModules, Platform } from 'react-native';
import type { ActiveWorkout } from '../../types/workout';

const { WatchConnectivityModule } = NativeModules;

const isAvailable = Platform.OS === 'ios' && !!WatchConnectivityModule;

function send(message: Record<string, unknown>): void {
  if (!isAvailable) return;
  WatchConnectivityModule.sendToWatch(message);
}

export const WatchBridge = {
  sendStateUpdate(workout: ActiveWorkout): void {
    send({ type: 'STATE_UPDATE', workout });
  },

  sendRestStarted(exerciseId: string, totalSeconds: number): void {
    send({ type: 'REST_STARTED', exerciseId, totalSeconds });
  },

  sendAdjustRest(delta: number): void {
    send({ type: 'ADJUST_REST', delta });
  },

  sendSkipRest(): void {
    send({ type: 'SKIP_REST' });
  },

  sendEndWorkout(): void {
    send({ type: 'END_WORKOUT' });
  },
};
