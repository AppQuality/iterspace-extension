import React from 'react';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('iterspaceExtensionRoot');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const capture = () => {
  console.log('capture screen');
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"recordScreen", pippo:"suca"}, function(response){
      console.log("log response from popup",response);
    });
  });
}

root.render(
  <div>
    Iterspace Browser Extension Popup
    <button onClick={capture}>capture</button>
  </div>);
