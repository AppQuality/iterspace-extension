import {setStorageItem} from "../storage";
import React, { useEffect, useState } from "react";
import micActive from "./assets/micActive.svg";
import { Field } from "@zendeskgarden/react-dropdowns";
import { Dropdown, IconButton, Item, Menu, Select } from "@appquality/unguess-design-system";
import { StyledManageAudio } from "./_styles";

export const ToggleAudioButton = ({audioStatus}: {audioStatus: AudioStatus}) => {
  const [tracks, setTracks] = useState<MediaStreamTrack[]>([]);

  const activateAudio = () => {
    setStorageItem("audioStatus", "active");
  }
  const deactivateAudio = () => {
    setStorageItem("audioStatus", "inactive");
  }

  const getAudioStream = async () => {
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true
      }, video: false
    });
    setTracks(audioStream.getAudioTracks());
  }

  const onChangeAudioTrack = () => {
    // TODO
  }

  useEffect(() => {
    getAudioStream();
  }, []);
  
  return <StyledManageAudio>
    <IconButton className="audio-btn" isBasic={false} isPill={false}>
      {audioStatus === 'active'
        ? <img onClick={deactivateAudio} src={micActive} alt={"Mute"}/>
        : <img onClick={activateAudio} src={micActive} alt={"Unmute"} />
      }
    </IconButton>
    <Dropdown
      selectedItem={tracks.length ? tracks[0] : undefined}
      onSelect={(item: MediaStreamTrack) => {
        console.log(item);
      }}
      downshiftProps={{ itemToString: (item: MediaStreamTrack) => item && item.label }}
    >
      <Field className="select-field">
        <Select>
          {tracks.length ? tracks[0].label : ""}
        </Select>
      </Field>
      <Menu
      >
        {tracks?.map((track) => (
          <Item key={track.id} value={track.id}>{track.label}</Item>
        ))}
      </Menu>
    </Dropdown>
  </StyledManageAudio>
}
