/* eslint-disable @typescript-eslint/no-var-requires */
// electron program
const {
  app, dialog, shell, ipcMain: ipc, BrowserWindow, Menu,
} = require('electron');
// const Store = require('electron-store');
const path = require('path');
const fs = require('fs');
const { createLogger, format, transports } = require('winston');

const levelFormat = (level) => {
  switch (level) {
    case 'error': return 'ERROR   :';
    case 'debug': return 'DEBUG   :';
    case 'warn': return 'WARN    :';
    case 'info':
    default: return 'INFO    :';
  }
};

const formatter = format.printf(({
  level, message, label, timestamp,
}) => `${timestamp} [${label}] ${levelFormat(level)} ${message}`);

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.colorize(),
    format.label({ label: 'main.js' }),
    format.timestamp(),
    formatter,
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: './logs/ffxiv-9card.log',
    }),
  ],
});

const USER_HOME = process.env.HOME || process.env.USERPROFILE;
const FFXIV_9CARD_PATH = path.resolve(USER_HOME, '.ffxiv-9card');
const DATA_FILE = path.resolve(FFXIV_9CARD_PATH, 'data.json');

const initConfigDir = () => {
  try {
    const stats = fs.statSync(FFXIV_9CARD_PATH);
    if (stats && stats.isDirectory()) {
      logger.debug('确认数据目录...');
    } else {
      logger.error('路径被占用, 请使用其他目录');
    }
  } catch (error) {
    logger.warn(`数据目录不存在 ${error}, 即将创建目录`);
    fs.mkdirSync(FFXIV_9CARD_PATH);
  }
};

const initDataFile = () => {
  try {
    const stats = fs.statSync(DATA_FILE);
    if (stats && stats.isFile()) {
      logger.debug('确认默认数据文件...');
    } else {
      logger.error('路径被占用, 请使用其他目录');
    }
  } catch (error) {
    logger.warn(`数据文件不存在 ${error}, 即将创建文件`);
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
};

ipc.handle('openUrl', (event, url) => {
  shell.openExternal(url);
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

initConfigDir();
initDataFile();

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
  logger.info(`当前运行环境${process.env.NODE_ENV}`);
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
