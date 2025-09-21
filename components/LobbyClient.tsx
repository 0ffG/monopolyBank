"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // yönlendirme için
import { getSocket } from "../lib/socket";

interface Player {
  id: string;
  name: string;
}

interface Lobby {
  code: string;
  hostId: string;
  players: Player[];
}

export default function LobbyClient() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [mySocketId, setMySocketId] = useState<string>("");
  const router = useRouter();

  const socket = getSocket();

  useEffect(() => {
    // Socket bağlandığında ID'yi kaydet
    socket.on("connect", () => {
      setMySocketId(socket.id || "");
    });

    socket.on("lobby-updated", (updatedLobby: Lobby) => {
      setLobby(updatedLobby);
    });

    socket.on("game-updated", () => {
      if (lobby) {
        // oyun başladığında otomatik yönlendirme
        router.push(`/game/${lobby.code}`);
      }
    });

    socket.on("error-message", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.off("connect");
      socket.off("lobby-updated");
      socket.off("game-updated");
      socket.off("error-message");
    };
  }, [socket, lobby, router]);

  const handleCreateLobby = () => {
    if (!name) return alert("İsim girmelisin!");
    socket.emit("create-lobby", name);
  };

  const handleJoinLobby = () => {
    if (!name || !code) return alert("İsim ve lobby kodu girmelisin!");
    socket.emit("join-lobby", { code, name });
  };

  const handleStartGame = () => {
    if (!lobby) return;
    socket.emit("start-game", { code: lobby.code });
  };

  return (
    <div className="p-4 space-y-4">
      {!lobby ? (
        <div className="space-y-2">
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
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-2">Lobby Kodu: {lobby.code}</h2>
          <h3 className="font-semibold">Oyuncular:</h3>
          <ul className="list-disc ml-5">
            {lobby.players.map((player) => (
              <li key={player.id}>
                {player.name}{" "}
                {player.id === lobby.hostId && <span>(Host)</span>}
              </li>
            ))}
          </ul>

          {lobby.hostId === mySocketId && (
            <button
              onClick={handleStartGame}
              className="bg-purple-600 text-white px-4 py-2 rounded mt-3"
            >
              Start Game
            </button>
          )}
        </div>
      )}
    </div>
  );
}
