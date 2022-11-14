/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

// ~
const USER_HOME = process.env.HOME || process.env.USERPROFILE;
// ~/.ffxiv-9card
const FFXIV_9CARD_DATA = path.resolve(USER_HOME, '.ffxiv-9card');
// ~/.ffxiv-9card/data.json
const DATA_FILE = path.resolve(FFXIV_9CARD_DATA, 'data.json');
// ~/.ffxiv-9card/display.json
const DISPLAY_FILE = path.resolve(FFXIV_9CARD_DATA, 'display.json');
// ffxiv-9card install dir
const FFXIV_9CARD_PATH = process.env.NODE_ENV === 'development' ? path.resolve(__dirname, '../') : process.cwd();
// FFXIV_9CARD_PATH/eorzea-map
const EORZA_MAP_PATH = path.resolve(FFXIV_9CARD_PATH, 'eorzea-map');
// FFXIV_9CARD_PATH/logs/ffxiv-9card.log
const LOG_FILE = path.resolve(FFXIV_9CARD_PATH, 'logs/ffxiv-9card.log');

module.exports = {
  USER_HOME,
  FFXIV_9CARD_DATA,
  DATA_FILE,
  DISPLAY_FILE,
  FFXIV_9CARD_PATH,
  EORZA_MAP_PATH,
  LOG_FILE,
};
