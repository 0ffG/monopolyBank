"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSocket } from "../../../lib/socket";
import PlayerList from "../../../components/PlayerList";
import GameControls from "../../../components/GameControls";
import TransactionHistory from "../../../components/TransactionHistory";

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

interface GameState {
  currentTurn: string;
  balances: Record<string, number>;
  history: { id: string; action: string; details: any }[];
  code: string;
  gameSettings: GameSettings;
}

interface LobbyType {
  code: string;
  hostId: string;
  players: Player[];
  gameSettings: GameSettings;
}

export default function GamePage() {
  const params = useParams();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;

  const socket = getSocket();

  const [lobby, setLobby] = useState<LobbyType | null>(null);
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    if (!code) return;

    // ✅ Sayfa açıldığında mevcut state'i backend'den iste
    socket.emit("get-lobby-state", { code });
    socket.emit("get-game-state", { code });

    // Lobby güncelleme eventleri
    socket.on("lobby-updated", (updatedLobby: LobbyType) => {
      console.log("📥 Lobby geldi:", updatedLobby);
      setLobby(updatedLobby);
    });

    // Game state güncelleme eventleri
    socket.on("game-updated", (updatedGame: GameState) => {
      console.log("📥 Oyun durumu geldi:", updatedGame);
      setGame(updatedGame);
    });

    socket.on("transaction-history", (history) => {
      setGame((prev) =>
        prev
          ? { ...prev, history }
          : { 
              currentTurn: "", 
              balances: {}, 
              history, 
              code,
              gameSettings: {
                initialBalance: 1500,
                firstPlayer: "",
                turnOrder: [],
                quickButtons: [50, 100, 200]
              }
            }
      );
    });

    return () => {
      socket.off("lobby-updated");
      socket.off("game-updated");
      socket.off("transaction-history");
    };
  }, [socket, code]);

  // ✅ Eğer URL'de code yoksa
  if (!code) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center transform transition-all duration-500">
          <div className="text-6xl mb-6">❌</div>
          <p className="text-2xl font-bold text-red-600">Geçersiz oyun kodu!</p>
          <p className="text-lg text-gray-500 mt-2">Lütfen geçerli bir oyun koduna sahip olduğunuzdan emin olun.</p>
        </div>
      </main>
    );
  }

  // ✅ Lobby veya game state henüz gelmediyse
  if (!lobby || !game) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center transform transition-all duration-500">
          <div className="animate-spin text-6xl mb-6">🔄</div>
          <p className="text-2xl font-bold text-blue-600">Oyun yükleniyor...</p>
          <p className="text-lg text-gray-500 mt-2">Kod: <span className="font-mono font-bold">{code}</span></p>
        </div>
      </main>
    );
  }

  // ✅ Oyun ekranı render
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-3rem)]">
          {/* Sol → Oyuncular */}
          <div className="lg:col-span-1">
            <PlayerList
              players={lobby.players}
              balances={game.balances}
              currentTurn={game.currentTurn}
            />
          </div>

          {/* Orta → Oyun Kontrolleri */}
          <div className="lg:col-span-1">
            <GameControls
              lobbyCode={lobby.code}
              currentPlayerId={game.currentTurn}
              myPlayerId={socket.id || ""}
              players={lobby.players}
              quickButtons={game.gameSettings.quickButtons}
            />
          </div>

          {/* Sağ → Transaction History */}
          <div className="lg:col-span-1">
            <TransactionHistory
              isHost={socket.id === lobby.hostId}
              lobbyCode={lobby.code}
              players={lobby.players}
            />
          </div>
        </div>
      </div>
    </main>
  );
}