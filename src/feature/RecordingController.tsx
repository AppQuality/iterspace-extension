import React, {useEffect, useState} from "react";
import {getStorageItem, setStorageItem} from "../storage";
import {ToggleAudioButton} from "./ToggleAudioButton";

export const RecordingController = () => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("stopped");
  const [micPermission, setMicPermission] = useState<PermissionState>("denied");
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("inactive");
  useEffect(() => {
    const getInitialRecordingValue = async () => {
      const recording = await getStorageItem('recordingStatus');
      const audio = await getStorageItem('audioStatus');
      setRecordingStatus(recording);
      setAudioStatus(audio);
    }
    const getMicrophonePermissions = async () => {
      const response = await window.navigator.permissions.query({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name: 'microphone',
      })
      setMicPermission(response.state);
    }
    getInitialRecordingValue();
    getMicrophonePermissions();
    chrome.storage.onChanged.addListener((changes) => {
      for (const [key, value] of Object.entries(changes)) {
        if (key === 'recordingStatus') {
          setRecordingStatus(value.newValue);
        }
        if (key === 'audioStatus') {
          setAudioStatus(value.newValue);
        }
      }
    });
  }, []);
  const startRecording = () => {
    chrome.runtime.sendMessage<MessageTypes>({type:"initScreenCapturing"});
  }
  const stopRecording = () => {
    setStorageItem("recordingStatus", "stopped");
  }
  const pauseRecording = () => {
    setStorageItem("recordingStatus", "paused");
  }
  return (
    <div>
      <p>Capture Screen</p>
      {recordingStatus === "recording" &&
      <>
        <button onClick={stopRecording}>stop</button> <button onClick={pauseRecording}>pause</button>
      </>
      }
      {recordingStatus === "stopped" && <button onClick={startRecording}>start</button>}
      {recordingStatus === "countDown" &&
      <>
        <span>starting 3.. 2.. 1..</span> <button onClick={stopRecording}>stop</button>
      </>
      }
      {recordingStatus === "initScreenCapturing" &&
      <>
        <span>waiting</span> <button onClick={stopRecording}>stop</button>
      </>
      }
      <div>
        <p>Audio</p>
        {micPermission === "denied"
         ? <>
             <button disabled>mic denied</button>
           </>
         : <ToggleAudioButton audioStatus={audioStatus} recordingStatus={recordingStatus} />
        }
      </div>
    </div>
  )
}