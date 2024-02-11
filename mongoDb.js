import mongoose from 'mongoose';
import { Emitter } from '@socket.io/mongo-emitter';
import { appLogger } from './server.js';

mongoose.set('strictQuery', false);
mongoose
  .connect(
    `mongodb+srv://primitivo:7ZuIFwncwAlka6oX@cluster0.qyvtcbt.mongodb.net/Minimal?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(
    () => appLogger(`🌎 Connection to  Db Succesfull! 🌎`),
    err => appLogger(`🌞 Connection to Db failed`, err)
  );

mongoose.connection.on('disconnected', () => {
  appLogger('Disconnected from Db!!!');
});

mongoose.set('toJSON', { virtuals: true });

const DB = 'Socket';
const COLLECTION = 'socket.io-adapter-events';
const conn2 = mongoose.createConnection(
  `mongodb+srv://primitivo:7ZuIFwncwAlka6oX@cluster0.qyvtcbt.mongodb.net/${DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const mongoCollection = conn2.collection(COLLECTION);

export const emitter = new Emitter(mongoCollection);
