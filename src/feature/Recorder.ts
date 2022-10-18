import { Decoder, Reader, tools } from 'ts-ebml';
import { v4 as uuidv4 } from 'uuid';
import { setStorageItem } from '../storage';
import getBlobDuration from 'get-blob-duration';
import Microphone from './Microphone';

export class Recorder {
  id: string;
  stream: MediaStream;
  options: MediaRecorderOptions;
  recordedChunks: Blob[];
  mediaRecorder: MediaRecorder;

  constructor(stream: MediaStream) {
    this.stream = stream;
    this.id = uuidv4();
    this.options = { mimeType: 'video/webm; codecs=h264' };
    this.recordedChunks = [];
  }

  startRecording() {
    this.mediaRecorder = new MediaRecorder(this.stream, this.options);
    this.mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      } else {
        console.warn('event.data.size <= 0');
      }
    };
    this.mediaRecorder.onstop = () => {
      this.createBlob();
    };
    this.stream.getTracks().forEach((track) =>
      track.addEventListener("ended", () => {
        setStorageItem('recordingStatus', 'stopped');
        this.mediaRecorder.stop();
      })
    );
    this.mediaRecorder.start();
  }

  private async createBlob() {
    const blob = await this.getSeekableBlob();
    const mediaBlobUrl = URL.createObjectURL(blob);
    const temporaryPage = `${process.env.TEMPORARY_PAGE}/${this.id}`;
    await setStorageItem(`recording`, {
      id: this.id,
      blobUrl: mediaBlobUrl,
      blobCreatedAt: Math.floor(new Date().getTime() / 1000),
    });
    chrome.tabs.create({ url: temporaryPage });
  }

  stopRecording() {
    this.stream.getTracks().forEach((track) => track.stop());
  }
  async addAudioTrack() {
    const audioStream = await this.getAudioStream();
    audioStream.getAudioTracks().forEach((track) => {
      this.stream.addTrack(track);
    });
  }
  async muteAudioTrack() {
    this.stream.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
  }
  async unmuteAudioTrack() {
    this.stream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
  }
  async getAudioStream() {
    const microphone = new Microphone();
    await microphone.init();
    if (!microphone.ready()) {
      throw new Error('microphone is not ready');
    }
    return microphone.getStream();
  }
  async readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          reject(reader.result);
        } else {
          resolve(reader.result);
        }
      };
      reader.onerror = (ev) => {
        reject(ev);
      };
    });
  }
  async getSeekableBlob() {
    const decoder = new Decoder();
    const reader = new Reader();

    const webmBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const buffer = await this.readAsArrayBuffer(webmBlob);
    let elements = decoder.decode(buffer);

    // see https://github.com/legokichi/ts-ebml/issues/33#issuecomment-888800828
    const validEmlType = ['m', 'u', 'i', 'f', 's', '8', 'b', 'd'];
    elements = elements?.filter((elm) => validEmlType.includes(elm.type));
    elements.forEach((elm) => {
      reader.read(elm);
    });
    const duration = await getBlobDuration(webmBlob);

    const refinedMetadataBuf = tools.makeMetadataSeekable(
      reader.metadatas,
      duration * 1000,
      reader.cues,
    );
    const body = buffer.slice(reader.metadataSize);
    return new Blob([refinedMetadataBuf, body], {
      type: webmBlob.type,
    });
  }
  download() {
    const blob = new Blob(this.recordedChunks, {
      type: 'video/webm',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = 'test.webm';
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
