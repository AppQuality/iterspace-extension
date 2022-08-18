
export class Recorder {
  stream: MediaStream;
  options: MediaRecorderOptions;
  recordedChunks: Blob[];
  mediaRecorder: MediaRecorder;

  constructor() {
    if (!window.localStream) {
      console.warn('there is no stream initialized, abort new Record initialization');
      return;
    }
    window.localStream;
    this.options = { mimeType: "video/webm; codecs=h264" };
    this.recordedChunks = [];
  }
  startRecording() {
    this.mediaRecorder = new MediaRecorder(window.localStream, this.options);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
        this.download();
      } else {
        console.warn("event.data.size <= 0")
      }
    };
    this.mediaRecorder.start();
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