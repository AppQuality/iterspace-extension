import { createRoot } from 'react-dom/client';
import React, { useEffect, useState } from 'react';
import { Recorder } from './feature/Recorder';
import { RecordingController } from './feature/RecordingController';
import useRecordingStatus from './feature/RecordingController/useRecordingStatus';
import useAudioStatus from './feature/RecordingController/useAudioStatus';

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
  const { recordingStatus } = useRecordingStatus();
  const { audioStatus } = useAudioStatus();

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
    }
  };

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
