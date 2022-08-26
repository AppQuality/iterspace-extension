import {createRoot} from "react-dom/client";
import React, {useEffect, useReducer} from "react";
import {Recorder} from './feature/Recorder';
import {getStorageItem, setStorageItem} from "./storage";
import {RecordingController} from "./feature/RecordingController";

const container = document.getElementById('recordingInterface');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

declare global {
  interface Window { localStream?: MediaStream; }
}
type State = {
  recordingStatus: RecordingStatus
  audioStatus: AudioStatus
  recorder: Recorder
}

type Action = {
  type: "setRecorder",
  payload: Recorder
} | {
  type: "setRecordingStatus",
  payload: RecordingStatus
} | {
  type: "setAudioStatus",
  payload: AudioStatus
} | {
  type: "setState",
  payload: {
    recordingStatus: RecordingStatus
    audioStatus: AudioStatus
  }
}

const initialState: State = {
  recordingStatus: "stopped",
  audioStatus: "inactive",
  recorder: null
}

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

const ScreenRecorder = () => {
  const initRecordingSequence = async () => {
    try {
      const stream = await getVideoStream();
      initVideoPreview(stream);
      stream.getVideoTracks()[0].onended = function () {
        setStorageItem('recordingStatus', 'stopped')
      };
      const recorder = new Recorder(stream);
      if (audioStatus === 'active') {
        await recorder.addAudioTrack();
      }
      dispatch({type: "setRecorder", payload: recorder});
      chrome.alarms.create("startRecordingCountDown", {when: Date.now() + 3000});
      setStorageItem('recordingStatus', 'countDown')
    } catch (err) {
      /* handle the error */
      console.warn(err);
    }
  }
  const reducer = (state: State, action: Action): State => {
    switch (action.type) {
      case "setRecorder":
        return {
          recordingStatus: state.recordingStatus,
          audioStatus: state.audioStatus,
          recorder: action.payload
        }
      case "setRecordingStatus":
        if (action.payload === "initScreenCapturing") {
          initRecordingSequence()
        }
        if (action.payload === "stopped") {
          state.recorder.stopRecording();
        }
        if (action.payload === "recording") {
          state.recorder.startRecording();
        }
        return {
          recordingStatus: action.payload,
          audioStatus: (state.audioStatus === 'paused' ? "active" : state.audioStatus),
          recorder: state.recorder
        }
      case 'setAudioStatus':
        if (state.recordingStatus === 'recording' && action.payload === "active") {
          state.recorder.unmuteAudioTrack();
        }
        if (state.recordingStatus === 'recording' && action.payload === "paused") {
          state.recorder.muteAudioTrack();
        }
        return {
          recordingStatus: state.recordingStatus,
          audioStatus: action.payload,
          recorder: state.recorder
        };
      case "setState":
        return {
          recordingStatus: action.payload.recordingStatus,
          audioStatus: action.payload.audioStatus,
          recorder: state.recorder
        };
      default:
        throw new Error();
    }
  }
  const [{audioStatus}, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const getInitialRecordingValue = async () => {
      const recording = await getStorageItem('recordingStatus');
      const audio = await getStorageItem('audioStatus');
      dispatch({type: "setState", payload: {audioStatus: audio, recordingStatus: recording}});
    }
    getInitialRecordingValue();
    chrome.storage.onChanged.addListener((changes) => {
      for (const [key, value] of Object.entries(changes)) {
        if (key === 'recordingStatus') {
          dispatch({type: "setRecordingStatus", payload: value.newValue});
        }
        if (key === 'audioStatus') {
          dispatch({type: "setAudioStatus", payload: value.newValue});
        }
      }
    });
  }, []);

  return (
    <div>
      <p>Controls</p>
      <RecordingController />
    </div>
  )
}

root.render(
  <ScreenRecorder />
);