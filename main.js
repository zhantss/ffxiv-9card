/* eslint-disable @typescript-eslint/no-var-requires */
// electron program
const {
  app, dialog, shell, ipcMain: ipc, BrowserWindow, Menu,
} = require('electron');
const path = require('path');
const fs = require('fs');
const env = require('./package.json').PROCESS_ENV;

const { DATA_FILE } = require('./client/env');
const logger = require('./client/logger');
const { bootstrap } = require('./client/common');
const { eorzeaMapUrl, eorzeaMapServer, initEorzeaMapWindow } = require('./client/eorza-map');

process.on('uncaughtException', (error) => {
  logger.error('程序异常退出');
  logger.error(error);
  app.quit();
  if (eorzeaMapServer != null) {
    eorzeaMapServer.stop();
  }
});

bootstrap();

let mainWindow = null;
let eorzeaMapWindow = null;

ipc.handle('openUrl', (event, url) => {
  shell.openExternal(url);
});

ipc.handle('openMap', (event, id, x, y) => {
  if (eorzeaMapWindow == null) return;
  if (eorzeaMapWindow.isDestroyed()) {
    if (mainWindow != null) {
      const {
        x: mainX, y: mainY, width: mainWidth, height: mainHeight,
      } = mainWindow.getBounds();
      eorzeaMapWindow = initEorzeaMapWindow(`${eorzeaMapUrl}?id=${id}&x=${x}&y=${y}`, mainX + mainWidth, mainY + mainHeight);
    } else {
      eorzeaMapWindow = initEorzeaMapWindow(`${eorzeaMapUrl}?id=${id}&x=${x}&y=${y}`);
    }
    eorzeaMapWindow.show();
    eorzeaMapWindow.focus();
  } else {
    eorzeaMapWindow.loadURL(`${eorzeaMapUrl}?id=${id}&x=${x}&y=${y}`).then(() => {
      eorzeaMapWindow.show();
      eorzeaMapWindow.focus();
    });
  }
});

ipc.handle('exportCardInfo', (event, data) => {
  const win = BrowserWindow.getFocusedWindow();
  dialog.showSaveDialog(win, {
    title: '导出',
    defaultPath: DATA_FILE,
    filters: [
      { name: 'json', extensions: ['json'] },
    ],
  }).then((result) => {
    fs.writeFileSync(result.filePath, JSON.stringify(data));
    win.webContents.send('successMessage', '导出成功');
    logger.info(`导出卡片信息到 ${result.filePath}`);
  }).catch((err) => {
    logger.error(`导出失败 ${err}`);
    win.webContents.send('errorMessage', '导出失败');
  });
});

ipc.handle('importCardInfo', () => {
  const win = BrowserWindow.getFocusedWindow();
  dialog.showOpenDialog(win, {
    title: '导入',
    buttonLabel: '导入',
    message: '选择要导入的文件',
    defaultPath: DATA_FILE,
    filters: [
      { name: 'json', extensions: ['json'] },
    ],
  }).then((result) => {
    const file = result.filePaths[0];
    const data = fs.readFileSync(file);
    const cards = JSON.parse(data);
    if (cards) {
      win.webContents.send('importUserData', cards);
      logger.info(`导入的卡片信息 ${cards}`);
    }
  }).catch((err) => {
    logger.error(`导入失败: ${err}`);
    win.webContents.send('errorMessage', '导入失败');
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
    transparent: true,
    maximizable: false,
    frame: false,
    skipTaskbar: true,
    alwaysOnTop: true,
  });
  loading.loadURL(path.join(__dirname, 'electron/loading.html')).then(() => {
    loading.show();
    loading.focus();
  });
  Menu.setApplicationMenu(null);

  loading.on('closed', () => {
    logger.info('loading close');
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
  logger.info(`当前运行环境${env}`);
  if (process.env.NODE_ENV === 'development') {
    bwin.webContents.openDevTools({ mode: 'detach' });
  }
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'public/9card.png'));
  }
  bwin.on('closed', () => {
    if (eorzeaMapWindow != null) {
      eorzeaMapWindow.destroy();
    }
  });
  ipc.handle('loadingEnd', () => {
    loading.close();
    bwin.show();
    bwin.focus();
    if (eorzeaMapServer != null) {
      const {
        x: mainX, y: mainY, width: mainWidth, height: mainHeight,
      } = bwin.getBounds();
      eorzeaMapWindow = initEorzeaMapWindow(`${eorzeaMapUrl}?id=92`, mainX + mainWidth, mainY + mainHeight);
    }
  });
  return bwin;
};

app.whenReady().then(() => {
  mainWindow = createWindow(1600, 900);
  app.on('activate', () => {
    // macOS bug fix
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(1600, 900);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    if (eorzeaMapServer != null) {
      eorzeaMapServer.stop();
    }
  }
});
