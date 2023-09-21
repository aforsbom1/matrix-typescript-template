import sdk, {
  RoomEvent,
  ClientEvent,
  ReceiptType,
  RoomMemberEvent,
  LocalStorageCryptoStore,
} from "matrix-js-sdk";
import LocalStorage from "node-localstorage";
import {
  MATRIX_ACCESS_TOKEN,
  MATRIX_BASE_URL,
  MATRIX_USER_ID,
  MATRIX_DEVICE_ID,
} from "./config";
import { messageReceived } from "./messages";

import Olm from "@matrix-org/olm";
global.Olm = Olm;

const localStorage = new LocalStorage.LocalStorage("./storage");

export const client = sdk.createClient({
  baseUrl: MATRIX_BASE_URL,
  accessToken: MATRIX_ACCESS_TOKEN,
  userId: MATRIX_USER_ID,
  deviceId: MATRIX_DEVICE_ID,
  cryptoStore: new LocalStorageCryptoStore(localStorage),
});


const init = async () => {
  await client.initCrypto();

  // Keep this for now, probably not a good idea in the long run
  client.setGlobalErrorOnUnknownDevices(false);

  // Sync Bot State
  client.once(ClientEvent.Sync, (state) => {
    if (state === "PREPARED") {
      // Message Event
      client.on(RoomEvent.Timeline, async (event) => {
	if (event.getType() === "m.room.encrypted") {
		await client.decryptEventIfNeeded(event);
	}

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

      // Automatically join rooms when invited
      client.on(RoomMemberEvent.Membership, (event, member) => {
        if (
          member.membership === "invite" &&
          member.userId === client.getUserId()
        ) {
          client.joinRoom(member.roomId);
        }
      });
    }
  });

  client.startClient();
};

init();
