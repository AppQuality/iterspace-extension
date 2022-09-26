import Stopwatch from './Stopwatch';
import Recording from './Recording';
import { setStorageItem } from '../storage';

class MessageHandler {
  private controlTabId: number | undefined;
  private recordingManager: Recording;

  constructor(private chromeInstance: typeof chrome) {
    this.recordingManager = new Recording(new Stopwatch());

    this.waitForCountdownFinished();
    this.waitForScreenCaptureStart();
    this.waitForRecordingFinish();
    this.waitForSessionLinkable();

    this.listenForNavigationEvent();
    this.listenForWebRequestEvent();
    this.listenForWebRequestErrorEvent();
  }

  public waitForCountdownFinished() {
    this.onAlarm((alarm) => {
      if (alarm.name === 'startRecordingCountDown') {
        this.recordingManager.start();
      }
    });
  }

  public waitForScreenCaptureStart() {
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'initScreenCapturing') {
        await this.openControlTab();
        setStorageItem('recordingStatus', 'initScreenCapturing');
      }
    });
  }

  public waitForRecordingFinish() {
    this.onExternalMessage(async (request, sendResponse) => {
      if (request.type === 'REQUEST_VIDEO_BLOB') {
        const recording = await this.recordingManager.stop();
        sendResponse(recording);
      }
    });
  }

  public waitForSessionLinkable() {
    this.onExternalMessage(async (request, sendResponse) => {
      if (request.type === 'SESSION_CREATED') {
        const { sessionId, recording } = request;
        recording.sessionId = sessionId;
        const tab = await this.getCurrentTab();
        const sendMessageToContentScript = () =>
          this.chromeInstance.tabs.sendMessage(
            tab.id,
            {
              type: 'SESSION_CREATED_NEW',
              sessionId: sessionId,
              recording: recording,
            },
            (response) => {
              if (response) {
                sendResponse(response);
              } else {
                setTimeout(sendMessageToContentScript, 500);
              }
            },
          );
        sendMessageToContentScript();
      }
    });
  }

  public listenForNavigationEvent() {
    this.chromeInstance.webNavigation.onBeforeNavigate.addListener(
      async (details) => {
        if (await this.isCurrentTab(details.tabId)) {
          await this.recordingManager.addNavigationDetails(details);
        }
        return details;
      },
      { urls: ['<all_urls>'] },
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      [],
    );
  }

  public listenForWebRequestEvent() {
    this.chromeInstance.webRequest.onCompleted.addListener(
      async (details) => {
        if (await this.isCurrentTab(details.tabId)) {
          await this.recordingManager.addEvent({
            ...details,
            type: 'webRequest',
          });
        }
        return details;
      },
      { urls: ['<all_urls>'] },
      [],
    );
  }

  public listenForWebRequestErrorEvent() {
    this.chromeInstance.webRequest.onErrorOccurred.addListener(
      async (details) => {
        if (await this.isCurrentTab(details.tabId)) {
          await this.recordingManager.addEvent({
            ...details,
            type: 'webErrorRequest',
          });
        }
        return details;
      },
      { urls: ['<all_urls>'] },
      [],
    );
  }

  public listenForClickEvent() {
    this.chromeInstance.runtime.onMessage.addListener(
      async (message: MessageTypes) => {
        console.log('internal', message);
      },
    );
  }

  private onAlarm(callback: (alarm: chrome.alarms.Alarm) => void) {
    this.chromeInstance.alarms.onAlarm.addListener(callback);
  }

  private onInternalMessage(
    callback: (message: MessageTypes) => Promise<void>,
  ) {
    this.chromeInstance.runtime.onMessage.addListener(callback);
  }

  private onExternalMessage(
    callback: (
      request: any,
      sendResponse: (response?: any) => void,
    ) => Promise<void>,
  ) {
    this.chromeInstance.runtime.onMessageExternal.addListener(
      async (request, sender, sendResponse) => {
        await callback(request, sendResponse);
      },
    );
  }

  private async isCurrentTab(tabId: number) {
    const currentTab = await this.getCurrentTab();
    return currentTab && currentTab.id === tabId;
  }

  private async getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
    return new Promise((resolve) => {
      this.chromeInstance.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          const currentTab = tabs[0];
          resolve(currentTab);
        },
      );
    });
  }

  private async openControlTab() {
    if (!this.controlTabId) {
      const newTab = await chrome.tabs.create({
        active: true,
        url: 'record.html',
      });
      this.controlTabId = newTab.id;
    } else {
      this.chromeInstance.tabs.update(this.controlTabId, {
        active: true,
      });
    }
  }
}

export default MessageHandler;
