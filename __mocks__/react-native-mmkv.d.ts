import 'react-native-mmkv';

declare module 'react-native-mmkv' {
  /** Test helper: clears all MMKV instances created by the mock. */
  export function clearAllMMKVInstances(): void;
}
