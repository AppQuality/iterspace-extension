import { useState, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '../../storage';

const useRecordingStatus = () => {
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>('stopped');
  useEffect(() => {
    const getInitialRecordingValue = async () => {
      const recording = await getStorageItem('recordingStatus');
      setRecordingStatus(recording);
    };
    getInitialRecordingValue();
  }, []);

  chrome.storage.onChanged.addListener((changes) => {
    for (const [key, value] of Object.entries(changes)) {
      if (key === 'recordingStatus') {
        setRecordingStatus(value.newValue);
      }
    }
  });
  return {
    recordingStatus,
    startRecording: () => {
      chrome.runtime.sendMessage<MessageTypes>({ type: 'initScreenCapturing' });
    },
    stopRecording: () => {
      setStorageItem('recordingStatus', 'stopped');
    },
  };
};

export default useRecordingStatus;
