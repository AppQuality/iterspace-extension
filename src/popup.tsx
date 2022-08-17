import React from 'react';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('iterspaceExtensionRoot');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const capture = () => {
  console.log('capture screen');
  chrome.runtime.sendMessage({action: "recordScreen"}, function(response) {
    console.log(response);
  });
}

root.render(
  <div>
    Iterspace Browser Extension Popup
    <button onClick={capture}>capture</button>
  </div>);
