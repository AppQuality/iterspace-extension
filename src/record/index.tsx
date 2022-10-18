import { createRoot } from 'react-dom/client';
import React, { useRef } from 'react';
import useRecorder from './useRecorder';
import { ThemeProvider } from '@zendeskgarden/react-theming';
import { theme, MD, XXL } from '@appquality/unguess-design-system';
import logo from './assets/logo.svg';
import { StyledScreenRecorder } from './_styles';

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
      <StyledScreenRecorder>
        <img className="logo" alt="Iterspace" src={logo} />
        <div className='container'>
          <XXL className="title" isBold>
            Preview page by Iterspace
          </XXL>
          <MD>
            <div>You have not entered your work area, but from here you can check what you are actually recording.</div>
            <div>To save the video in the folder you want, log in.</div>
          </MD>
          <video
            autoPlay={true}
            id="recordedStream"
            width="600"
            height="400"
            muted={true}
            ref={videoPreview}
          ></video>
        </div>
      </StyledScreenRecorder>
    </ThemeProvider>
  );
};

root.render(<ScreenRecorder />);
