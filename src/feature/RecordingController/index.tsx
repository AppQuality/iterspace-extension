import { Button, MD } from '@appquality/unguess-design-system';
import React from 'react';
import { ToggleAudioButton } from '../ToggleAudioButton';
import logoIcon from '../assets/logo.svg';
import recordingIcon from '../assets/iconLeft.svg';
import closeButton from '../assets/closeButton.svg';
import { StyledPopupBody, StyledPopupHeader } from '../_styles';
import { palette } from '../../theme/palette';
import useRecordingStatus from './useRecordingStatus';
import useAudioStatus from './useAudioStatus';

export const RecordingController = () => {
  const { recordingStatus, startRecording, stopRecording } =
    useRecordingStatus();
  const { audioStatus, micPermission } = useAudioStatus();

  return (
    <div>
      <StyledPopupHeader>
        <div className="header-left">
          <img alt="Iterspace" src={logoIcon} />
          <MD className="title" isBold>
            New screen recording
          </MD>
        </div>
        <div className="header-right">
          <img alt="Close" src={closeButton} onClick={() => window.close()} />
        </div>
      </StyledPopupHeader>
      <StyledPopupBody>
        {micPermission === 'denied' || micPermission === 'prompt' ? (
          <Button
            className="generic-button"
            themeColor={palette.grey[900]}
            isStretched
          >
            Activate Microphone
          </Button>
        ) : (
          <ToggleAudioButton audioStatus={audioStatus} />
        )}
        <Button
          className="generic-button"
          themeColor={palette.grey[900]}
          onClick={
            recordingStatus === 'recording' ? stopRecording : startRecording
          }
          isStretched
          isPrimary
        >
          {recordingStatus === 'recording'
            ? 'Stop recording'
            : 'Start recording'}
          <img alt="Recording" className="recording-icon" src={recordingIcon} />
        </Button>
      </StyledPopupBody>
    </div>
    // <div>
    //   <p>Capture Screen</p>
    //   {recordingStatus === "recording" &&
    //   <>
    //     <button onClick={stopRecording}>stop</button> <button onClick={pauseRecording}>pause</button>
    //   </>
    //   }
    //   {recordingStatus === "stopped" && <button onClick={startRecording}>start</button>}
    //   {recordingStatus === "countDown" &&
    //   <>
    //     <span>starting 3.. 2.. 1..</span> <button onClick={stopRecording}>stop</button>
    //   </>
    //   }
    //   {recordingStatus === "initScreenCapturing" &&
    //   <>
    //     <span>waiting</span> <button onClick={stopRecording}>stop</button>
    //   </>
    //   }
    //   <div>
    //     <p>Audio</p>
    //     {micPermission === "denied"
    //      ? <>
    //          <button disabled>mic denied</button>
    //        </>
    //      : <ToggleAudioButton audioStatus={audioStatus} />
    //     }
    //   </div>
    // </div>
  );
};
