import React, { useEffect, useState } from 'react';
import micOn from './assets/micOn.svg';
import micOff from './assets/micOff.svg';
import { Field } from '@zendeskgarden/react-dropdowns';
import {
  Dropdown,
  IconButton,
  Item,
  Menu,
  Select,
} from '@appquality/unguess-design-system';
import { StyledManageAudio } from './_styles';
import Microphone from './Microphone';

export const ToggleAudioButton = () => {
  const [microphone, setMicrophone] = useState<Microphone>(new Microphone());
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    microphone.init().then(() => {
      setReady(microphone.ready());
      setMicrophone(microphone);
    });
  }, []);

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <StyledManageAudio>
      <IconButton
        className="audio-btn"
        isBasic={false}
        isPill={false}
        onClick={() => microphone.toggleAudio()}
      >
        <img
          src={microphone.isAudioActive() ? micOn : micOff}
          alt={'Mute/Unmute'}
        />
      </IconButton>
      <DeviceInputSelect microphone={microphone} />
    </StyledManageAudio>
  );
};

const DeviceInputSelect = ({ microphone }: { microphone: Microphone }) => {
  const [selectedDevice, setSelectedDevice] = useState<InputDeviceInfo>();
  if (!microphone.ready()) {
    return <div>Loading...</div>;
  }
  const tracks = microphone.getTracks();
  useEffect(() => {
    setSelectedDevice(
      tracks.find((t) => t.deviceId === microphone.getSelectedInput()),
    );
  }, []);

  return (
    <Dropdown
      selectedItem={selectedDevice?.deviceId}
      onSelect={(item: string) => {
        const track = tracks.find((t) => t.deviceId === item);
        if (track) {
          microphone.setSelectedInput(track.deviceId);
          setSelectedDevice(track);
        }
      }}
      downshiftProps={{
        itemToString: (item: InputDeviceInfo) => item,
      }}
    >
      <Field className="select-field">
        <Select className="select-input">{selectedDevice?.label}</Select>
      </Field>
      <Menu>
        {tracks?.map((track) => (
          <Item key={track.deviceId} value={track.deviceId}>
            {track.label}
          </Item>
        ))}
      </Menu>
    </Dropdown>
  );
};
