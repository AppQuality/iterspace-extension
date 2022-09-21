import { Decoder, Reader, tools } from 'ts-ebml'
import { v4 as uuidv4 } from 'uuid';
import {setStorageItem} from "../storage";

export class Recorder {
  id: string;
  stream: MediaStream;
  options: MediaRecorderOptions;
  recordedChunks: Blob[];
  mediaRecorder: MediaRecorder;

  constructor(stream: MediaStream) {
    this.stream = stream;
    this.id = uuidv4();
    this.options = { mimeType: "video/webm; codecs=h264" };
    this.recordedChunks = [];
  }
  startRecording() {
    this.mediaRecorder = new MediaRecorder(this.stream, this.options);
    this.mediaRecorder.ondataavailable = async (event) => {
      if (event.data.size > 0) {

        this.recordedChunks.push(event.data);
        //this.download();
        const blob = new Blob(this.recordedChunks, {
          type: 'video/webm',
        });
        //const upload = new UploadS3(blob, this.id);
        //upload.startMultiUpload();
        const mediaBlobUrl = URL.createObjectURL(blob);
        const newURL = `http://localhost:3000/temporary/${this.id}`;
        await setStorageItem(`recording`, {
          id: this.id,
          blobUrl: mediaBlobUrl,
          blobCreatedAt: Math.floor(new Date().getTime() / 1000)
        });
        chrome.tabs.create({ url: newURL })
        // this.makeVideoSeekable(this.recordedChunks).then(refinedBlob => {
        //   const mediaBlobUrl = URL.createObjectURL(refinedBlob);
        //   const newURL = `https://develop.iterspace.com/temporary/${this.id}`;
        //   setStorageItem(`recording`, {
        //     id: this.id,
        //     blobUrl: mediaBlobUrl,
        //     blobCreatedAt: Math.floor(new Date().getTime() / 1000)
        //   });
        //   chrome.tabs.create({ url: newURL })
        // })
      } else {
        console.warn("event.data.size <= 0")
      }
    };
    this.mediaRecorder.start();
  }
  stopRecording() {
    this.stream.getTracks().forEach(track => track.stop());
  }
  async addAudioTrack() {
    const audioStream = await this.getAudioStream();
    audioStream.getAudioTracks().forEach(track => {
      this.stream.addTrack(track);
    });
  }
  async muteAudioTrack() {
    this.stream.getAudioTracks().forEach(track => {
      console.log("mute audio",track);
      track.enabled = false;
    })
  }
  async unmuteAudioTrack() {
    this.stream.getAudioTracks().forEach(track => {
      console.log("mute audio", track);
      track.enabled = true;
    })
  }
  async getAudioStream() {
    return await navigator.mediaDevices.getUserMedia({audio: {
        echoCancellation: true
      }, video: false});
  }
  async readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(blob)
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          reject(reader.result);
        } else {
          resolve(reader.result)
        }
      }
      reader.onerror = ev => {
        reject(ev)
      }
    })
  }
  async makeVideoSeekable(chunks: Blob[]) {
    const decoder = new Decoder()
    const reader = new Reader()

    const webmBlob = new Blob(chunks, { type: 'video/webm' });
    const buffer = await this.readAsArrayBuffer(webmBlob);
    let elements = decoder.decode(buffer);

    // see https://github.com/legokichi/ts-ebml/issues/33#issuecomment-888800828
    const validEmlType = ['m', 'u', 'i', 'f', 's', '8', 'b', 'd']
    elements = elements?.filter(elm => validEmlType.includes(elm.type))
    elements.forEach(elm => {
      reader.read(elm)
    })

    const refinedMetadataBuf = tools.makeMetadataSeekable(
      reader.metadatas,
      reader.duration,
      reader.cues
    )
    const webMBuf = await this.readAsArrayBuffer(webmBlob)
    const body = webMBuf.slice(reader.metadataSize)
    return new Blob([refinedMetadataBuf, body], {
      type: webmBlob.type,
    })
  }
  download() {
    const blob = new Blob(this.recordedChunks, {
      type: "video/webm"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "test.webm";
    a.click();
    window.URL.revokeObjectURL(url);
  }
}