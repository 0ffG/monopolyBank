// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    console.log("🌐 Socket bağlanıyor...");
    socket = io("http://localhost:3001", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket bağlandı:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket bağlantı hatası:", err);
    });
  }

  return socket;
};
