chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
  if (request.type === "SESSION_CREATED_NEW") {
    saveRecordingToStorage(request).then(sendResponse);
    return true;
  }
});

async function saveRecordingToStorage(request: { recording: any; }) {
  const { recording } = request;
  const response = await fetch(recording.blobUrl);
  const blob = await response.blob()
  const url = URL.createObjectURL(blob);
  recording.blobUrl = url;
  recording.url = url;
  localStorage.setItem(recording.sessionId, JSON.stringify(recording));
  return recording.id;
}
