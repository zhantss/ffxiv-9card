/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const { createLogger, format, transports } = require('winston');
const { LOG_FILE } = require('./env');

// clean log file
if (fs.existsSync(LOG_FILE)) {
  fs.truncateSync(LOG_FILE);
}

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
      filename: LOG_FILE,
      // 10m
      maxsize: 10485760,
      maxFiles: 10,
    }),
  ],
});

module.exports = logger;
