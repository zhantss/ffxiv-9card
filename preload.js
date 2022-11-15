/* eslint-disable @typescript-eslint/no-var-requires */
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
    exportCardInfo: async (data) => ipcRenderer.invoke('exportCardInfo', data),
    importCardInfo: async () => ipcRenderer.invoke('importCardInfo'),
    receiveImportCardInfo: (callback) => ipcRenderer.on('importCardInfo', (event, argv) => callback(event, argv)),
  },
});
