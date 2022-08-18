import {Recorder} from './feature/Recorder';

declare global {
  interface Window { localStream?: MediaStream; }
}

chrome.runtime.onMessage.addListener(async function (request) {
  if (request.type === 'startRecording') {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      const audioStream = await navigator.mediaDevices.getUserMedia({audio:true, video:false});
      audioStream.getAudioTracks().forEach(track=>{
        stream.addTrack(track);
      });
      window.localStream = stream;
      const recorder = new Recorder();
      recorder.startRecording();
    } catch (err) {
      /* handle the error */
      console.warn(err);
    }
  }
  if (request.type === 'stopRecording' && window.localStream) {
    window.localStream.getTracks().forEach(track => track.stop());
  }
});
