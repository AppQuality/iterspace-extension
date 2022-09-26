window.addEventListener('click', (event) => {
  if (!(event.target instanceof HTMLElement)) {
    return;
  }
  const message: MessageTypes = {
    type: 'iterspace:clickEvent',
    payload: {
      targetString: domNodeToString(event.target),
      targetTagName: event.target.tagName.toLowerCase(),
      targetText: event.target.innerText,
      targetAttributes: getDomNodeAttributes(event.target),
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

const domNodeToString = (node: HTMLElement & { name?: string }) => {
  const tagName = node.tagName.toLowerCase();
  const { id, className, innerText: text } = node;
  const nameString = node.name ? `name="${node.name}"` : '';
  const idString = id ? `id="${id}"` : '';
  const classNameString =
    typeof className === 'string' ? `class="${className}"` : '';

  const attributes = `${idString} ${classNameString} ${nameString}`.trim();
  const attributesString = attributes ? ` ${attributes}` : '';
  return `<${tagName}${attributesString}>${text || ''}</${tagName}>`;
};

const getDomNodeAttributes = (node: HTMLElement) => {
  const attributes: { [key: string]: any } = {};
  for (var i = 0; i < node.attributes.length; i++) {
    attributes[node.attributes[i].name] = node.attributes[i].value;
  }
  return attributes;
};
