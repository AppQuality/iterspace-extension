import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';
import { Recorder } from './feature/Recorder';
import { getStorageItem } from './storage';
import { RecordingController } from './feature/RecordingController';

const container = document.getElementById('recordingInterface');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript

declare global {
  interface Window {
    localStream?: MediaStream;
  }
}

const getVideoStream = async () => {
  return await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false,
  });
};
const initVideoPreview = (videoStream: MediaStream) => {
  const emitterVideo: HTMLVideoElement =
    document.querySelector('#recordedStream');
  emitterVideo.srcObject = videoStream;
};

const ScreenRecorder = () => {
  const [recorder, setRecorder] = useState<Recorder>(null);
  const [recordingStatus, setRecordingStatus] =
    useState<RecordingStatus>('stopped');
  const [audioStatus, setAudioStatus] = useState<AudioStatus>('inactive');

  const initRecordingSequence = async () => {
    try {
      const stream = await getVideoStream();
      initVideoPreview(stream);
      const recorder = new Recorder(stream);
      if (audioStatus === 'active') {
        await recorder.addAudioTrack();
      }
      setRecorder(recorder);
      chrome.runtime.sendMessage<MessageTypes>({ type: 'startRecording' });
    } catch (err) {
      chrome.runtime.sendMessage<MessageTypes>({ type: 'abortRecording' });
      /* handle the error */
      console.warn(err);
    }
  };

  useEffect(() => {
    const getInitialRecordingValue = async () => {
      const recording = await getStorageItem('recordingStatus');
      const audio = await getStorageItem('audioStatus');
      setRecordingStatus(recording);
      setAudioStatus(audio);
    };
    getInitialRecordingValue();
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

  useEffect(() => {
    if (recordingStatus === 'initScreenCapturing') {
      initRecordingSequence();
    }
    if (!recorder) return;
    if (recordingStatus === 'stopped') {
      recorder.stopRecording();
    }
    if (recordingStatus === 'recording') {
      recorder.startRecording();
    }
  }, [recordingStatus]);

  useEffect(() => {
    if (!recorder) return;
    if (recordingStatus === 'recording' && audioStatus === 'active') {
      recorder.unmuteAudioTrack();
    }
    if (recordingStatus === 'recording' && audioStatus === 'inactive') {
      recorder.muteAudioTrack();
    }
  }, [audioStatus]);

  return (
    <div>
      <p>Controls</p>
      <RecordingController />
    </div>
  );
};

root.render(<ScreenRecorder />);
