"use client";

import { useState } from "react";
import { getSocket } from "../lib/socket";

interface GameControlsProps {
  lobbyCode: string;      // hangi lobby'deyiz
  currentPlayerId: string; // sıra kimde
  myPlayerId: string;      // bu client'in ID'si
  players: { id: string; name: string }[];
  quickButtons?: [number, number, number]; // Hızlı transfer butonları
}

export default function GameControls({
  lobbyCode,
  currentPlayerId,
  myPlayerId,
  players,
  quickButtons = [50, 100, 200], // Varsayılan değerler
}: GameControlsProps) {
  const [amount, setAmount] = useState(0);
  const [targetId, setTargetId] = useState("");
  const socket = getSocket();

  const isMyTurn = currentPlayerId === myPlayerId;

  // Hızlı miktar ekleme
  const addQuickAmount = (quickAmount: number) => {
    setAmount(prev => prev + quickAmount);
  };

  // Oyuncudan oyuncuya para transferi
  const handleTransfer = () => {
    if (!isMyTurn) return alert("Sıra sende değil!");
    if (!targetId || amount <= 0) return alert("Hedef oyuncu ve tutar gerekli!");
    socket.emit("transfer-money", {
      code: lobbyCode,
      from: myPlayerId,
      to: targetId,
      amount,
    });
    setAmount(0);
  };

  // Bankadan ekleme
  const handleAddFromBank = () => {
    if (!isMyTurn) return alert("Sıra sende değil!");
    if (amount <= 0) return alert("Tutar gerekli!");
    socket.emit("bank-action", {
      code: lobbyCode,
      playerId: myPlayerId,
      amount,
      action: "add",
    });
    setAmount(0);
  };

  // Bankadan çıkarma
  const handleRemoveFromBank = () => {
    if (!isMyTurn) return alert("Sıra sende değil!");
    if (amount <= 0) return alert("Tutar gerekli!");
    socket.emit("bank-action", {
      code: lobbyCode,
      playerId: myPlayerId,
      amount,
      action: "remove",
    });
    setAmount(0);
  };

  // Sıra bitirme
  const handleEndTurn = () => {
    if (!isMyTurn) return alert("Sıra sende değil!");
    socket.emit("end-turn", { code: lobbyCode });
  };

  const MoneyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 6v12"></path>
      <path d="M15 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
    </svg>
  );

  const TransferIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );

  const BankIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"></path>
      <path d="M5 21V7l8-4v18"></path>
      <path d="M19 21V11l-4-2v12"></path>
    </svg>
  );

  return (
    <div className="bg-white rounded-lg md:rounded-xl shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="relative p-2.5 md:p-4 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 rounded-t-lg md:rounded-t-xl"></div>
        <h3 className="relative text-lg md:text-2xl font-bold text-white text-center tracking-wide">
          🎮 OYUN KONTROLLERI
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-2.5 md:p-4 overflow-y-auto">
        {isMyTurn ? (
          <div className="space-y-3 md:space-y-5">
            {/* Miktar Girişi */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg md:rounded-xl p-3 md:p-5">
              <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2.5 md:mb-4 flex items-center justify-center space-x-2">
                <MoneyIcon />
                <span>💰 Miktar Belirle</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder="Miktar girin..."
                className="w-full border-2 border-gray-300 rounded-lg md:rounded-xl p-3 md:p-4 text-xl md:text-2xl text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-lg"
              />
              
              {/* Hızlı Transfer Butonları */}
              <div className="mt-2.5 md:mt-4">
                <label className="block text-sm md:text-base font-medium text-gray-600 mb-2 md:mb-3 text-center">⚡ Hızlı Miktarlar</label>
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  {quickButtons.map((quickAmount, index) => (
                    <button
                      key={index}
                      onClick={() => addQuickAmount(quickAmount)}
                      className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-3 md:py-4 px-3 md:px-6 rounded-xl md:rounded-2xl shadow-lg transform hover:-translate-y-1 md:hover:-translate-y-2 hover:scale-105 transition-all duration-300 text-sm md:text-lg"
                    >
                      +{quickAmount}₺
                    </button>
                  ))}
                </div>
              </div>

              {/* Miktar Temizleme */}
              <div className="mt-3 md:mt-4 text-center">
                <button
                  onClick={() => setAmount(0)}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 md:px-6 rounded-full shadow-md transform hover:scale-105 transition-all duration-300 text-sm md:text-base"
                >
                  🗑️ Temizle
                </button>
              </div>
            </div>

            {/* Hedef Oyuncu Seçimi */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl md:rounded-2xl p-4 md:p-8">
              <label className="block text-lg md:text-2xl font-semibold text-gray-700 mb-3 md:mb-6 flex items-center justify-center space-x-2 md:space-x-3">
                <TransferIcon />
                <span>🎯 Hedef Oyuncu</span>
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full border-2 md:border-3 border-gray-300 rounded-xl md:rounded-2xl p-4 md:p-6 text-lg md:text-xl focus:outline-none focus:ring-2 md:focus:ring-4 focus:ring-purple-500 focus:border-transparent transition shadow-lg"
              >
                <option value="">Oyuncu seçin...</option>
                {players
                  .filter((p) => p.id !== myPlayerId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Ana Aksiyon Butonları */}
            <div className="space-y-3 md:space-y-6">
              <button
                onClick={handleTransfer}
                disabled={!targetId || amount <= 0}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 md:py-6 px-6 md:px-8 rounded-xl md:rounded-2xl shadow-xl transform hover:-translate-y-1 md:hover:-translate-y-2 disabled:transform-none transition-all duration-300 flex items-center justify-center space-x-2 md:space-x-3 text-lg md:text-2xl"
              >
                <TransferIcon />
                <span>💸 Para Transferi</span>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <button
                  onClick={handleAddFromBank}
                  disabled={amount <= 0}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 md:py-6 px-4 md:px-6 rounded-xl md:rounded-2xl shadow-xl transform hover:-translate-y-1 md:hover:-translate-y-2 disabled:transform-none transition-all duration-300 flex items-center justify-center space-x-2 md:space-x-3 text-base md:text-lg"
                >
                  <BankIcon />
                  <span>🏦➕ Bankadan Ekle</span>
                </button>
                <button
                  onClick={handleRemoveFromBank}
                  disabled={amount <= 0}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-bold py-4 md:py-6 px-4 md:px-6 rounded-xl md:rounded-2xl shadow-xl transform hover:-translate-y-1 md:hover:-translate-y-2 disabled:transform-none transition-all duration-300 flex items-center justify-center space-x-2 md:space-x-3 text-base md:text-lg"
                >
                  <BankIcon />
                  <span>🏦➖ Bankadan Çıkar</span>
                </button>
              </div>
            </div>

            {/* Sıra Bitirme */}
            <div className="pt-4 md:pt-6 border-t-2 border-gray-200">
              <button
                onClick={handleEndTurn}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold py-5 md:py-8 px-6 md:px-8 rounded-xl md:rounded-2xl shadow-2xl transform hover:-translate-y-1 md:hover:-translate-y-2 hover:scale-105 transition-all duration-300 text-lg md:text-2xl"
              >
                ✅ Sırayı Bitir ve Devret
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 md:space-y-8">
            <div className="text-6xl md:text-9xl animate-pulse">⏳</div>
            <div className="space-y-2 md:space-y-4">
              <p className="text-xl md:text-3xl text-gray-600 font-bold">Şu an senin sıran değil</p>
              <p className="text-lg md:text-xl text-gray-400">Sıranı bekle...</p>
              <div className="mt-4 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl md:rounded-2xl border-2 border-yellow-200">
                <p className="text-sm md:text-lg text-yellow-800 font-semibold">
                  💡 <strong>İpucu:</strong> Diğer oyuncuların işlemlerini geçmişten takip edebilirsin!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}