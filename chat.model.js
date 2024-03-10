import mongoose, { Schema } from 'mongoose';
import { emitter } from './mongoDb.js';
import os from 'os';

const hostName = os.hostname();

const chatSchema = new Schema(
  { roomId: { type: String }, messages: { type: Array } },
  { versionKey: false, minimize: false } // for saving empty objects
);

const Chat = mongoose.model('chat', chatSchema);

Chat.watch({ fullDocument: 'updateLookup' }).on('change', data => {
  // appInsightsClient.trackEvent({
  //   name: 'WATCH STREAM',
  //   properties: { data, pid: process.pid },
  // });
  emitter.emit('update', hostName, data.fullDocument.messages);
});

export { Chat };
