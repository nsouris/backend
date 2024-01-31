import mongoose from 'mongoose';
import { Emitter } from '@socket.io/mongo-emitter';

mongoose.set('strictQuery', false);
mongoose
  .connect(
    `mongodb+srv://primitivo:7ZuIFwncwAlka6oX@cluster0.qyvtcbt.mongodb.net/Minimal?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(
    () => console.log(`🌎 Connection to  Db Succesfull! 🌎`),
    err => console.log(`🌞 Connection to Db failed`, err)
  );

mongoose.connection.on('disconnected', () => {
  console.log('Disconnected from Db!!!');
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
