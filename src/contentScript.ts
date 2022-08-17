console.log('contentScript');

async function getDevices() {

  if (!navigator.mediaDevices?.enumerateDevices) {
    console.log("enumerateDevices() not supported.");
  } else {
    // List cameras and microphones.
    navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
        });
      })
      .catch((err) => {
        console.error(`${err.name}: ${err.message}`);
      });
  }
}

async function getMedia() {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    });
    /* use the stream */
  } catch (err) {
    /* handle the error */
  }
}

chrome.runtime.onMessage.addListener(
  async function(request, sender) {
    console.log('onMessage');
    if (request.type === "recordScreen") {
      console.log("recordScreen", sender);
      getDevices();
    }
  }
);