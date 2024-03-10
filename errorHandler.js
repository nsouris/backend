/* eslint-disable no-unused-vars */
import appInsightsClient from './analytics.js';
import debug from 'debug';
import os from 'os';

const hostName = os.hostname();
const pid = process.pid;
const appLogger = debug('backend');
appLogger.color = 1;

export const sendInfoNoTrack = {
  cause: { skipTracking: true, sendInfo: true },
};
export const sendInfo = { cause: { sendInfo: true } };
export const noTrack = { cause: { skipTracking: true } };
class ΕrrorHandler {
  constructor() {
    this.handle = async (error, data, logInfo = '') => {
      appLogger(`🌞 ${logInfo}:`, error.message || '');
      appInsightsClient.trackException({
        exception: error,
        properties: { backEnd: hostName, pid, data, stack: error.stack },
      });
      if (!isNaN(data?.isCritical)) {
        appLogger('🛑 critical error occured');
        appInsightsClient.flush();
        setTimeout(() => process.exit(data.isCritical), 1000);
      }
    };
    this.middleware = async (error, req, res, _next) => {
      appLogger(`🌞 ${req.originalUrl}:`, error.message);
      if (!error.cause?.skipTracking) {
        const data = {
          body: req.body,
          gameState: res.locals.gameState,
          playerName: res.locals.playerName,
        };
        appInsightsClient.trackException({
          exception: error,
          properties: {
            backend: hostName,
            pid,
            data,
            stack: error.stack,
          },
        });
      }
      res.status(500).send({
        message: error.cause?.sendInfo ? error.message : 'Server error',
      });
    };
  }
}

export const errorHandler = new ΕrrorHandler();
