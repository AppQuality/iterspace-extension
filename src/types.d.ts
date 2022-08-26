type ExtensionStorage = {
  controlTab?: number
  recordingStatus: RecordingStatus
}

type MessageTypes = {
  type: "startRecording" | "stopRecording" | "initCountDown" | "pauseRecording" | "initScreenCapturing"
}

type RecordingStatus = "recording" | "paused" | "stopped" | "countDown" | "initScreenCapturing";