# Iterspace Browser Extension

Repo bootstrapped from https://github.com/sszczep/chrome-extension-webpack, thank you man.

## Getting started

### Installing and running

1. Clone the repository
2. Run `npm install`
3. Run `npm run start` for development mode, `npm run build` for production build
4. Add the extension to Chrome:
    1. Go to `chrome://extensions/`
    2. Enable the `Developer mode`
    3. Click on `Load unpacked`
    4. Choose the `dist` directory
5. You are good to go! You can also pin the extension to the toolbar for easy access.

### Project structure

All TypeScript files are placed in `src` directory.
- `contentScript.ts` - the [content script](https://developer.chrome.com/docs/extensions/mv3/content_scripts/) to be run in the context of selected web pages
- `serviceWorker.ts` - the [background script](https://developer.chrome.com/docs/extensions/mv3/service_workers/) usually used to initialize the extension and monitor events
- `storage.ts` - little helper utility to easily manage the extension's [storage](https://developer.chrome.com/docs/extensions/reference/storage/). In this particular project we are using *synced* storage area
- `popup.ts` - per-page script

`static` directory includes all the files to be copied over to the final build. It consists of `manifest.json` defining our extension, `.html` pages and icon set.

#### Popup

It's a default extension's page, visible after clicking on extension's icon in toolbar. According to the documentation:
> The popup cannot be smaller than 25x25 and cannot be larger than 800x600.

Read more [here](https://developer.chrome.com/docs/extensions/reference/browserAction/#popup).

### Storage

There are a bunch of helper functions to simplify storage usage:

```typescript
function getStorageData(): Promise<Storage> {...}

// Example usage
const storageData = await getStorageData();
console.log(storageData);
```

```typescript
function setStorageData(data: Storage): Promise<void> {...}

// Example usage
const newStorageData = { visible: true };
await setStorageData(newStorageData);
```

```typescript
function getStorageItem<Key extends keyof Storage>(
  key: Key,
): Promise<Storage[Key]> {...}

// Example usage
const isVisible = await getStorageItem('visible');
console.log(isVisible);
```

```typescript
function setStorageItem<Key extends keyof Storage>(
  key: Key,
  value: Storage[Key],
): Promise<void> {...}

// Example usage
await setStorageItem('visible', true);
```

```typescript
async function initializeStorageWithDefaults(defaults: Storage) {...}

// If `visible` property is already set in the storage, it won't be replaced.
// This function might be used in `onInstalled` event in service worker
// to set default storage values on extension's initialization.
const defaultStorageData = { visible: false };
await initializeStorageWithDefaults(defaultStorageData);
```

All of the above functions use `Storage` interface which guarantees type safety.

*Check `src/storage.ts` for implementation details.*

### Content scripts

Content scripts are files that run in the context of web pages. They live in an isolated world (private execution environment), so they do not conflict with the page or other extensions' content sripts.

The content script can be *declared statically* or *programmatically injected*.

#### Static declaration (match patterns)

Statically declared scripts are registered in the manifest file under the `"content_scripts"` field. They all must specify corresponding [match patterns](https://developer.chrome.com/docs/extensions/mv3/match_patterns/). In this boilerplate, the content script will be injected under all URLs by default. You can change that behaviour in `manifest.json` file. 

You can edit the default content script at `src/contentScript.ts`.

#### Programmatic injection

You can also inject the scripts programmatically. It might come in handy when you want to inject the script only in response to certain events. You also need to set extra permissions in manifest file. Read more about programmatic injection [here](https://developer.chrome.com/docs/extensions/mv3/content_scripts/#programmatic).

#### Adding new content script

To add a new content script, create a new script file in `src` directory. You also need to create a new entry in the *webpack* config file - `webpack.common.js`:

```javascript
entry: {
  serviceWorker: './src/serviceWorker.ts',
  contentScript: './src/contentScript.ts',
  popup: './src/popup.ts',

  // New entry down here
  myNewContentScript: './src/myNewContentScript.ts',
},
```

In case of static declaration, you might also need to modify the manifest file.

### Service worker (*old background pages*)

*coming from Manifest V2, you might want to read this page first: [Migrating from background pages to service workers](https://developer.chrome.com/docs/extensions/mv3/migrating_to_service_workers/).*

It is also the place to create a [context menu](https://developer.chrome.com/docs/extensions/reference/contextMenus/).

You can edit the service worker at `src/serviceWorker.ts`.

Read more about service workers [here](https://developer.chrome.com/docs/extensions/mv3/service_workers/).
