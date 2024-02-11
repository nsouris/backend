import express from 'express';
import { Chat } from './chat.model.js';
import os from 'os';
import { appLogger } from './server.js';

const hostName = os.hostname();
const pid = process.pid;

export const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Expose-Headers', '*');
  next();
});

app.use((req, _res, next) => {
  appLogger('Requset method and url : ', req.method, req.url);
  appLogger('Requset body:', req.body);
  appLogger('hosstName', hostName);
  appLogger('id', pid);
  next();
});

app.patch('/', (req, res, next) => {
  if (req.body.msg === 'Q') throw new Error('🌞UnCaught wtF!@!🌞');
  next();
});
app.patch('/', async (req, res) => {
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
    appLogger('🌞', error.message);
    res.status(517).json(error.message);
  }
});
app.post('/', async (req, res) => {
  try {
    const doc = await Chat.findOne({ roomId: 'minimal' });
    doc.messages = [];
    await doc.save();
    res.status(202).json('ok');
  } catch (error) {
    appLogger('🌞', error.message);
    res.status(517).json(error.message);
  }
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
