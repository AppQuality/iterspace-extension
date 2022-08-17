
export class Recorder {

    stream: MediaStream;
    options: MediaRecorderOptions;
    recordedChunks: Blob[];
    constructor(stream: MediaStream) {
        this.stream = stream;
        this.options = { mimeType: "video/webm; codecs=vp9" };
        this.recordedChunks = [];

    }

    startRecording() {
        const mediaRecorder = new MediaRecorder(this.stream, this.options);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.recordedChunks.push(event.data);
              console.log(this.recordedChunks);
              this.download();
            } else {
              console.warn("event.data.size <= 0")
            }
          };
        mediaRecorder.start();
    }
    
    download = () => {
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