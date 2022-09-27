import { createRoot } from 'react-dom/client';
import React, { useRef } from 'react';
import { RecordingController } from '../feature/RecordingController';
import useRecorder from './useRecorder';
import { ThemeProvider } from '@zendeskgarden/react-theming';
import { theme } from '@appquality/unguess-design-system';

const container = document.getElementById('recordingInterface');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

const ScreenRecorder = () => {
  const videoPreview = useRef<HTMLVideoElement>();
  useRecorder({
    onChanged: (stream) => {
      videoPreview.current.srcObject = stream;
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <p>Controls</p>
      <video
        autoPlay={true}
        id="recordedStream"
        width="600"
        height="400"
        muted={true}
        ref={videoPreview}
      ></video>
      <RecordingController />
    </ThemeProvider>
  );
};

root.render(<ScreenRecorder />);
