import {setStorageItem} from "../storage";
import React from "react";

export const ToggleAudioButton = ({audioStatus}: {audioStatus: AudioStatus}) => {
  const activateAudio = () => {
    setStorageItem("audioStatus", "active");
  }
  const deactivateAudio = () => {
    setStorageItem("audioStatus", "inactive");
  }
  if (audioStatus === 'inactive')
    return <button onClick={activateAudio}>Unmute</button>

  if (audioStatus === 'active')
    return <button onClick={deactivateAudio}>Mute</button>

  return null
}