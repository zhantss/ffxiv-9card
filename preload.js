/* eslint-disable @typescript-eslint/no-var-requires */
// window.addEventListener('DOMContentLoaded', () => {
//     const replaceText = (selector, text) => {
//         const element = document.getElementById(selector)
//         if (element) {
//             element.innerText = text
//         }
//     }

//     for (const dependency of ['chrome', 'node', 'electron']) {
//         replaceText(`${dependency}-version`, process.versions[dependency])
//     }
// })

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('$electron', {
  // ipcRenderer,
  api: {
    on: (channel, callback) => ipcRenderer.on(channel, (event, argv) => callback(event, argv)),
    openUrl: async (url) => {
      console.log(url);
      ipcRenderer.invoke('openUrl', url);
    },
    openMap: async (id, x, y) => {
      ipcRenderer.invoke('openMap', id, x, y);
    },
    loadingEnd: async () => ipcRenderer.invoke('loadingEnd'),
    // getStoreValue: async (key) => ipcRenderer.invoke('getStoreValue', key),
    // setStoreValue: async (key, data) => ipcRenderer.invoke('setStoreValue', key, data),
    // deleteStoreValue: async (key) => ipcRenderer.invoke('deleteStoreValue', key),
    exportCardInfo: async (data) => ipcRenderer.invoke('exportCardInfo', data),
    importCardInfo: async () => ipcRenderer.invoke('importCardInfo'),
    receiveImportCardInfo: (callback) => ipcRenderer.on('importCardInfo', (event, argv) => callback(event, argv)),
  },
});
