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
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-500 transform -skew-y-1 rounded-lg"></div>
        <h3 className="relative text-2xl font-bold text-white py-3 text-center tracking-wide">
          🎮 KONTROLLER
        </h3>
      </div>

      {isMyTurn ? (
        <div className="space-y-6">
          {/* Miktar Girişi */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <label className="block text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2">
              <MoneyIcon />
              <span>Miktar</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Miktar girin..."
              className="w-full border-2 border-gray-300 rounded-full p-4 text-lg text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            
            {/* Hızlı Transfer Butonları */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">⚡ Hızlı Miktarlar</label>
              <div className="grid grid-cols-3 gap-3">
                {quickButtons.map((quickAmount, index) => (
                  <button
                    key={index}
                    onClick={() => addQuickAmount(quickAmount)}
                    className="bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  >
                    +{quickAmount}₺
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hedef Oyuncu Seçimi */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <label className="block text-lg font-semibold text-gray-700 mb-4 flex items-center space-x-2">
              <TransferIcon />
              <span>Hedef Oyuncu</span>
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-full p-4 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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

          {/* Aksiyon Butonları */}
          <div className="space-y-4">
            <button
              onClick={handleTransfer}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <TransferIcon />
              <span>💸 Para Transferi</span>
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleAddFromBank}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-6 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <BankIcon />
                <span>➕ Banka Ekle</span>
              </button>
              <button
                onClick={handleRemoveFromBank}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <BankIcon />
                <span>➖ Banka Çıkar</span>
              </button>
            </div>
          </div>

          {/* Sıra Bitirme */}
          <button
            onClick={handleEndTurn}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-5 px-6 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-xl"
          >
            ✅ Sırayı Bitir
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-6">⏳</div>
          <p className="text-xl text-gray-500 font-medium">Şu an senin sıran değil</p>
          <p className="text-lg text-gray-400 mt-2">Sıranı bekle...</p>
        </div>
      )}
    </div>
  );
}