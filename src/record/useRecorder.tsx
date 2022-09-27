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
    const recorder = new Recorder();
    await recorder.initRecording();
    onChanged(recorder.getStream());
    setRecorder(recorder);
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
