/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs-extra');
const path = require('path');
const StreamZip = require('node-stream-zip');
const { dialog, BrowserWindow } = require('electron');
const logger = require('./logger');
const env = require('./env');
const { updateEorzeaMapConfig } = require('./eorza-map');

const initDataDir = () => {
  try {
    const stats = fs.statSync(env.FFXIV_9CARD_USERPROFILE);
    if (stats && stats.isDirectory()) {
      logger.debug('确认数据目录...');
    } else {
      logger.error('路径被占用, 请使用其他目录');
    }
  } catch (error) {
    logger.warn(`数据目录不存在 ${error}, 即将创建目录`);
    fs.mkdirSync(env.FFXIV_9CARD_USERPROFILE);
  }
};

const initFile = (file, isArray) => {
  try {
    const stats = fs.statSync(file);
    if (stats && stats.isFile()) {
      logger.debug(`确认默认数据文件...${file}`);
    } else {
      logger.error('路径被占用, 请使用其他目录');
    }
  } catch (error) {
    logger.warn(`数据文件 ${file} 不存在 ${error}, 即将创建文件`);
    if (isArray) {
      fs.writeFileSync(file, JSON.stringify([]));
    } else {
      fs.writeFileSync(file, JSON.stringify({}));
    }
  }
};

const showConfirmDialog = ({ type, message }) => dialog
  .showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
    type,
    message: `${message}, 确认吗?`,
    buttons: ['确认', '取消'],
    cancelId: 999,
  });

const unzip = async (zipFile, fileName, outPath) => {
  // eslint-disable-next-line new-cap
  const assetsFile = new StreamZip.async({
    file: zipFile,
  });
  const count = await assetsFile.extract(fileName, outPath);
  logger.debug(`${zipFile} 解压完成, 解压文件数 ${count} `);
  await assetsFile.close();
};

// TODO 程序与数据分离

const getResourceVersionFromFile = (versionFile) => {
  try {
    if (fs.existsSync(versionFile)) {
      const version = fs.readFileSync(versionFile).toString('utf-8');
      const matchs = version.match(/CN-(.+)-(.+)/);
      if (matchs.length === 3) {
        return Number.parseInt(matchs[2], 10);
      }
      logger.error(`版本文件 ${versionFile} 校验失败, 格式应为 CN 游戏版本号 - 资源构建时间`);
    } else {
      logger.error(`版本文件 ${versionFile} 不存在`);
    }
  } catch (error) {
    logger.error(`版本文件 ${versionFile} 校验失败, error ${error}`);
  }
  return -1;
};

const updateResource = async (dir, update) => {
  if (update) {
    logger.debug('开始升级资源');
    fs.emptyDirSync(path.resolve(dir, 'assets'));
  } else {
    logger.debug('重新安装资源');
    fs.emptyDirSync(dir);
  }
  // unzip
  await unzip(
    path.resolve(env.FFXIV_9CARD_HOME, `resources/${env.RES_DIR_NAME}.zip`),
    env.RES_DIR_NAME,
    dir,
  );
};

const resourceSelection = async () => {
  try {
    const defaultPath = path.resolve(env.FFXIV_9CARD_HOME, `../${env.RES_DIR_NAME}`);
    let targetDir = defaultPath;
    const useDefault = dialog.showMessageBoxSync(BrowserWindow.getFocusedWindow(), {
      type: 'info',
      title: '安装资源数据',
      message: `数据资源将安装到${defaultPath}, 确认吗?`,
      detail: '!! 请不要选择程序的安装目录 !!',
      buttons: ['手动选择其他目录', '确认'],
    });
    if (useDefault < 1) {
      const selection = dialog.showOpenDialogSync(BrowserWindow.getFocusedWindow(), {
        title: '请选择资源数据的安装目录',
        defaultPath,
        message: '请选择资源数据的安装目录',
        properties: ['openDirectory'],
      });
      if (selection.length === 0) {
        throw Error('用户取消');
      }
      [targetDir] = selection;
      if (fs.readdirSync(targetDir).length !== 0) {
        targetDir = path.join(targetDir, env.RES_DIR_NAME);
      }
    }
    const confirm = showConfirmDialog({ type: 'info', message: `安装将会清除 ${targetDir} 目录` });
    if (confirm < 1) {
      if (process.env.NODE_ENV !== 'development') {
        await updateResource(targetDir, false);
      }
      env.setResourceDir(targetDir);
    } else {
      throw Error('用户取消');
    }
  } catch (error) {
    logger.error(`程序因 ${error} 退出, 如有疑问请联系开发者`);
    throw error;
  }
};

const verifyResourceVersion = async (versionFile) => {
  const current = getResourceVersionFromFile(versionFile);
  if (current < 0) {
    await resourceSelection();
    return true;
  }
  const install = getResourceVersionFromFile(env.INSTALL_VERSION_FILE);
  return (current - install) < 0;
};

const initDataFile = () => initFile(env.DATA_FILE, true);
const initDisplayFile = () => initFile(env.DISPLAY_FILE, false);
const initConfigFile = async () => {
  initFile(env.CONFIG_FILE, false);
  try {
    const config = JSON.parse(fs.readFileSync(env.CONFIG_FILE));
    if (config && config.resources) {
      const versionFile = path.resolve(config.resources, env.RES_VERSION_FILE);
      if (await verifyResourceVersion(versionFile)) {
        if (process.env.NODE_ENV !== 'development') {
          await updateResource(config.resources, true);
        }
      } else {
        logger.info('资源数据版本超过客户端,无需更新');
      }
    } else {
      logger.warn(`无法从获取配置文件 ${env.CONFIG_FILE} 中获取资源目录, 请选择资源目录`);
      if (process.env.NODE_ENV === 'development') {
        env.setResourceDir(path.resolve(__dirname, '../'));
      } else {
        await resourceSelection();
        config.resources = env.getResourceDir();
        fs.writeFileSync(env.CONFIG_FILE, JSON.stringify(config));
      }
    }
    updateEorzeaMapConfig();
    if (config && config.port) {
      env.setServerPort(config.port);
      // TODO 支持自定义端口号
    }
  } catch (error) {
    logger.error(`初始化配置失败, error ${error}`);
    throw error;
  }
};

const bootstrap = async () => {
  initDataDir();
  // TODO 文件合规检测
  initDataFile();
  initDisplayFile();
  await initConfigFile();
};

module.exports = {
  bootstrap,
};
