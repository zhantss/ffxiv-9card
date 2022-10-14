/* eslint-disable @typescript-eslint/no-var-requires */
const { createLogger, format, transports } = require('winston');
const env = require('./env');

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
      filename: `${env.FFXIV_9CARD_PATH}/logs/ffxiv-9card.log`,
    }),
  ],
});

module.exports = logger;
