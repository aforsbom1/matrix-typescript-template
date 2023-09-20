import { client } from "./app";

type Message = {
  room: string;
  sender: string;
  message: string;
};

// This message is called when a message is received
export const messageReceived = (message: Message) => {
  if (message.message === "!ping") {
    sendMessage(message.room, "Pong!");
  }
};

// This function is used to send a message to a room
export const sendMessage = (room: string, message: string) => {
  client.sendMessage(room, { msgtype: "m.text", body: message });
};
