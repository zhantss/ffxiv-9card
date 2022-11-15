const extraResources = [
  {
    from: 'dist/ffxiv-9card-assets.zip',
    to: 'ffxiv-9card-assets.zip',
  },
  {
    from: 'dist/ffxiv-9card-assets/ffxiv.9card.version',
    to: '../ffxiv.9card.version',
  },
];
module.exports = {
  appId: 'pro.zhantss.ffxiv.9card',
  productName: 'ffxiv-9card',
  files: [
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
    warningsAsErrors: false,
  },
  directories: {
    buildResources: 'assets',
    output: 'target/electron',
  },
  extraMetadata: {
    PROCESS_ENV: process.env.NODE_ENV,
  },
};
