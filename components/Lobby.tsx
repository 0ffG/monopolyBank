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

  const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="m22 21-2-2"></path>
      <path d="m16 16 2 2"></path>
      <circle cx="20" cy="8" r="3"></circle>
    </svg>
  );

  const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-12 max-w-6xl w-full min-h-[600px] md:min-h-[700px] transform transition-all duration-500 hover:scale-105">
      {/* Header */}
      <div className="relative mb-6 md:mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 transform -skew-y-2 rounded-lg"></div>
        <div className="relative bg-white p-4 md:p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-800 text-center mb-2 md:mb-4 tracking-wider">
            LOBİ
          </h1>
          <div className="flex items-center justify-center space-x-2 md:space-x-4">
            <span className="text-lg md:text-2xl font-bold text-purple-600">Kod:</span>
            <div className="bg-gray-100 px-3 md:px-6 py-2 md:py-3 rounded-full border-2 border-gray-300">
              <span className="text-xl md:text-3xl font-mono font-bold text-gray-800 tracking-widest">{lobby.code}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-4 md:mb-8">
        <div className="bg-gray-100 p-1 md:p-2 rounded-full shadow-inner">
          <div className="flex space-x-1 md:space-x-2">
            <button
              onClick={() => setActiveTab("players")}
              className={`flex items-center space-x-2 md:space-x-3 px-4 md:px-8 py-2 md:py-4 rounded-full transition-all duration-300 ${
                activeTab === "players" 
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105" 
                  : "text-gray-600 hover:text-gray-800 hover:bg-white"
              }`}
            >
              <UsersIcon />
              <span className="text-sm md:text-lg font-semibold">Oyuncular</span>
            </button>
            {isHost && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center space-x-2 md:space-x-3 px-4 md:px-8 py-2 md:py-4 rounded-full transition-all duration-300 ${
                  activeTab === "settings" 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105" 
                    : "text-gray-600 hover:text-gray-800 hover:bg-white"
                }`}
              >
                <SettingsIcon />
                <span className="text-sm md:text-lg font-semibold">Ayarlar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Players Tab */}
      {activeTab === "players" && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl md:rounded-2xl p-4 md:p-8 mb-4 md:mb-8">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">Oyuncular</h3>
          <div className="grid gap-3 md:gap-4">
            {lobby.players.map((player, index) => (
              <div 
                key={player.id} 
                className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:justify-between md:items-center">
                  <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-lg md:text-xl font-semibold text-gray-800 truncate">{player.name}</div>
                      {player.id === lobby.hostId && (
                        <div className="flex items-center mt-1">
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                            👑 HOST
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isHost && player.id !== lobby.hostId && (
                    <button
                      onClick={() => handleKickPlayer(player.id)}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-sm md:text-base w-full md:w-auto flex-shrink-0"
                    >
                      Çıkar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && isHost && (
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 mb-8">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">Oyun Ayarları</h3>
          
          <div className="grid gap-8">
            {/* Başlangıç Bakiyesi */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-xl font-semibold text-gray-700 mb-4">💰 Başlangıç Bakiyesi</label>
              <input
                type="number"
                value={gameSettings.initialBalance}
                onChange={(e) => setGameSettings({...gameSettings, initialBalance: Number(e.target.value)})}
                className="w-full border-2 border-gray-300 rounded-full p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Başlangıç bakiyesi..."
              />
            </div>

            {/* İlk Oyuncu */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-xl font-semibold text-gray-700 mb-4">🎯 İlk Oyuncu</label>
              <select
                value={gameSettings.firstPlayer}
                onChange={(e) => setGameSettings({...gameSettings, firstPlayer: e.target.value})}
                className="w-full border-2 border-gray-300 rounded-full p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                {lobby.players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sıra Düzeni */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-xl font-semibold text-gray-700 mb-4">🔄 Sıra Düzeni</label>
              <div className="space-y-3">
                {gameSettings.turnOrder.map((playerId, index) => (
                  <div key={playerId} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <span className="text-lg font-medium text-gray-800">{getPlayerName(playerId)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleTurnOrderChange(playerId, "up")}
                        disabled={index === 0}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleTurnOrderChange(playerId, "down")}
                        disabled={index === gameSettings.turnOrder.length - 1}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-2 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hızlı Butonlar */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <label className="block text-xl font-semibold text-gray-700 mb-4">⚡ Hızlı Transfer Butonları</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gameSettings.quickButtons.map((amount, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Buton {index + 1}</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        const newButtons = [...gameSettings.quickButtons] as [number, number, number];
                        newButtons[index] = Number(e.target.value);
                        setGameSettings({...gameSettings, quickButtons: newButtons});
                      }}
                      className="w-full border-2 border-gray-300 rounded-full p-3 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleUpdateSettings}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:-translate-y-1 transition duration-300 ease-in-out text-xl"
            >
              💾 Ayarları Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Start Game Button */}
      {isHost && (
        <div className="text-center mt-6 md:mt-8">
          <button
            onClick={handleStartGame}
            className="w-full max-w-md bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 md:py-6 px-8 md:px-12 rounded-full shadow-2xl transform hover:-translate-y-2 transition duration-300 ease-in-out text-lg md:text-2xl"
          >
            🚀 OYUNU BAŞLAT
          </button>
        </div>
      )}
    </div>
  );
}
