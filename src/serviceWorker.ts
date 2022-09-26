import { initializeStorageWithDefaults } from './storage';

import MessageHandler from './feature/MessageHandler';

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  console.log('onInstalled listener triggered. Reason:', reason);
  await initializeStorageWithDefaults({
    recordingStatus: 'stopped',
    audioStatus: 'inactive',
  });
  if (reason === 'install') {
    await chrome.tabs.create({
      url: process.env.WELCOME_PAGE,
    });
    if (chrome.runtime.setUninstallURL) {
      chrome.runtime.setUninstallURL(process.env.GOODBYE_PAGE);
    }
  }
});

new MessageHandler(chrome);
