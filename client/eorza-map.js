/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const express = require('express');
const compression = require('compression');
const {
  BrowserWindow, Menu,
} = require('electron');

const { EORZA_MAP_PATH } = require('./env');
const logger = require('./logger');

const createEorzaMapServer = (eorzaMapPath, port) => {
  this.server = null;
  this.eorzaMapPath = eorzaMapPath;
  this.port = port == null ? 4321 : port;

  // GZIP
  this.app = express();
  this.app.use(compression());

  this.start = () => {
    if (this.server != null) {
      return;
    }
    this.app.use(express.static(this.eorzaMapPath));
    this.server = this.app.listen(this.port);
    logger.debug('地图服务启动, port on 24321');
  };

  this.stop = () => {
    if (this.server != null) {
      this.server.close((err) => {
        process.exit(err ? 1 : 0);
      });
    }
  };
  return this;
};

const initEorzeaMapServer = () => {
  try {
    const stats = fs.statSync(EORZA_MAP_PATH);
    if (stats && stats.isDirectory()) {
      return createEorzaMapServer(EORZA_MAP_PATH, 24321);
    }
  } catch (error) {
    logger.error(`地图服务启动失败 ${error}`);
  }
  return null;
};

const eorzeaMapServer = initEorzeaMapServer();
eorzeaMapServer.start();
const offlineAssets = path.resolve(EORZA_MAP_PATH, 'assets');
const offlineAssetsExisted = fs.existsSync(offlineAssets);
const offlineMode = offlineAssetsExisted && fs.statSync(offlineAssets).isDirectory();
// susu cdn https://map-cdn.ffxiv.cn/assets  NO CORS
// cafe cdn https://map-cdn.wakingsands.com/assets
const eorzeaMapUrl = `http://localhost:24321/${offlineMode ? 'index.html' : 'online.html'}`;

const initEorzeaMapWindow = (url, x, y) => {
  const mapWin = new BrowserWindow({
    height: 480,
    width: 480,
    show: false,
    useContentSize: true,
    transparent: false,
    maximizable: false,
    frame: false,
    skipTaskbar: true,
    x: x != null ? x - 520 : null,
    y: y != null ? y - 520 : null,
  });
  mapWin.loadURL(url).then(() => {
    // mapWin.show();
  });
  Menu.setApplicationMenu(null);
  mapWin.on('closed', () => {
    mapWin.destroy();
  });
  if (process.env.NODE_ENV === 'development') {
    mapWin.webContents.openDevTools({ mode: 'detach' });
  }
  return mapWin;
};

module.exports = {
  eorzeaMapUrl,
  eorzeaMapServer,
  initEorzeaMapWindow,
};
