import { getStorageItem, setStorageItem } from '../storage';
import { v4 as uuidv4 } from 'uuid';
import Stopwatch from './Stopwatch';

class Recording {
  private data;
  private events;
  private stopwatch;
  private chrome;

  STORAGE_ITEM = 'recording';
  STORAGE_ITEM_PAGE_EVENTS = 'recording_pageEvents';
  constructor(stopwatch) {
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
    return this.get();
  }

  getCurrentVideoTime() {
    return this.stopwatch.ms / 1000;
  }

  async addNavigationDetails(details) {
    await this.init();
    if (details.url.startsWith('http')) {
      const eventType =
        details.frameId === 0 && details.parentFrameId === -1
          ? 'navigation'
          : 'webRequest';
      await this.addEvent({
        ...details,
        type: eventType,
      });
    }
  }

  async addEvent(details) {
    this.events.push({
      id: uuidv4(),
      type: details.type,
      url: details.url,
      timestamp: details.timestamp ? Math.round(details.timestamp / 1000) : 0,
      videoTime: this.getCurrentVideoTime(),
      data: {
        statusCode: details.statusCode,
        statusLine: details.statusLine,
        method: details.method,
        ip: details.ip,
        initiator: details.initiator,
        requestType: details.type,
      },
    });
    await this.save();
  }

  async save() {
    setStorageItem(this.STORAGE_ITEM, this.data);
    setStorageItem(this.STORAGE_ITEM_PAGE_EVENTS, this.events);
  }
}

export default Recording;
