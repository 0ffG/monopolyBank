"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "../lib/socket";

interface Player {
  id: string;
  name: string;
}

interface LobbyProps {
  lobby: {
    code: string;
    hostId: string;
    players: Player[];
  };
}

export default function Lobby({ lobby }: LobbyProps) {
  const socket = getSocket();
  const router = useRouter();

  const handleStartGame = () => {
    socket.emit("start-game", { code: lobby.code });
  };

  useEffect(() => {
    socket.on("game-updated", (game) => {
      // Oyun başladığında otomatik game ekranına yönlendir
      router.push(`/game/${game.code}`);
    });

    return () => {
      socket.off("game-updated");
    };
  }, [socket, router]);

  return (
    <div className="p-4 border rounded space-y-3">
      <h2 className="text-xl font-bold">Lobby</h2>
      <p className="font-semibold">Kod: {lobby.code}</p>

      <h3 className="font-semibold mt-2">Oyuncular:</h3>
      <ul className="list-disc ml-5">
        {lobby.players.map((player) => (
          <li key={player.id}>
            {player.name}{" "}
            {player.id === lobby.hostId && (
              <span className="text-purple-600">(Host)</span>
            )}
          </li>
        ))}
      </ul>

      {socket.id === lobby.hostId && (
        <button
          onClick={handleStartGame}
          className="bg-purple-600 text-white px-4 py-2 rounded mt-3"
        >
          Start Game
        </button>
      )}
    </div>
  );
}
