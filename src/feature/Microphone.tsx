import { getStorageItem, setStorageItem } from '../storage';

class Microphone {
  private tracks: InputDeviceInfo[] = [];
  private isInitialized = false;
  private audioStatus = 'inactive';
  private selectedInput: string | undefined;

  constructor() {
    chrome.storage.onChanged.addListener((changes) => {
      for (const [key, value] of Object.entries(changes)) {
        if (key === 'audioStatus') {
          this.audioStatus = value.newValue;
        }
        if (key === 'audioDeviceId') {
          this.selectedInput = value.newValue;
        }
      }
    });
  }

  async init() {
    this.audioStatus = await getStorageItem('audioStatus');
    this.selectedInput = await getStorageItem('audioDeviceId');
    console.log(this);
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioDevices = devices.filter(
      (device) => device.kind === 'audioinput',
    );
    this.tracks = audioDevices;
    if (this.tracks.length > 0 && !this.selectedInput) {
      this.selectedInput = this.tracks[0].deviceId;
    }
    this.isInitialized = true;
  }

  public ready() {
    return this.isInitialized;
  }

  public isAudioActive() {
    return this.audioStatus === 'active';
  }

  public async activateAudio() {
    await setStorageItem('audioStatus', 'active');
  }

  public async deactivateAudio() {
    await setStorageItem('audioStatus', 'inactive');
  }

  public async toggleAudio() {
    if (this.isAudioActive()) {
      await this.deactivateAudio();
    } else {
      await this.activateAudio();
    }
  }

  public getSelectedInput() {
    return this.selectedInput;
  }

  public async setSelectedInput(input: string) {
    await setStorageItem('audioDeviceId', input);
  }

  getTracks() {
    return this.tracks;
  }

  async getStream() {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        deviceId: {
          exact: this.selectedInput || 'default',
        },
      },
      video: false,
    });
    console.log(audioStream);
    return audioStream;
  }
}

export default Microphone;
