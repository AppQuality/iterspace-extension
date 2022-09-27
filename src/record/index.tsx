import { createRoot } from 'react-dom/client';
import React, { useRef } from 'react';
import { RecordingController } from '../feature/RecordingController';
import useRecorder from './useRecorder';

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
    <div>
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
    </div>
  );
};

root.render(<ScreenRecorder />);
