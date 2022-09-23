import {
  getStorageItem,
  initializeStorageWithDefaults,
  setStorageItem,
} from './storage';
import Recording from './feature/Recording';
import Stopwatch from './feature/Stopwatch';

// Log storage changes, might be safely removed
// chrome.storage.onChanged.addListener((changes) => {
//   for (const [key, value] of Object.entries(changes)) {
//     console.log(
//       `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
//     );
//   }
// });

const stopwatch = new Stopwatch();
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

async function openControlTab() {
  const newTab = await chrome.tabs.create({
    active: true,
    url: 'record.html',
  });
  setStorageItem('controlTab', newTab.id);
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'startRecordingCountDown') {
    const recordingManager = new Recording(stopwatch);
    recordingManager.start();
  }
});

chrome.runtime.onMessage.addListener(async (message: MessageTypes) => {
  if (message.type === 'initScreenCapturing') {
    const controlTab = await getStorageItem('controlTab');
    if (!controlTab) {
      openControlTab();
      return;
    }
    try {
      const controlTabAlreadyOpen = await chrome.tabs.get(controlTab);
      chrome.tabs.update(controlTabAlreadyOpen.id, { active: true });
    } catch (e) {
      openControlTab();
    }
    setStorageItem('recordingStatus', 'initScreenCapturing');
  }
});

chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    if (request.type === 'REQUEST_VIDEO_BLOB') {
      const recordingManager = new Recording(stopwatch);
      const recording = await recordingManager.stop();
      sendResponse(recording);
    }
    if (request.type === 'SESSION_CREATED') {
      const { sessionId, recording } = request;
      recording.sessionId = sessionId;
      const tabs = await chrome.tabs.query({ active: true });
      setTimeout(()=>{
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: 'SESSION_CREATED_NEW',
            sessionId: sessionId,
            recording: recording,
          },
          (response) => {
            console.log('response of SESSION_CREATED_NEW', response);
            sendResponse(response);
          },
        );
      }, 1500)
    }
  },
);

chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {
    if (isCurrentTab(details.tabId)) {
      const recordingManager = new Recording(stopwatch);
      await recordingManager.addNavigationDetails(details);
    }
    return details;
  },
  { urls: ['<all_urls>'] },
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
  [],
);

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    if (isCurrentTab(details.tabId)) {
      const recordingManager = new Recording(stopwatch);
      await recordingManager.addEvent({ ...details, type: 'webRequest' });
    }
    return details;
  },
  { urls: ['<all_urls>'] },
  [],
);

chrome.webRequest.onErrorOccurred.addListener(
  async (details) => {
    if (isCurrentTab(details.tabId)) {
      const recordingManager = new Recording(stopwatch);
      await recordingManager.addEvent({ ...details, type: 'webErrorRequest' });
    }
    return details;
  },
  { urls: ['<all_urls>'] },
  [],
);

const theChrome = chrome;

const isCurrentTab = async (tabId: number) => {
  return new Promise((resolve) => {
    theChrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const currentTab = tabs[0];
        resolve(currentTab && currentTab.id === tabId);
      },
    );
  });
};
