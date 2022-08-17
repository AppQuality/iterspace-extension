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
  const recordedChunks: Blob[] = [];

  const download = () => {
    const blob = new Blob(recordedChunks, {
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

  try {
    console.log('start media stream');
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    const options = { mimeType: "video/webm; codecs=vp9" };
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = (event) => {
      console.log("data-available");
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
        console.log(recordedChunks);
        download();
      } else {
        console.warn("event.data.size <= 0")
      }
    };
    mediaRecorder.start();
    setTimeout(()=>{
      //mediaRecorder.stop();
    }, 3000);
    /* use the stream */
  } catch (err) {
    /* handle the error */
    console.warn(err);
  }
}

chrome.runtime.onMessage.addListener(
  async function(request, sender) {
    console.log('onMessage');
    if (request.type === "recordScreen") {
      console.log("recordScreen", sender);
      getDevices();
      getMedia();
    }
  }
);