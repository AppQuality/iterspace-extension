import {Recorder} from './feature/Recorder';
import {getStorageData} from "./storage";

declare global {
  interface Window { localStream?: MediaStream; }
}

async function initRecording () {
  const {isRecording} = await getStorageData();
  if (isRecording) {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      const audioStream = await navigator.mediaDevices.getUserMedia({audio: {
         echoCancellation: true
        }, video: false});
      audioStream.getAudioTracks().forEach(track => {
        stream.addTrack(track);
      });
      window.localStream = stream;
      const emitterVideo:HTMLVideoElement = document.querySelector('#recordedStream')
      emitterVideo.srcObject = stream;
      const recorder = new Recorder();
      recorder.startRecording();
    } catch (err) {
      /* handle the error */
      console.warn(err);
    }
  }
}

initRecording();
chrome.runtime.onMessage.addListener(async function (request) {
  if (request.type === 'stopRecording' && window.localStream) {
    window.localStream.getTracks().forEach(track => track.stop());
  }
});
