import React, {useEffect, useState} from 'react';
import { createRoot } from 'react-dom/client';
import {getStorageItem} from "./storage";
const container = document.getElementById('iterspaceExtensionRoot');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const permissions = async () => {
  const result = await window.navigator.permissions.query({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    name: 'microphone',
  })
  alert(result.state)
}
const Popup = () => {
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
    chrome.runtime.sendMessage({type:"initRecordingSequence"});
  }
  const stopRecording = () => {
    chrome.runtime.sendMessage({type:"stopRecording"});
  }
  return (
    <div>
      <p>Popup</p>
      {isRecording === "true" && <button onClick={stopRecording}>stop capture screen</button>}
      {isRecording === "false" && <button onClick={startRecording}>start capture screen</button>}
      {isRecording === "idle" &&
        <>
          <button disabled>waiting</button>
          <button onClick={stopRecording}>stop capture screen</button>
        </>
      }
    </div>
  )
}

root.render(
  <Popup/>
);

