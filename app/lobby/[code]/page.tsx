"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSocket } from "../../../lib/socket";
import Lobby from "../../../components/Lobby";

interface Player {
  id: string;
  name: string;
}

interface GameSettings {
  initialBalance: number;
  firstPlayer: string;
  turnOrder: string[];
  quickButtons: [number, number, number];
}

interface LobbyType {
  code: string;
  hostId: string;
  players: Player[];
  gameSettings: GameSettings;
}

export default function LobbyPage() {
  const { code } = useParams(); // URL’den kodu al
  const router = useRouter();
  const socket = getSocket();

  const [lobby, setLobby] = useState<LobbyType | null>(null);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // Lobby güncellemelerini dinle
    socket.on("lobby-updated", (updatedLobby: LobbyType) => {
      setLobby(updatedLobby);
    });

    // Oyun başladığında game screen’e yönlendir
    socket.on("game-updated", (game) => {
      setGameStarted(true);
      router.push(`/game/${game.code}`);
    });

    return () => {
      socket.off("lobby-updated");
      socket.off("game-updated");
    };
  }, [socket, router]);

  if (!lobby) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p>🔄 Lobby yükleniyor ({code})...</p>
      </main>
    );
  }

  if (gameStarted) {
    return (
      <main className="flex items-center justify-center h-screen">
        <p>🎮 Oyun başlatılıyor...</p>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center h-screen">
      <Lobby lobby={lobby} />
    </main>
  );
}
