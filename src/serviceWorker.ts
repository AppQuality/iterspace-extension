import {initializeStorageWithDefaults, setStorageItem} from './storage';

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, value] of Object.entries(changes)) {
    console.log(
      `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
    );
  }
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  console.log('onInstalled listener triggered. Reason:', reason);
  await initializeStorageWithDefaults({
    isRecording:false
  });
  if (reason === "install") {
    await chrome.tabs.create({
      url: process.env.WELCOME_PAGE,
    })
    if (chrome.runtime.setUninstallURL) {
      chrome.runtime.setUninstallURL(process.env.GOODBYE_PAGE)
    }
  }
  console.log('Extension successfully installed!');
})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'startRecording') {
    await chrome.tabs.create({
      active: true,
      url: 'record.html'
    });
    setStorageItem('isRecording', true);
  }
})