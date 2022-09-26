import {setStorageItem} from "../storage";
import React from "react";
import micActive from "./assets/micActive.svg";
import { IconButton } from "@appquality/unguess-design-system";
import { StyledManageAudio } from "./_styles";

export const ToggleAudioButton = ({audioStatus}: {audioStatus: AudioStatus}) => {
  const activateAudio = () => {
    setStorageItem("audioStatus", "active");
  }
  const deactivateAudio = () => {
    setStorageItem("audioStatus", "inactive");
  }

  return <StyledManageAudio>
    <IconButton className="audio-btn" isBasic={false} isPill={false}>
      {audioStatus === 'active'
        ? <img onClick={deactivateAudio} src={micActive} alt={"Mute"}/>
        : <img onClick={activateAudio} src={micActive} alt={"Unmute"} />
      }
    </IconButton>
  </StyledManageAudio>
}
