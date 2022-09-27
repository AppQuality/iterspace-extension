import Stopwatch from './Stopwatch';
import Recording from './Recording';
import { setStorageItem } from '../storage';

class MessageHandler {
  private controlTabId: number | undefined;
  private recordingManager: Recording;

  constructor(private chromeInstance: typeof chrome) {
    this.recordingManager = new Recording(new Stopwatch());

    this.waitForInitialization();
    this.waitForAbort();
    this.waitForScreenCaptureStart();
    this.waitForRecordingFinish();
    this.waitForSessionLinkable();

    this.listenForNavigationEvent();
    this.listenForWebRequestEvent();
    this.listenForWebRequestErrorEvent();
    this.listenForClickEvent();

    this.listenForConsoleLog();
    this.listenForConsoleWarn();
    this.listenForConsoleError();
    this.listenForConsoleInfo();
    this.listenForConsoleDebug();
  }

  public waitForInitialization() {
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'startRecording') {
        this.recordingManager.start();
      }
    });
  }

  public waitForAbort() {
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'abortRecording') {
        this.recordingManager.stop();
        setStorageItem('recordingStatus', 'stopped');
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
          await this.recordingManager.addDetailsEvent({
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
          await this.recordingManager.addDetailsEvent({
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
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'iterspace:clickEvent' && message.payload) {
        await this.recordingManager.addEvent({
          type: 'click',
          data: message.payload,
          timestamp: Math.round(new Date().getTime() / 1000),
          url: message.payload.url,
        });
      }
    });
  }

  public listenForConsoleLog() {
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'iterspace:consoleLog' && message.payload) {
        await this.recordingManager.addConsoleLogEvent({
          data: message.payload,
          url: message.payload.url,
        });
      }
    });
  }

  public listenForConsoleWarn() {
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'iterspace:consoleWarn' && message.payload) {
        await this.recordingManager.addConsoleWarnEvent({
          data: message.payload,
          url: message.payload.url,
        });
      }
    });
  }

  public listenForConsoleError() {
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'iterspace:consoleError' && message.payload) {
        await this.recordingManager.addConsoleErrorEvent({
          data: message.payload,
          url: message.payload.url,
        });
      }
    });
  }

  public listenForConsoleInfo() {
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'iterspace:consoleInfo' && message.payload) {
        await this.recordingManager.addConsoleInfoEvent({
          data: message.payload,
          url: message.payload.url,
        });
      }
    });
  }

  public listenForConsoleDebug() {
    this.onInternalMessage(async (message: MessageTypes) => {
      if (message.type === 'iterspace:consoleDebug' && message.payload) {
        await this.recordingManager.addConsoleDebugEvent({
          data: message.payload,
          url: message.payload.url,
        });
      }
    });
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
