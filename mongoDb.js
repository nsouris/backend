import mongoose from 'mongoose';
import { Emitter } from '@socket.io/mongo-emitter';
import appInsightsClient from './analytics.js';
import os from 'os';
import debug from 'debug';
import { errorHandler } from './errorHandler.js';

const hostName = os.hostname();
const appLogger = debug('backend');
appLogger.color = 1;

try {
  mongoose.set('strictQuery', false); // if true only the fields that are specified in the Schema will be saved
  mongoose.set('toJSON', { virtuals: true });
  await mongoose.connect(
    `${process.env.MONGODB_CONN_STRING}${process.env.MAIN_DB}?retryWrites=true&w=majority&appName=Cluster0`
  );
  appLogger(`🌎 Connection to  ${process.env.MAIN_DB} Succesful! 🌎`);
  appInsightsClient.trackEvent({
    name: `🌎 Connection to  MainDb Succesful! 🌎`,
    properties: { backend: hostName, pid: process.pid },
  });
} catch (error) {
  errorHandler.handle(
    error,
    { isCritical: 0 },
    `BackEnd connection to ${process.env.MAIN_DB} error`
  );
}
const defaultConnection = mongoose.connection;

defaultConnection.on('error', error => {
  errorHandler.handle(
    error,
    { isCritical: 0 },
    `BackEnd Default Connection error`
  );
});
defaultConnection.on('disconnected', () => {
  const name = `🌞 Backend disconnected from ${process.env.MAIN_DB}`;
  appLogger(name);
  appInsightsClient.trackEvent({
    name,
    properties: { backend: hostName, pid: process.pid },
  });
});

mongoose
  .createConnection(
    `${process.env.MONGODB_CONN_STRING}${process.env.ADAPTER_DB}?retryWrites=true&w=majority&appName=Cluster0`
  )
  .asPromise()
  .then(() => {
    const name = `🌎 BackEnd connected to ${process.env.ADAPTER_DB} 🌎`;
    appLogger(name);
    appInsightsClient.trackEvent({
      name,
      properties: { backend: hostName, pid: process.pid },
    });
  })
  .catch(error => {
    errorHandler.handle(
      error,
      { isCritical: 0 },
      `BackEnd Connection to ${process.env.ADAPTER_DB} error`
    );
  });

const adapterConnection = mongoose.connections.at(1);
export const adapterCollection = adapterConnection.collection(
  process.env.ADAPTER_COLLECTION
);
try {
  adapterCollection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 60, background: true }
  );
} catch (error) {
  errorHandler.handle(
    error,
    {},
    `BackEnd Create Index for ${process.env.ADAPTER_COLLECTION} error`
  );
}

adapterConnection.on('error', error => {
  errorHandler.handle(
    error,
    { isCritical: 0 },
    `Backend Adapter Connection error`
  );
});
adapterConnection.on('disconnected', () => {
  const name = `🌞 Backend disconnected from ${process.env.ADAPTER_DB}`;
  appInsightsClient.trackEvent({
    name,
    properties: { backend: hostName, pid: process.pid },
  });
  appLogger(name);
});

export const emitter = new Emitter(adapterCollection, undefined, {
  addCreatedAtField: true,
});
