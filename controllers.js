import express from 'express';
import { Chat } from './chat.model.js';

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
  console.log('Requset method and url : ', req.method, req.url);
  console.log('Requset body:', req.body);
  next();
});

app.patch('/', (req, res, next) => {
  if (req.body.msg === 'Q') throw new Error('🌞UnCaught wtF!@!🌞');
  next();
});
app.patch('/', async (req, res) => {
  try {
    if (req.body.msg === 'F') throw new Error('wtF!@!');
    const session = await Chat.startSession();
    await session.withTransaction(async () => {
      const doc = await Chat.findOne({ roomId: 'minimal' }).session(session);
      doc.messages.push(req.body.msg);
      await doc.save();
    });
    session.endSession();
    res.status(202).json('ok');
  } catch (error) {
    console.log('🌞', error.message);
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
    console.log('🌞', error.message);
    res.status(517).json(error.message);
  }
});
