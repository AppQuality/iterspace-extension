chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "SESSION_CREATED_NEW") {
    // eslint-disable-next-line no-debugger
    const { recording } = request;
    const x = new XMLHttpRequest();
    x.open("GET", recording.blobUrl);
    x.responseType = "blob";
    x.onload = function () {
      const url = URL.createObjectURL(x.response);
      recording.blobUrl = url;
      recording.url = url;
      localStorage.setItem(recording.sessionId, JSON.stringify(recording));
      sendResponse(recording);
    };
    x.send();
  }
});