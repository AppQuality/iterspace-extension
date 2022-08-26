import {getStorageItem, initializeStorageWithDefaults, setStorageItem} from './storage';

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
    recordingStatus: "stopped"
  });
  if (reason === "install") {
    await chrome.tabs.create({
      url: process.env.WELCOME_PAGE,
    })
    if (chrome.runtime.setUninstallURL) {
      chrome.runtime.setUninstallURL(process.env.GOODBYE_PAGE)
    }
  }
})

async function openControlTab() {
  const newTab = await chrome.tabs.create({
    active: true,
    url: 'record.html'
  });
  setStorageItem('controlTab', newTab.id);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "startRecordingCountDown") {
    setStorageItem('recordingStatus', "recording");
  }
})

chrome.runtime.onMessage.addListener(async (message: MessageTypes) => {
  if (message.type === 'startRecording') {
    setStorageItem('recordingStatus', "recording");
  }
  if (message.type === 'initScreenCapturing') {
    const controlTab = await getStorageItem('controlTab');
    console.log(controlTab);
    if (!controlTab) {
      openControlTab();
      return;
    }
    try {
      const controlTabAlreadyOpen = await chrome.tabs.get(controlTab);
      console.log(controlTabAlreadyOpen);
      chrome.tabs.update(controlTabAlreadyOpen.id, {active: true});
    } catch (e) {
      openControlTab();
    }
    setStorageItem('recordingStatus', "initScreenCapturing");
  }
  if (message.type === 'initCountDown') {
    setStorageItem('recordingStatus', "countDown");
  }
  if (message.type === 'stopRecording') {
    setStorageItem("recordingStatus", "stopped");
  }
  if (message.type === 'pauseRecording') {
    setStorageItem("recordingStatus", "paused");
  }
})