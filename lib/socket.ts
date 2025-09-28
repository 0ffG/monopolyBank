
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://192.168.1.9:3001", {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket bağlandı! ID:", socket?.id);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("❌ Socket bağlantı hatası:", err.message);
    });
  }

  return socket;
};
