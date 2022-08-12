import React from 'react';
import { createRoot } from 'react-dom/client';
const container = document.getElementById('iterspaceExtensionRoot');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<div>Iterspace Browser Extension Popup</div>);
