"use client";

import { useState } from "react";
import { getSocket } from "../lib/socket";

interface GameControlsProps {
  lobbyCode: string;      // hangi lobby’deyiz
  currentPlayerId: string; // sıra kimde
  myPlayerId: string;      // bu client’in ID’si
  players: { id: string; name: string }[];
}

export default function GameControls({
  lobbyCode,
  currentPlayerId,
  myPlayerId,
  players,
}: GameControlsProps) {
  const [amount, setAmount] = useState(0);
  const [targetId, setTargetId] = useState("");
  const socket = getSocket();

  const isMyTurn = currentPlayerId === myPlayerId;

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

  return (
    <div className="p-4 border rounded space-y-3">
      <h3 className="font-bold">Oyun Kontrolleri</h3>
      {isMyTurn ? (
        <>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Miktar"
            className="border p-2"
          />
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="border p-2"
          >
            <option value="">Hedef Oyuncu</option>
            {players
              .filter((p) => p.id !== myPlayerId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>

          <div className="space-x-2">
            <button
              onClick={handleTransfer}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Para Transferi
            </button>
            <button
              onClick={handleAddFromBank}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Bankadan Ekle
            </button>
            <button
              onClick={handleRemoveFromBank}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Bankadan Çıkar
            </button>
          </div>
          <button
            onClick={handleEndTurn}
            className="bg-gray-600 text-white px-3 py-1 rounded mt-2"
          >
            Sırayı Bitir
          </button>
        </>
      ) : (
        <p>Şu an senin sıran değil.</p>
      )}
    </div>
  );
}
