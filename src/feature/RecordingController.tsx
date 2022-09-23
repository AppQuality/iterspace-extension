import { Button, MD, theme } from "@appquality/unguess-design-system";
import React, {useEffect, useState} from "react";
import {getStorageItem, setStorageItem} from "../storage";
import {ToggleAudioButton} from "./ToggleAudioButton";
import logoIcon from "./assets/logo.svg";
import recordingIcon from "./assets/iconLeft.svg";
import closeButton from "./assets/closeButton.svg";
import { StyledPopupBody, StyledPopupHeader } from "./_styles";

export const RecordingController = () => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>("stopped");
  const [micPermission, setMicPermission] = useState<PermissionState>("denied");
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("inactive");
  useEffect(() => {
    const getInitialRecordingValue = async () => {
      const recording = await getStorageItem('recordingStatus');
      const audio = await getStorageItem('audioStatus');
      setRecordingStatus(recording);
      setAudioStatus(audio);
    }
    const getMicrophonePermissions = async () => {
      const response = await window.navigator.permissions.query({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name: 'microphone',
      })
      setMicPermission(response.state);
    }
    getInitialRecordingValue();
    getMicrophonePermissions();
    chrome.storage.onChanged.addListener((changes) => {
      for (const [key, value] of Object.entries(changes)) {
        if (key === 'recordingStatus') {
          setRecordingStatus(value.newValue);
        }
        if (key === 'audioStatus') {
          setAudioStatus(value.newValue);
        }
      }
    });
  }, []);
  const startRecording = () => {
    chrome.runtime.sendMessage<MessageTypes>({type:"initScreenCapturing"});
  }
  const stopRecording = () => {
    setStorageItem("recordingStatus", "stopped");
  }
  const pauseRecording = () => {
    setStorageItem("recordingStatus", "paused");
  }
  return (
    <div>
      <StyledPopupHeader>
        <div className="header-left">
          <img alt="Iterspace" src={logoIcon} />
          <MD className="title" isBold>Iterspace</MD>
        </div>
        <div className="header-right">
          <img 
            alt="Close" 
            src={closeButton} 
            onClick={() => window.close()} 
          />
        </div>
      </StyledPopupHeader>
      <StyledPopupBody>
        <Button 
          className="generic-button"
          themeColor={theme.palette.grey[800]}
          isStretched
        >
            Attiva microfono
        </Button>
        <Button 
          className="generic-button"
          themeColor={theme.palette.grey[800]}
          onClick={recordingStatus === "recording" ? stopRecording : startRecording}
          isStretched 
          isPrimary
        > 
          {recordingStatus === "recording" ? "Stop recording" : "Start recording"}
          <img 
            alt="Recording" 
            className="recording-icon" 
            src={recordingIcon} 
          />
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
  )
}
