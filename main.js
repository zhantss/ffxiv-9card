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
    defaultPath: path.resolve(__dirname, './config/card.json'),
    filters: [
      { name: 'json', extensions: ['json'] },
    ],
  }).then((result) => {
    fs.writeFileSync(result.filePath, JSON.stringify(store.get('card')));
    win.webContents.send('successMessage', '导出成功');
  }).catch((err) => {
    win.webContents.send('errorMessage', err.toString());
  });
});

ipc.handle('importCardInfo', () => {
  const win = BrowserWindow.getFocusedWindow();
  dialog.showOpenDialog(win, {
    title: '导入',
    buttonLabel: '导入',
    message: '选择要导入的文件',
    defaultPath: path.resolve(__dirname, './config/card.json'),
    filters: [
      { name: 'json', extensions: ['json'] },
    ],
  }).then((result) => {
    const file = result.filePaths[0];
    const data = fs.readFileSync(file);
    const cards = JSON.parse(data);
    if (cards) {
      win.webContents.send('importUserData', cards);
    }
  }).catch((err) => {
    win.webContents.send('errorMessage', err.toString());
  });
});

if (process.env.NODE_ENV !== 'development') {
  Menu.setApplicationMenu(null);
}

const loadingWindow = () => {
  const loading = new BrowserWindow({
    height: 360,
    width: 360,
    show: false,
    useContentSize: true,
    transparent: false,
    maximizable: false,
    frame: false,
  });
  loading.loadURL(path.join(__dirname, 'electron/loading.html')).then(() => {
    loading.show();
    loading.focus();
  });
  Menu.setApplicationMenu(null);

  loading.on('closed', () => {
    console.log('loading close');
    loading.destroy();
  });
  return loading;
};

const createWindow = (width, height) => {
  const loading = loadingWindow();
  const bwin = new BrowserWindow({
    width,
    height,
    maximizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'public/9card.png'),
  });
  const url = process.env.NODE_ENV === 'development' ? 'http://localhost:23001'
    : `file://${path.join(__dirname, 'dist/index.html')}`;
  bwin.loadURL(url);
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'development') {
    bwin.webContents.openDevTools({ mode: 'detach' });
  }
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'public/9card.png'));
  }
  ipc.handle('loadingEnd', () => {
    loading.close();
    bwin.show();
    bwin.focus();
  });
};

app.whenReady().then(() => {
  createWindow(1600, 900);
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
