/**
 * Jest mock for react-native-mmkv
 * Uses a simple in-memory Map to simulate MMKV storage.
 * Call clearAllMMKVInstances() in beforeEach to reset state between tests.
 */
const instances = [];

class MMKVMock {
  constructor() {
    this._store = new Map();
    instances.push(this);
  }

  set(key, value) {
    this._store.set(key, String(value));
  }

  getString(key) {
    return this._store.get(key);
  }

  remove(key) {
    this._store.delete(key);
    return true;
  }

  clearAll() {
    this._store.clear();
  }
}

function createMMKV() {
  return new MMKVMock();
}

function clearAllMMKVInstances() {
  instances.forEach((i) => i.clearAll());
}

module.exports = { createMMKV, clearAllMMKVInstances };
