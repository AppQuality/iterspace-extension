const { log, warn, error, info, debug } = console;

console.log = (...args) => {
  log(...args);
  sendConsoleMessage('iterspace:consoleLog', args);
};
console.warn = (...args) => {
  warn(...args);
  sendConsoleMessage('iterspace:consoleWarn', args);
};
console.error = (...args) => {
  error(...args);
  sendConsoleMessage('iterspace:consoleError', args);
};
console.info = (...args) => {
  info(...args);
  sendConsoleMessage('iterspace:consoleInfo', args);
};
console.debug = (...args) => {
  debug(...args);
  sendConsoleMessage('iterspace:consoleDebug', args);
};

const sendConsoleMessage = (type: MessageTypes['type'], args: any) => {
  const message: MessageTypes = {
    type: type,
    payload: {
      url: window.location.href,
      values: sanitizeObjects(args),
    },
  };
  if (isNewEventDifferent(message)) {
    const event = new CustomEvent('iterspaceExtensionConsoleMessage', {
      detail: message,
    });
    window.dispatchEvent(event);
  }
};

/* eslint-disable  @typescript-eslint/ban-types */
const sanitizeObjects = (args: (Function | Object | number | string)[]) =>
  args.map((el) => {
    if (el) {
      if (typeof el === 'function') {
        return `ƒ ${el.name}()`;
      }
      if (typeof el === 'object') {
        return JSON.stringify(el);
      }
      if (typeof el.toString === 'function') {
        return el.toString();
      }
    }
    return '';
  });

let lastEvent: null | any = null;
const isNewEventDifferent = (newEvent: any) => {
  const isDifferent = JSON.stringify(newEvent) !== JSON.stringify(lastEvent);
  if (isDifferent) {
    lastEvent = newEvent;
  }
  return isDifferent;
};
