import { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../../storage';

const useAudioStatus = () => {
  const [micPermission, setMicPermission] = useState<PermissionState>('denied');
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('inactive');

  useEffect(() => {
    const getInitialValue = async () => {
      const audio = await getStorageItem('audioStatus');
      setAudioStatus(audio);

      const response = await window.navigator.permissions.query({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        name: 'microphone',
      });
      setMicPermission(response.state);
    };
    getInitialValue();
    chrome.storage.onChanged.addListener((changes) => {
      for (const [key, value] of Object.entries(changes)) {
        if (key === 'audioStatus') {
          setAudioStatus(value.newValue);
        }
      }
    });
  }, []);
  return {
    micPermission,
    audioStatus,
  };
};

export default useAudioStatus;
