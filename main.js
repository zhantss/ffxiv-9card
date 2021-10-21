/* eslint-disable @typescript-eslint/no-var-requires */
// electron program
const { app, ipcMain: ipc, BrowserWindow } = require('electron');
const Store = require('electron-store');
const path = require('path');

const store = new Store();

ipc.handle('getStoreValue', (event, key) => store.get(key));

ipc.handle('setStoreValue', (event, key, value) => {
  // console.log(`set data[${key},${value}]`);
  store.set(key, value);
});

ipc.handle('deleteStoreValue', (event, key) => store.delete(key));

const createWindow = (width, height) => {
  const bwin = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  bwin.loadURL('http://localhost:23001');
  if (process.env.NODE_ENV !== 'production') {
    bwin.webContents.openDevTools({ mode: 'detach' });
  }
};

app.whenReady().then(() => {
  createWindow(1400, 1200);

  app.on('activate', () => {
    // macOS bug fix
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(1400, 1200);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
