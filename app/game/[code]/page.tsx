"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSocket } from "../../../lib/socket";

import PlayerList from "../../../components/PlayerList";
import GameControls from "../../../components/GameControls";
import TransactionHistory from "../../../components/TransactionHistory";

interface GameState {
  currentTurn: string;
  balances: Record<string, number>;
  history: any[];
}

interface Player {
  id: string;
  name: string;
}

interface Lobby {
  code: string;
  hostId: string;
  players: Player[];
}

export default function GamePage() {
  const { code } = useParams(); // URL'deki lobby code
  const socket = getSocket();

  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [myId, setMyId] = useState<string>("");

  useEffect(() => {
    // socket.id'yi öğrenmek için
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    // lobby güncellemelerini dinle
    socket.on("lobby-updated", (updatedLobby: Lobby) => {
      setLobby(updatedLobby);
    });

    // oyun güncellemelerini dinle
    socket.on("game-updated", (updatedGame: GameState) => {
      setGame(updatedGame);
    });

    // hata mesajlarını dinle
    socket.on("error-message", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.off("connect");
      socket.off("lobby-updated");
      socket.off("game-updated");
      socket.off("error-message");
    };
  }, [socket]);

  if (!lobby) {
    return <div>⏳ Lobby bilgisi yükleniyor...</div>;
  }

  if (!game) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Lobby Kodu: {lobby.code}</h2>
        <PlayerList players={lobby.players} />
        {lobby.hostId === myId ? (
          <p>🎮 Host olarak Start Game butonuna basabilirsin (Lobby ekranında).</p>
        ) : (
          <p>⌛ Oyun başlaması için host’u bekliyorsun...</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="col-span-1">
        <h2 className="text-xl font-bold mb-2">Oyuncular</h2>
        <PlayerList players={lobby.players} balances={game.balances} />
      </div>
      <div className="col-span-1">
        <GameControls
          lobbyCode={lobby.code}
          currentPlayerId={game.currentTurn}
          myPlayerId={myId}
          players={lobby.players}
        />
      </div>
      <div className="col-span-1">
        <TransactionHistory
          isHost={lobby.hostId === myId}
          lobbyCode={lobby.code}
        />
      </div>
    </div>
  );
}
