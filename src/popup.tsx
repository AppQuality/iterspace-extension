import { theme } from '@appquality/unguess-design-system';
import { ThemeProvider } from '@zendeskgarden/react-theming';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { RecordingController } from './feature/RecordingController';
const container = document.getElementById('iterspaceExtensionRoot');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

root.render(
  <ThemeProvider theme={theme}>
    <RecordingController />
  </ThemeProvider>,
);
