import DomNode from './feature/DomNode';

window.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const node = new DomNode(event.target);
  const message: MessageTypes = {
    type: 'iterspace:clickEvent',
    payload: {
      targetString: node.toString(),
      targetTagName: node.tagName,
      targetText: node.text,
      targetAttributes: node.attributes,
      pageX: event.pageX,
      pageY: event.pageY,
      layerX: event.offsetX,
      layerY: event.offsetY,
      screenX: event.screenX,
      screenY: event.screenY,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      movementX: event.movementX,
      movementY: event.movementY,
      x: event.x,
      y: event.y,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      url: window.location.href,
    },
  };
  chrome.runtime.sendMessage(message);
});

var s = document.createElement('script');
s.src = chrome.runtime.getURL('consoleOverride.js');
s.onload = function () {
  //@ts-ignore
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

window.addEventListener(
  'iterspaceExtensionConsoleMessage',
  function (event: CustomEvent) {
    chrome.runtime.sendMessage(event.detail);
  },
  false,
);
