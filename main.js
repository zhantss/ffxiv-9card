/* eslint-disable @typescript-eslint/no-var-requires */
// electron program
const {
  app, dialog, shell, ipcMain: ipc, BrowserWindow, Menu,
} = require('electron');
const path = require('path');
const fs = require('fs');

const logger = require('./client/logger');
const { PROCESS_ENV } = require('./package.json');
const { DATA_FILE } = require('./client/env');
const { bootstrap } = require('./client/common');
const { getServerUrl, getResourceDir } = require('./client/env');
const { createResourceServer } = require('./client/web-server');
const { getEorzeaMapBaseUrl, initEorzeaMapWindow } = require('./client/eorza-map');

let mainWindow = null;
let loadingWindow = null;
let eorzeaMapWindow = null;
let resourceServer = null;

const exitApp = () => {
  if (resourceServer != null) {
    try {
      resourceServer.stop();
    } catch (error) {
      logger.error(`资源服务关闭失败, 请结束进程, 联系开发者, error ${error}`);
    }
  }
  app.quit();
};

process.on('uncaughtException', (error) => {
  logger.error('程序异常退出');
  logger.error(error);
  dialog.showMessageBoxSync({
    type: 'error',
    title: '错误',
    message: error ? error.message : '未知错误, 请将日志文件发送给开发者',
    buttons: ['OK'],
  });
  exitApp();
  app.exit();
});

Menu.setApplicationMenu(null);

const createloadingWindow = (callback) => {
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
    icon: path.join(__dirname, 'electron/9card.png'),
  });
  loading.loadFile(path.join(__dirname, 'electron/loading.html'));
  loading.once('ready-to-show', () => {
    loading.show();
    callback();
  });

  loading.on('closed', () => {
    logger.info('loading finshed');
    loading.destroy();
  });
  return loading;
};

const createMainWindow = (width, height) => {
  const main = new BrowserWindow({
    width,
    height,
    maximizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'electron/9card.png'),
  });
  const url = process.env.NODE_ENV === 'development'
    ? 'http://localhost:23001'
    : `${getServerUrl()}/index.html`;
  logger.info(`加载${url}`);
  main.loadURL(url);
  logger.info(`当前运行环境: ${PROCESS_ENV || process.env.NODE_ENV}`);
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'electron/9card.png'));
  }
  main.on('closed', () => {
    exitApp();
  });
  return main;
};

const setup = () => {
  // create loading window
  loadingWindow = createloadingWindow(() => {
    bootstrap().then(() => {
      // start resource server
      resourceServer = createResourceServer(getResourceDir(), 24321);
      resourceServer.start();
      // create main window
      mainWindow = createMainWindow(1600, 900);
      mainWindow.webContents.session.clearCache();
    }).catch((error) => {
      logger.error(`程序启动失败, error ${error}`);
      exitApp();
    });
  });
};

ipc.handle('loadingEnd', () => {
  loadingWindow.close();
  mainWindow.show();
  mainWindow.focus();
  if (resourceServer != null) {
    const {
      x: mainX, y: mainY, width: mainWidth, height: mainHeight,
    } = mainWindow.getBounds();
    eorzeaMapWindow = initEorzeaMapWindow({ id: 92 }, mainX + mainWidth, mainY + mainHeight);
  }
  if (process.env.NODE_ENV === 'development') {
    logger.debug('启动devtools');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
    if (eorzeaMapWindow != null && !eorzeaMapWindow.isDestroyed()) {
      eorzeaMapWindow.webContents.openDevTools({ mode: 'detach' });
    }
  }
});

ipc.handle('openDevTools', () => {
  mainWindow.webContents.openDevTools({ mode: 'detach' });
});

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
      eorzeaMapWindow = initEorzeaMapWindow({ id, x, y }, mainX + mainWidth, mainY + mainHeight);
    } else {
      eorzeaMapWindow = initEorzeaMapWindow({ id, x, y });
    }
    eorzeaMapWindow.show();
    eorzeaMapWindow.focus();
  } else {
    eorzeaMapWindow.loadURL(`${getEorzeaMapBaseUrl()}?id=${id}&x=${x}&y=${y}`).then(() => {
      eorzeaMapWindow.show();
      eorzeaMapWindow.focus();
    });
  }
});

// 导出幻卡数据
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

// 导入幻卡数据
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

// ssl pass localhost
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (/https:\/\/localhost/g.test(url)) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    exitApp();
  }
});

app.whenReady().then(() => {
  setup();
});
