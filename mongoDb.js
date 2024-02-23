import mongoose from 'mongoose';
import { Emitter } from '@socket.io/mongo-emitter';
import appInsightsClient from './analytics.js';
import os from 'os';
import debug from 'debug';
import { handler } from './errorHandler.js';

const hostName = os.hostname();
const appLogger = debug('backend');

try {
  mongoose.set('strictQuery', false); // if true only the fields that are specified in the Schema will be saved
  await mongoose.connect(
    `${process.env.MONGODB_CONN_STRING}${DB}?retryWrites=true&w=majority`
  );
  const info = `🌎 Connection to  MainDb Succesfull! 🌎`;
  appLogger(info);
  appInsightsClient.trackEvent({
    name: info,
    properties: { backend: hostName, pid: process.pid },
  });
} catch (error) {
  handler.handleError(error);
  process.exit(0);
}

mongoose.connection.on('disconnected', () => {
  appLogger(`🌞 Disconnected from MainDb`);
  appInsightsClient.trackEvent({
    name: `🌞 Disconnected from MainDb`,
    properties: {
      frontEnd: hostName,
      pid: process.pid,
    },
  });
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
