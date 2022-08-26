import React, {useEffect, useState} from "react";
import {getStorageItem} from "../storage";

export const Popup = () => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("stopped");
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
  const startRecording = () => {
    chrome.runtime.sendMessage<MessageTypes>({type:"initScreenCapturing"});
  }
  const stopRecording = () => {
    chrome.runtime.sendMessage<MessageTypes>({type:"stopRecording"});
  }
  const pauseRecording = () => {
    chrome.runtime.sendMessage<MessageTypes>({type:"pauseRecording"});
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
    </div>
  )
}