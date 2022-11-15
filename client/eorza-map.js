/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs-extra');
const {
  BrowserWindow, Menu,
} = require('electron');
const { getEorzeaMapUrl, getEorzeaMapAssets } = require('./env');

const eorzeaMapConfig = {
  offline: false,
  baseUrl: `${getEorzeaMapUrl()}/online.html`,
};

const updateEorzeaMapConfig = () => {
  eorzeaMapConfig.offline = fs.pathExistsSync(getEorzeaMapAssets());
  eorzeaMapConfig.baseUrl = `${getEorzeaMapUrl()}/${eorzeaMapConfig.offline ? 'index.html' : 'online.html'}`;
  console.log(JSON.stringify(eorzeaMapConfig));
};

const getEorzeaMapBaseUrl = () => eorzeaMapConfig.baseUrl;

// const offlineAssets = getEorzeaMapAssets();
// const offlineMode = fs.pathExistsSync(offlineAssets);
// // susu cdn https://map-cdn.ffxiv.cn/assets  NO CORS
// // cafe cdn https://map-cdn.wakingsands.com/assets
// const eorzeaMapBaseUrl = `${getEorzeaMapUrl()}/${offlineMode ? 'index.html' : 'online.html'}`;

const initEorzeaMapWindow = (pos, x, y) => {
  const url = pos && pos.x && pos.y
    ? `${eorzeaMapConfig.baseUrl}/?id=${pos.id}&x=${pos.x}&y=${pos.y}`
    : `${eorzeaMapConfig.baseUrl}/?id=${pos.id}`;
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
  return mapWin;
};

module.exports = {
  updateEorzeaMapConfig,
  getEorzeaMapBaseUrl,
  initEorzeaMapWindow,
};
