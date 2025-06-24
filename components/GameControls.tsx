"use client";

import { useState } from "react";
import { GamePlayer } from "@/lib/gameLogic";
import { getSocket } from "@/lib/socket";

type Props = {
  lobbyCode: string;
  players: GamePlayer[];
  meId: string;
};

export default function GameControls({ lobbyCode, players, meId }: Props) {
  const socket = getSocket();
  const [amount, setAmount] = useState(0);
  const [target, setTarget] = useState<string>("");

  const send = (event: string, payload: any) => {
    socket.emit(event, { code: lobbyCode, ...payload });
    setAmount(0);
  };

  const handleAdd = () => send("add-money", { playerId: meId, amount });
  const handleSubtract = () => send("subtract-money", { playerId: meId, amount });
  const handleTransfer = () => {
    if (!target) return;
    send("transfer-money", { fromId: meId, toId: target, amount });
  };

  const endTurn = () => socket.emit("end-turn", lobbyCode);

  return (
    <div className="space-y-2">
      <input
        type="number"
        className="border p-1 rounded w-full"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      {/* Quick amount buttons */}
      <div className="flex gap-2">
        {[10, 50, 100].map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => setAmount((a) => a + val)}
            className="bg-gray-200 text-black px-2 py-1 rounded"
          >
            +{val}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={handleAdd} className="bg-green-500 text-white px-3 py-1 rounded">Ekle</button>
        <button onClick={handleSubtract} className="bg-yellow-500 text-white px-3 py-1 rounded">Çıkar</button>
      </div>
      <div className="flex items-center gap-2">
        <select className="border p-1 rounded" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Seç Oyuncu</option>
          {players.filter(p => p.id !== meId).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button onClick={handleTransfer} className="bg-blue-500 text-white px-3 py-1 rounded">Transfer</button>
      </div>
      <button onClick={endTurn} className="bg-gray-700 text-white px-3 py-1 rounded w-full">Sıra Bitir</button>
    </div>
  );
}

