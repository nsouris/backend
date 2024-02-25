import appInsightsClient from './analytics.js';
import debug from 'debug';
import os from 'os';

import { app } from './controllers.js';
import './mongoDb.js';

export const appLogger = debug('backend');
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
/**
 * Normalize a port into ra number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
