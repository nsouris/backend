import mongoose from 'mongoose';
import { Emitter } from '@socket.io/mongo-emitter';

mongoose.set('strictQuery', false);
mongoose
  .connect(
    `mongodb+srv://orionx7:i7HxupA9otqHGDWo@testcluster.t3fpgoc.mongodb.net/TestMinimal?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(
    _ => console.log('Connection to Db Succesfull!'),
    err => console.log('Somthing Went Wrong:', err)
  );

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from Db!!!');
});

mongoose.set('toJSON', { virtuals: true });

const DB = 'Socket';
const COLLECTION = 'socket.io-adapter-events';
const conn2 = mongoose.createConnection(
  `mongodb+srv://orionx7:i7HxupA9otqHGDWo@testcluster.t3fpgoc.mongodb.net/${DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const mongoCollection = conn2.collection(COLLECTION);

export const emitter = new Emitter(mongoCollection);
