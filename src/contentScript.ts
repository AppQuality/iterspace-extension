import {Recorder} from './feature/Recorder';

async function getDevices() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log('enumerateDevices() not supported.');
  } else {
    // List cameras and microphones.
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          console.log(
            `${device.kind}: ${device.label} id = ${device.deviceId}`,
          );
        });
      })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  }
}

async function getMedia() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    const recorder = new Recorder(stream);
    recorder.startRecording();
  } catch (err) {
    /* handle the error */
    console.warn(err);
  }
}

chrome.runtime.onMessage.addListener(async function (request, sender) {
  console.log('onMessage');
  if (request.type === 'recordScreen') {
    console.log('recordScreen', sender);
    getDevices();
    getMedia();
  }
});
