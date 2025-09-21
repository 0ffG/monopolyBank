"use client";

import { useState, useEffect } from "react";
import { getSocket } from "../lib/socket";
import Lobby from "./Lobby";

interface Player {
  id: string;
  name: string;
}

interface LobbyType {
  code: string;
  hostId: string;
  players: Player[];
}

export default function LobbyClient() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [lobby, setLobby] = useState<LobbyType | null>(null);

  const socket = getSocket();

  useEffect(() => {
    socket.on("lobby-updated", (updatedLobby: LobbyType) => {
      setLobby(updatedLobby);
    });

    socket.on("error-message", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.off("lobby-updated");
      socket.off("error-message");
    };
  }, [socket]);

  const handleCreateLobby = () => {
    if (!name) return alert("İsim girmelisin!");
    socket.emit("create-lobby", name);
  };

  const handleJoinLobby = () => {
    if (!name || !code) return alert("İsim ve lobby kodu girmelisin!");
    socket.emit("join-lobby", { code, name });
  };

  if (lobby) {
    return <Lobby lobby={lobby} />;
  }

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        placeholder="İsmin"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2"
      />
      <div className="space-x-2">
        <button
          onClick={handleCreateLobby}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Lobby Oluştur
        </button>
        <input
          type="text"
          placeholder="Lobby kodu"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border p-2"
        />
        <button
          onClick={handleJoinLobby}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Lobby’ye Katıl
        </button>
      </div>
    </div>
  );
}
