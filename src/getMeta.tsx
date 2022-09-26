window.addEventListener('click', () => {
  chrome.runtime.sendMessage('message_click', response => {
    console.log(response)
  })
})