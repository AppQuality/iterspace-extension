import {createRoot} from "react-dom/client";
import React, {useEffect, useState} from "react";
import {Recorder} from './feature/Recorder';
import {getStorageItem} from "./storage";
import {Popup} from "./feature/Popup";

const container = document.getElementById('recordingInterface');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

declare global {
  interface Window { localStream?: MediaStream; }
}

const ScreenRecorder = () => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("stopped");
  const [recorder, setRecorder] = useState<Recorder>(null);
  useEffect(() => {
    const getInitialRecordingValue = async () => {
      const recording = await getStorageItem('recordingStatus');
      setRecordingStatus(recording);
    }
    getInitialRecordingValue();
    chrome.storage.onChanged.addListener((changes) => {
      for (const [key, value] of Object.entries(changes)) {
        if (key === 'recordingStatus') {
          setRecordingStatus(value.newValue);
        }
      }
    });
  }, []);
  const getVideoStream = async () => {
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false
    });
  }
  const initVideoPreview = (videoStream: MediaStream) => {
    const emitterVideo:HTMLVideoElement = document.querySelector('#recordedStream');
    emitterVideo.srcObject = videoStream;
  }
  const getAudioStream = async () => {
    return await navigator.mediaDevices.getUserMedia({audio: {
        echoCancellation: true
      }, video: false});
  }
  const initRecordingSequence = async () => {
    try {
      const stream = await getVideoStream();
      initVideoPreview(stream);
      const audioStream = await getAudioStream();
      audioStream.getAudioTracks().forEach(track => {
        stream.addTrack(track);
      });
      stream.getVideoTracks()[0].onended = function () {
        chrome.runtime.sendMessage<MessageTypes>({type: "stopRecording"});
      };
      setRecorder(new Recorder(stream));
      chrome.alarms.create("startRecordingCountDown", {when: Date.now() + 3000});
      chrome.runtime.sendMessage<MessageTypes>({type: "initCountDown"});
    } catch (err) {
      /* handle the error */
      console.warn(err);
    }
  }
  useEffect(() => {
    if (recordingStatus === "initScreenCapturing") {
      initRecordingSequence();
    }
    if (recordingStatus === "stopped" && recorder) {
      recorder.stopRecording();
    }
    if (recordingStatus === "recording" && recorder) {
      recorder.startRecording();
    }
  }, [recordingStatus]);

  return (
    <div>
      <p>Controls</p>
      <Popup />
    </div>
  )
}

root.render(
  <ScreenRecorder />
);