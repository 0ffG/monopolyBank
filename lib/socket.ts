// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:3001", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      // connection established
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket bağlantı hatası:", err);
    });
  }

  return socket;
};
