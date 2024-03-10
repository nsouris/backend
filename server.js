import appInsightsClient from './analytics.js';
import debug from 'debug';
import os from 'os';

import { app } from './controllers.js';
import './mongoDb.js';
import { errorHandler } from './errorHandler.js';

export const appLogger = debug('backend');
appLogger.color = 1;
const port = normalizePort(process.env.PORT || '2917');
export const hostName = os.hostname();
export const pid = process.pid;
app.set('port', port);

export const server = app.listen(port, () => {
  const info = `🤙 Express on ${hostName}, pid: ${pid}, listening on port:${
    server.address().port
  }`;
  appLogger(info);
  appInsightsClient.trackEvent({
    name: '🔐 BACKEND SERVER STARTED',
    properties: { hostName, pid },
  });
});

server.on('error', onError);
server.on('listening', onListening);

process.on('uncaughtException', function uncaughtExceptionHandler(error) {
  errorHandler.handle(error, { isCritical: 1 }, 'process uncaughtException');
});

process.on('unhandledRejection', function unhandledRejectionHandler(reason) {
  const error = Error(reason);
  errorHandler.handle(error, { isCritical: 1 }, 'process unhandledRejection');
});

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES': {
      const error = Error(bind + ' requires elevated privileges');
      errorHandler.handle(error, { isCritical: 1 });
      break;
    }
    case 'EADDRINUSE': {
      const error = Error(bind + ' is already in use');
      errorHandler.handle(error, { isCritical: 1 });
      break;
    }
    default:
      throw error;
  }
}
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  appLogger('Listening on ' + bind);
}
