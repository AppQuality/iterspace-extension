
export class Recorder {
  stream: MediaStream;
  options: MediaRecorderOptions;
  recordedChunks: Blob[];
  mediaRecorder: MediaRecorder;

  constructor(stream: MediaStream) {
    this.stream = stream;
    this.options = { mimeType: "video/webm; codecs=h264" };
    this.recordedChunks = [];
  }
  startRecording() {
    this.mediaRecorder = new MediaRecorder(this.stream, this.options);
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
  stopRecording() {
    this.stream.getTracks().forEach(track => track.stop());
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