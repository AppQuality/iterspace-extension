type ExtensionStorage = {
  controlTab?: number
  recordingStatus: RecordingStatus,
  audioStatus: AudioStatus
}

type MessageTypes = {
  type: "startRecording" | "stopRecording" | "initCountDown" | "pauseRecording" | "initScreenCapturing" | "activateAudio" | "deactivateAudio"
}

type RecordingStatus = "recording" | "paused" | "stopped" | "countDown" | "initScreenCapturing";
type AudioStatus = "active" | "inactive"