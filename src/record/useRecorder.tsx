import { useState, useEffect } from 'react';
import { Recorder } from '../feature/Recorder';
import useAudioStatus from '../feature/RecordingController/useAudioStatus';
import useRecordingStatus from '../feature/RecordingController/useRecordingStatus';

const useRecorder = ({
  onChanged,
}: {
  onChanged: (stream: MediaStream) => void;
}) => {
  const [recorder, setRecorder] = useState<Recorder>(null);
  const { recordingStatus } = useRecordingStatus();
  const { audioStatus } = useAudioStatus();

  const initRecordingSequence = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      onChanged(stream);
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
    if (!recorder || recordingStatus !== 'recording') return;

    if (audioStatus === 'active') {
      recorder.unmuteAudioTrack();
    }
    if (audioStatus === 'inactive') {
      recorder.muteAudioTrack();
    }
  }, [audioStatus]);

  return {
    recorder,
  };
};

export default useRecorder;
