/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const USER_HOME = process.env.NODE_ENV !== 'development'
  // ~
  ? process.env.HOME || process.env.USERPROFILE
  // ../local
  : path.resolve(__dirname, '../local');
// USER_HOME/.ffxiv-9card
const FFXIV_9CARD_USERPROFILE = path.resolve(USER_HOME, '.ffxiv-9card');
// USER_HOME/.ffxiv-9card/data.json
const DATA_FILE = path.resolve(FFXIV_9CARD_USERPROFILE, 'data.json');
// USER_HOME/.ffxiv-9card/display.json
const DISPLAY_FILE = path.resolve(FFXIV_9CARD_USERPROFILE, 'display.json');
// USER_HOME/.ffxiv-9card/config.json
const CONFIG_FILE = path.resolve(FFXIV_9CARD_USERPROFILE, 'config.json');
// ffxiv-9card install dir
const FFXIV_9CARD_HOME = process.env.NODE_ENV === 'development'
  // ../local/app
  ? path.resolve(__dirname, '../local/app')
  // ffxiv-9card.exe ./
  : process.cwd();
// FFXIV_9CARD_PATH/eorzea-map
const EORZA_MAP_PATH = path.resolve(FFXIV_9CARD_HOME, 'eorzea-map');
// FFXIV_9CARD_PATH/logs/ffxiv-9card.log
const LOG_FILE = path.resolve(FFXIV_9CARD_HOME, 'logs/ffxiv-9card.log');

const RES_VERSION_FILE = 'ffxiv.9card.version';
const RES_DIR_NAME = 'ffxiv-9card-assets';
const EORZEA_MAP_NAME = 'eorzea-map';

const INSTALL_VERSION_FILE = path.resolve(FFXIV_9CARD_HOME, RES_VERSION_FILE);

const appConfig = {
  resourceDir: path.resolve(FFXIV_9CARD_HOME, `../${RES_DIR_NAME}`),
  resourceVersion: '0.00',
  serverPort: 24321,
};

const getResourceDir = () => appConfig.resourceDir;
const setResourceDir = (resourceDir) => { appConfig.resourceDir = resourceDir; };
const getResourceVersion = () => appConfig.resourceVersion;
const setResourceVersion = (resourceVersion) => { appConfig.resourceVersion = resourceVersion; };
const getServerPort = () => appConfig.serverPort;
const setServerPort = (serverPort) => {
  try {
    appConfig.serverPort = Number.parseInt(serverPort, 10);
  } catch (error) {
    console.error(`配置端口号错误, 使用默认值. error ${error}`);
    appConfig.serverPort = 24321;
  }
};
const getServerUrl = () => `http://localhost:${getServerPort()}`;
const getEorzeaMapUrl = () => `${getServerUrl()}/eorzea-map`;
const getEorzeaMapAssets = () => path.resolve(getResourceDir(), `${EORZEA_MAP_NAME}/assets`);

module.exports = {
  USER_HOME,
  FFXIV_9CARD_USERPROFILE,
  DATA_FILE,
  DISPLAY_FILE,
  CONFIG_FILE,
  FFXIV_9CARD_HOME,
  EORZA_MAP_PATH,
  LOG_FILE,
  RES_VERSION_FILE,
  INSTALL_VERSION_FILE,
  RES_DIR_NAME,
  getServerUrl,
  getResourceDir,
  setResourceDir,
  getResourceVersion,
  setResourceVersion,
  getServerPort,
  setServerPort,
  getEorzeaMapUrl,
  getEorzeaMapAssets,
};
