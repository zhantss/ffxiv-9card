/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const logger = require('./logger');
const env = require('./env');

const initDataDir = () => {
  try {
    const stats = fs.statSync(env.FFXIV_9CARD_DATA);
    if (stats && stats.isDirectory()) {
      logger.debug('确认数据目录...');
    } else {
      logger.error('路径被占用, 请使用其他目录');
    }
  } catch (error) {
    logger.warn(`数据目录不存在 ${error}, 即将创建目录`);
    fs.mkdirSync(env.FFXIV_9CARD_DATA);
  }
};

const initFile = (file) => {
  try {
    const stats = fs.statSync(file);
    if (stats && stats.isFile()) {
      logger.debug('确认默认数据文件...');
    } else {
      logger.error('路径被占用, 请使用其他目录');
    }
  } catch (error) {
    logger.warn(`数据文件 ${file} 不存在 ${error}, 即将创建文件`);
    fs.writeFileSync(file, JSON.stringify([]));
  }
};

// TODO 程序与数据分离

const initDataFile = () => initFile(env.DATA_FILE);
const initDisplayFile = () => initFile(env.DISPLAY_FILE);

const bootstrap = () => {
  initDataDir();
  // TODO 文件合规检测
  initDataFile();
  initDisplayFile();
};

module.exports = {
  bootstrap,
};
