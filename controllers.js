import express from 'express';
import { Chat } from './chat.model.js';
import os from 'os';
import appInsightsClient from './analytics.js';
import { appLogger } from './server.js';
import { handler } from './errorHandler.js';

const hostName = os.hostname();
const pid = process.pid;

export const app = express();
app.use(express.json());

const HEADERS = {
  'Content-Security-Policy':
    "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Referrer-Policy': 'no-referrer',
  'Strict-Transport-Security': 'max-age=15552000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'X-XSS-Protection': '0',
};
app.use((_req, res, next) => {
  res.set(HEADERS);
  next();
});
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH,  OPTIONS'
  );
  res.setHeader('Access-Control-Expose-Headers', '*');
  next();
});

app.set('trust proxy', true); // to get the req.ip
app.disable('x-powered-by'); // for hiding being an express app

app.use((req, _res, next) => {
  appLogger('Request method and url : ', req.method, req.url);
  appLogger('Request body:', req.body);
  appLogger('Client ip:', req.ip);
  appLogger('hostName', hostName);
  appLogger('id', pid);
  next();
});

app.patch('/', (req, res, next) => {
  if (req.body.msg === 'Q') throw new Error('🌞UnCaught wtF!@!🌞');
  next();
});
app.patch('/', async (req, res, next) => {
  // appInsightsClient.trackEvent({
  //   name: `🔐🔐🔐Backend patch controler`,
  //   properties: { backend: hostName, pid, requestIp: req.ip },
  // });
  try {
    if (req.body.msg === 'F') throw new Error('wtF!@!');
    if (req.body.roomId === 'cpuLoad') {
      mySlowFunction(req.body.load); // higher number => more iterations => slower
      return res.status(202).json('ok');
    }
    const session = await Chat.startSession();
    await session.withTransaction(async () => {
      const doc = await Chat.findOne({ roomId: req.body.roomId }).session(
        session
      );
      if (!doc) return;
      doc.messages.push(req.body.msg);
      await doc.save();
    });
    session.endSession();
    res.status(202).json('ok');
  } catch (error) {
    next(error);
  }
});
app.post('/', async (req, res, next) => {
  try {
    const doc = await Chat.findOne({ roomId: 'minimal' });
    doc.messages = [];
    await doc.save();
    res.status(202).json('ok');
  } catch (error) {
    next(error);
  }
});
// eslint-disable-next-line no-unused-vars
app.use(async (err, req, res, _next) => {
  await handler.handleError(err, req, res);
});

function mySlowFunction(baseNumber) {
  console.time('mySlowFunction');
  let result = 0;
  for (var i = Math.pow(baseNumber, 7); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i);
  }
  console.timeEnd('mySlowFunction');
  appLogger(result);
}
