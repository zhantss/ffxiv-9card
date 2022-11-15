/* eslint-disable @typescript-eslint/no-var-requires */
const express = require('express');
const expressStaticGzip = require('express-static-gzip');

const logger = require('./logger');

const createResourceServer = (resource, port) => {
  this.server = null;
  this.resource = resource;
  this.port = port == null ? 24321 : port;
  this.isRunning = false;

  this.app = express();

  this.start = () => {
    if (this.server != null) {
      return;
    }
    // gzip
    this.app.use('/', expressStaticGzip(this.resource, {
      serveStatic: {
        maxAge: '6h',
      },
    }));
    this.server = this.app.listen(port, (error) => {
      if (error) {
        logger.error(`资源服务启动失败 ${error}`);
        throw error;
      } else {
        this.isRunning = true;
        logger.debug(`资源服务启动, port on ${this.port}`);
      }
    });
  };

  this.stop = () => {
    if (this.server != null && this.isRunning) {
      this.server.close((error) => {
        if (error) {
          throw error;
        } else {
          this.isRunning = false;
        }
      });
    }
  };
  return this;
};

module.exports = {
  createResourceServer,
};
