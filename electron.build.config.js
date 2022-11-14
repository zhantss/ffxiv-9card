const includeEorzeaMap = process.env.EORZEAMAP;
const extraResources = [
  {
    from: 'eorzea-map/index.html',
    to: '../eorzea-map/index.html',
  },
  {
    from: 'eorzea-map/online.html',
    to: '../eorzea-map/online.html',
  },
  {
    from: 'eorzea-map/static',
    to: '../eorzea-map/static',
  },
];
if (includeEorzeaMap) {
  extraResources.push({
    from: 'eorzea-map/assets',
    to: '../eorzea-map/assets',
  });
}
module.exports = {
  appId: 'pro.zhantss.ffxiv.9card',
  productName: 'ffxiv-9card',
  files: [
    'dist/**',
    'public/**',
    'client/**',
    'main.js',
    'preload.js',
    'electron/**',
  ],
  extraResources,
  mac: {
    category: 'public.app-category.utilities',
  },
  win: {
    target: 'nsis',
    icon: 'public/favicon_256.ico',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    installerIcon: 'public/favicon_256.ico',
    installerHeaderIcon: 'public/favicon_256.ico',
    deleteAppDataOnUninstall: true,
  },
  directories: {
    buildResources: 'assets',
    output: 'target/electron',
  },
  extraMetadata: {
    PROCESS_ENV: process.env.NODE_ENV,
  },
};
