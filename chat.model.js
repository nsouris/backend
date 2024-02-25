import mongoose, { Schema } from 'mongoose';
import appInsightsClient from './analytics.js';
import { emitter } from './mongoDb.js';

const chatSchema = new Schema(
  { roomId: { type: String }, messages: { type: Array } },
  { versionKey: false, minimize: false } // for saving empty objects
);

const Chat = mongoose.model('chat', chatSchema);

Chat.watch({ fullDocument: 'updateLookup' }).on('change', data => {
  appInsightsClient.trackEvent({
    name: '🧧🧧 WATC STREAM',
    properties: { data, pid: process.pid },
  });
  emitter.emit('update', data.fullDocument.messages, process.pid);
});

export { Chat };
