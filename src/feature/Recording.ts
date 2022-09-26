import { getStorageItem, setStorageItem } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import Stopwatch from './Stopwatch';

type DetailType = {
  frameId?: number;
  parentFrameId?: number;
  url: string;
  timestamp?: number;
  statusCode?: number;
  statusLine?: string;
  method?: string;
  ip?: string;
  initiator?: string;
  error?: string;
};
class Recording {
  private data: any;
  private events: any;
  private stopwatch: Stopwatch;

  STORAGE_ITEM = 'recording' as const;
  STORAGE_ITEM_PAGE_EVENTS = 'recording_pageEvents' as const;
  constructor(stopwatch: Stopwatch) {
    this.stopwatch = stopwatch;
  }

  async init() {
    this.data = await getStorageItem(this.STORAGE_ITEM);
    this.events = (await getStorageItem(this.STORAGE_ITEM_PAGE_EVENTS)) || [];
  }

  async get() {
    await this.init();
    return { ...this.data, pageEvents: { events: this.events } };
  }

  start() {
    setStorageItem('recordingStatus', 'recording');
    this.stopwatch.start();
    this.events = [];
    this.save();
  }

  stop() {
    this.stopwatch.stop();
    return this.get();
  }

  getCurrentVideoTime() {
    return this.stopwatch.ms / 1000;
  }

  async addNavigationDetails(details: DetailType) {
    await this.init();
    const eventType =
      details.frameId === 0 && details.parentFrameId === -1
        ? 'navigation'
        : 'webRequest';
    await this.addDetailsEvent({
      ...details,
      type: eventType,
    });
  }

  async addDetailsEvent(details: DetailType & { type: string }) {
    if (details.url.startsWith('http')) {
      await this.addEvent({
        type: details.type,
        url: details.url,
        timestamp: details.timestamp,
        data: {
          statusCode: details.statusCode,
          statusLine: details.statusLine,
          method: details.method,
          ip: details.ip,
          initiator: details.initiator,
          requestType: details.type,
          error: details.error,
        },
      });
    }
  }

  async addEvent(event: {
    type: string;
    url: string;
    timestamp?: number;
    values?: any;
    data?: any;
  }) {
    this.events.push({
      id: uuidv4(),
      type: event.type,
      url: event.url,
      timestamp: event.timestamp ? Math.round(event.timestamp / 1000) : 0,
      data: event.data,
      videoTime: this.getCurrentVideoTime(),
      values: event.values,
    });
    await this.save();
  }

  async addClickEvent(clickEvent: any) {
    await this.addEvent({
      type: 'click',
      data: clickEvent,
      timestamp: Math.round(new Date().getTime() / 1000),
      url: clickEvent.url,
    });
  }

  async addConsoleLogEvent(event: any) {
    await this.addConsoleEvent('consoleLog', event);
  }
  async addConsoleWarnEvent(event: any) {
    await this.addConsoleEvent('consoleWarn', event);
  }
  async addConsoleDebugEvent(event: any) {
    await this.addConsoleEvent('consoleDebug', event);
  }
  async addConsoleErrorEvent(event: any) {
    await this.addConsoleEvent('consoleError', event);
  }
  async addConsoleInfoEvent(event: any) {
    await this.addConsoleEvent('consoleInfo', event);
  }

  async addConsoleEvent(
    type:
      | 'consoleLog'
      | 'consoleDebug'
      | 'consoleError'
      | 'consoleInfo'
      | 'consoleWarn',
    event: any,
  ) {
    this.addEvent({
      type: type,
      url: event.url,
      values: event.data.values,
      timestamp: Math.round(new Date().getTime() / 1000),
    });
  }

  async save() {
    setStorageItem(this.STORAGE_ITEM, this.data);
    setStorageItem(this.STORAGE_ITEM_PAGE_EVENTS, this.events);
  }
}

export default Recording;
