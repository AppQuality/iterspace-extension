type ExtensionStorage = {
  controlTab?: number;
  recordingStatus: RecordingStatus;
  audioStatus: AudioStatus;
  recording?: object;
  recording_pageEvents?: any[];
  audioDeviceId: string;
};

type MessageTypes = {
  type:
    | 'startRecording'
    | 'abortRecording'
    | 'stopRecording'
    | 'initCountDown'
    | 'pauseRecording'
    | 'initScreenCapturing'
    | 'activateAudio'
    | 'deactivateAudio'
    | 'iterspace:clickEvent'
    | 'iterspace:consoleLog'
    | 'iterspace:consoleWarn'
    | 'iterspace:consoleInfo'
    | 'iterspace:consoleError'
    | 'iterspace:consoleDebug';
  payload?: any;
};

type RecordingStatus =
  | 'recording'
  | 'paused'
  | 'stopped'
  | 'countDown'
  | 'initScreenCapturing';
type AudioStatus = 'active' | 'inactive';
