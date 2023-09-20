import sdk, { RoomEvent, ClientEvent, ReceiptType } from "matrix-js-sdk";
import { MATRIX_ACCESS_TOKEN, MATRIX_BASE_URL, MATRIX_USER_ID } from "./config";
import { messageReceived } from "./messages";

export const client = sdk.createClient({
  baseUrl: MATRIX_BASE_URL,
  accessToken: MATRIX_ACCESS_TOKEN,
  userId: MATRIX_USER_ID,
});

// Sync Bot State
client.once(ClientEvent.Sync, (state) => {
  if (state === "PREPARED") {
    // Message Event
    client.on(RoomEvent.Timeline, async (event) => {
      // If the event is not a message, return
      if (event.getType() !== "m.room.message") return;
      // If the message is from the bot, return
      if (event.getSender() === client.getUserId()) return;

      // Get the message content
      const message = event.getContent().body;
      const sender = event.getSender();
      const room = event.getRoomId();

      // If the message is undefined, return
      if (sender === undefined || room === undefined) return;

      // Mark the message as read
      await client.sendReadReceipt(event, ReceiptType.Read, true);

      messageReceived({ room, sender, message });
    });
  }
});

client.startClient();
