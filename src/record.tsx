import {Recorder} from './feature/Recorder';
import {getStorageData, getStorageItem} from "./storage";
import {createRoot} from "react-dom/client";
import React, {useEffect, useState} from "react";
import * as stream from "stream";
const container = document.getElementById('recordingInterface');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

declare global {
  interface Window { localStream?: MediaStream; }
}

function initVideoPreview (videoStream: MediaStream) {
  const emitterVideo:HTMLVideoElement = document.querySelector('#recordedStream');
  emitterVideo.srcObject = videoStream;
}

async function initRecording () {
  const {isRecording} = await getStorageData();
  if (isRecording) {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      initVideoPreview(stream);
      // eslint-disable-next-line prefer-const
      const audioStream = await navigator.mediaDevices.getUserMedia({audio: {
         echoCancellation: true
        }, video: false});
      audioStream.getAudioTracks().forEach(track => {
        stream.addTrack(track);
      });
      stream.getVideoTracks()[0].onended = function () {
        alert('video stopped')
      };
      window.localStream = stream;
      chrome.alarms.create("startRecordingCountDown", {when: Date.now() + 3000});
    } catch (err) {
      /* handle the error */
      console.warn(err);
    }
  }
}

initRecording();
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "startRecordingCountDown") {
    const recorder = new Recorder();
    recorder.startRecording();
    chrome.runtime.sendMessage({type:"startRecording"});
  }
})
chrome.runtime.onMessage.addListener(async function (request) {
  if (request.type === 'stopRecording' && window.localStream) {
    window.localStream.getTracks().forEach(track => track.stop());
  }
});

const RecordingInterface = () => {
  const [isRecording, setIsRecording] = useState("false");
  useEffect(() => {
    const getInitialRecordingValue = async () => {
      const recording = await getStorageItem('isRecording');
      setIsRecording(recording);
    }
    getInitialRecordingValue();
    chrome.storage.onChanged.addListener((changes) => {
      for (const [key, value] of Object.entries(changes)) {
        if (key === 'isRecording') {
          setIsRecording(value.newValue);
        }
      }
    });
  }, []);
  const startRecording = () => {
    chrome.runtime.sendMessage({type:"startRecording"});
  }
  const stopRecording = () => {
    chrome.runtime.sendMessage({type:"stopRecording"});
  }
  return (
    <div>
      <p>Controls</p>
      {isRecording === "true" && <button onClick={stopRecording}>stop recording</button>}
      {isRecording === "false" && <button onClick={startRecording}>start recording</button>}
      {isRecording === "idle" && <button disabled>waiting</button>}
    </div>
  )
}

root.render(
  <RecordingInterface />
);