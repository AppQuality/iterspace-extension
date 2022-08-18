import React from 'react';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('iterspaceExtensionRoot');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const startRecording = () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"startRecording"}, function(response){
      console.log("log response from popup",response);
    });
  });
}
const stopRecording = () => {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"stopRecording", pippo:"suca"}, function(response){
      console.log("log response from popup",response);
    });
  });
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
