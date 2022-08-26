import React from 'react';
import { createRoot } from 'react-dom/client';
import {Popup} from "./feature/Popup";
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


root.render(
  <Popup/>
);

