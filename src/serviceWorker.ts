import { initializeStorageWithDefaults } from './storage';

const WELCOME_PAGE = "https://www.iterspace.com/welcome";
const GOODBYE_PAGE= "https://www.iterspace.com/goodbye";
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
  if (reason === "update") {
    await chrome.tabs.create({
      url: WELCOME_PAGE,
    })
    if (chrome.runtime.setUninstallURL) {
      chrome.runtime.setUninstallURL(GOODBYE_PAGE)
    }
  }
  console.log('Extension successfully installed!');
})
