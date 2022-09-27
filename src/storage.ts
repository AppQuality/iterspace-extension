export function getStorageData(): Promise<ExtensionStorage> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(null, (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve(result as ExtensionStorage);
    });
  });
}

export function setStorageData(data: ExtensionStorage): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve();
    });
  });
}

export function getStorageItem<Key extends keyof ExtensionStorage>(
  key: Key,
): Promise<ExtensionStorage[Key]> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve((result as ExtensionStorage)[key]);
    });
  });
}

export function setStorageItem<Key extends keyof ExtensionStorage>(
  key: Key,
  value: ExtensionStorage[Key],
): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }

      return resolve();
    });
  });
}

export async function initializeStorageWithDefaults(
  defaults: ExtensionStorage,
) {
  const currentStorageData = await getStorageData();
  const newStorageData = Object.assign({}, defaults, currentStorageData);
  await setStorageData(newStorageData);
}
