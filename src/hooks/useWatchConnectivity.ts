import { useEffect } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const { WatchConnectivityModule } = NativeModules;

export type WatchMessage =
  | { type: 'COMPLETE_SET'; exerciseId: string; setIndex: number }
  | {
      type: 'UPDATE_SET';
      exerciseId: string;
      setIndex: number;
      field: 'kg' | 'reps';
      value: number;
    }
  | { type: 'SKIP_REST' }
  | { type: 'ADJUST_REST'; delta: number }
  | { type: 'END_WORKOUT' }
  | { type: 'ABANDON_WORKOUT' };

type MessageHandler = (message: WatchMessage) => void;

export function useWatchConnectivity(onMessage: MessageHandler): void {
  useEffect(() => {
    if (Platform.OS !== 'ios' || !WatchConnectivityModule) return;
    const emitter = new NativeEventEmitter(WatchConnectivityModule);
    const subscription = emitter.addListener('WatchMessage', onMessage);
    return () => subscription.remove();
  }, [onMessage]);
}
