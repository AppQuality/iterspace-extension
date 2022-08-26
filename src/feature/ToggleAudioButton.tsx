import {setStorageItem} from "../storage";
import React from "react";

export const ToggleAudioButton = ({audioStatus, recordingStatus}: {audioStatus: AudioStatus, recordingStatus: RecordingStatus}) => {
  const pauseAudio = () => {
    setStorageItem("audioStatus", "paused");
  }
  const activateAudio = () => {
    setStorageItem("audioStatus", "active");
  }
  const deactivateAudio = () => {
    setStorageItem("audioStatus", "inactive");
  }
  if (recordingStatus === 'recording' && audioStatus === 'paused')
    return <button onClick={activateAudio}>Unmute</button>

  if (recordingStatus === 'recording' && audioStatus === 'active')
    return <button onClick={pauseAudio}>Mute</button>

  if (audioStatus === 'inactive')
    return <button onClick={activateAudio}>Activate</button>

  if (audioStatus === "active")
    return <button onClick={deactivateAudio}>Deactivate</button>

  return null
}