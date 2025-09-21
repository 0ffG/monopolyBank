"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "../lib/socket";

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

interface LobbyProps {
  lobby: {
    code: string;
    hostId: string;
    players: Player[];
    gameSettings: GameSettings;
  };
}

export default function Lobby({ lobby }: LobbyProps) {
  const socket = getSocket();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"players" | "settings">("players");
  const [gameSettings, setGameSettings] = useState<GameSettings>(lobby.gameSettings);

  const isHost = socket.id === lobby.hostId;

  const handleStartGame = () => {
    socket.emit("start-game", { code: lobby.code });
  };

  const handleKickPlayer = (playerId: string) => {
    socket.emit("kick-player", { code: lobby.code, playerId });
  };

  const handleUpdateSettings = () => {
    socket.emit("update-game-settings", { 
      code: lobby.code, 
      gameSettings 
    });
  };

  const handleTurnOrderChange = (playerId: string, direction: "up" | "down") => {
    const currentIndex = gameSettings.turnOrder.indexOf(playerId);
    if (currentIndex === -1) return;

    const newOrder = [...gameSettings.turnOrder];
    if (direction === "up" && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    } else if (direction === "down" && currentIndex < newOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    }

    setGameSettings({ ...gameSettings, turnOrder: newOrder });
  };

  const getPlayerName = (id: string) => {
    const player = lobby.players.find(p => p.id === id);
    return player ? player.name : "Bilinmeyen Oyuncu";
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

  useEffect(() => {
    setGameSettings(lobby.gameSettings);
  }, [lobby.gameSettings]);

  return (
    <div className="p-4 border rounded space-y-3">
      <h2 className="text-xl font-bold">Lobby</h2>
      <p className="font-semibold">Kod: {lobby.code}</p>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        <button
          onClick={() => setActiveTab("players")}
          className={`px-4 py-2 ${activeTab === "players" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500"}`}
        >
          Oyuncular
        </button>
        {isHost && (
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 ${activeTab === "settings" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-500"}`}
          >
            Oyun Ayarları
          </button>
        )}
      </div>

      {/* Players Tab */}
      {activeTab === "players" && (
        <div className="space-y-3">
          <h3 className="font-semibold">Oyuncular:</h3>
          <ul className="space-y-2">
            {lobby.players.map((player) => (
              <li key={player.id} className="flex justify-between items-center">
                <span>
                  {player.name}{" "}
                  {player.id === lobby.hostId && (
                    <span className="text-purple-600">(Host)</span>
                  )}
                </span>
                {isHost && player.id !== lobby.hostId && (
                  <button
                    onClick={() => handleKickPlayer(player.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Çıkar
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && isHost && (
        <div className="space-y-4">
          <h3 className="font-semibold">Oyun Ayarları:</h3>
          
          {/* Başlangıç Bakiyesi */}
          <div>
            <label className="block text-sm font-medium mb-1">Başlangıç Bakiyesi:</label>
            <input
              type="number"
              value={gameSettings.initialBalance}
              onChange={(e) => setGameSettings({...gameSettings, initialBalance: Number(e.target.value)})}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* İlk Oyuncu */}
          <div>
            <label className="block text-sm font-medium mb-1">İlk Oyuncu:</label>
            <select
              value={gameSettings.firstPlayer}
              onChange={(e) => setGameSettings({...gameSettings, firstPlayer: e.target.value})}
              className="border p-2 rounded w-full"
            >
              {lobby.players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sıra Düzeni */}
          <div>
            <label className="block text-sm font-medium mb-2">Sıra Düzeni:</label>
            <div className="space-y-2">
              {gameSettings.turnOrder.map((playerId, index) => (
                <div key={playerId} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>{index + 1}. {getPlayerName(playerId)}</span>
                  <div className="space-x-1">
                    <button
                      onClick={() => handleTurnOrderChange(playerId, "up")}
                      disabled={index === 0}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleTurnOrderChange(playerId, "down")}
                      disabled={index === gameSettings.turnOrder.length - 1}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs disabled:opacity-50"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hızlı Butonlar */}
          <div>
            <label className="block text-sm font-medium mb-2">Hızlı Transfer Butonları:</label>
            <div className="grid grid-cols-3 gap-2">
              {gameSettings.quickButtons.map((amount, index) => (
                <div key={index}>
                  <label className="block text-xs mb-1">Buton {index + 1}:</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      const newButtons = [...gameSettings.quickButtons] as [number, number, number];
                      newButtons[index] = Number(e.target.value);
                      setGameSettings({...gameSettings, quickButtons: newButtons});
                    }}
                    className="border p-1 rounded w-full text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleUpdateSettings}
            className="bg-green-500 text-white px-4 py-2 rounded w-full"
          >
            Ayarları Kaydet
          </button>
        </div>
      )}

      {isHost && (
        <button
          onClick={handleStartGame}
          className="bg-purple-600 text-white px-4 py-2 rounded mt-3 w-full"
        >
          Oyunu Başlat
        </button>
      )}
    </div>
  );
}
