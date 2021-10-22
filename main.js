/* eslint-disable @typescript-eslint/no-var-requires */
// electron program
const {
  app, dialog, shell, ipcMain: ipc, BrowserWindow, Menu,
} = require('electron');
const Store = require('electron-store');
const path = require('path');
const fs = require('fs');

const store = new Store();

ipc.handle('getStoreValue', (event, key) => store.get(key));

ipc.handle('setStoreValue', (event, key, value) => {
  // console.log(`set data[${key},${value}]`);
  store.set(key, value);
});

ipc.handle('deleteStoreValue', (event, key) => store.delete(key));

ipc.handle('openUrl', (event, url) => {
  shell.openExternal(url);
});

ipc.handle('exportCardInfo', () => {
  const win = BrowserWindow.getFocusedWindow();
  dialog.showSaveDialog(win, {
    title: '导出',
    defaultPath: path.resolve(__dirname, './user/card.json'),
    filters: [
      { name: 'json', extensions: ['json'] },
    ],
  }).then((result) => {
    fs.writeFileSync(result.filePath, JSON.stringify(store.get('card')));
  });
});

Menu.setApplicationMenu(null);

const createWindow = (width, height) => {
  const bwin = new BrowserWindow({
    width,
    height,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'public/9card.png'),
  });
  const url = process.env.NODE_ENV === 'development' ? 'http://localhost:23001'
    : `file://${path.join(__dirname, 'dist/index.html')}`;
  bwin.loadURL(url);
  if (process.env.NODE_ENV === 'development') {
    bwin.webContents.openDevTools({ mode: 'detach' });
  }
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'public/9card.png'));
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
