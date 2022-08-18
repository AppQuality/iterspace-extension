import React from 'react';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('iterspaceExtensionRoot');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const startRecording = () => {
  chrome.runtime.sendMessage({type:"startRecording"});
}
const stopRecording = () => {
  chrome.runtime.sendMessage({type:"stopRecording"});
}

const permissions = async () => {
  const result = await window.navigator.permissions.query({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    name: 'microphone',
  })
  alert(result.state)
}
root.render(
  <div>
    <p>Popup</p>
    <button onClick={startRecording}>start recording</button>
    <button onClick={stopRecording}>stop recording</button>
  </div>);
