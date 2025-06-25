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
  const [amount, setAmount] = useState<number | string>(100); // Başlangıç değeri
  const [target, setTarget] = useState<string>("");

  const send = (event: string, payload: any) => {
    socket.emit(event, { code: lobbyCode, ...payload });
    setAmount(100); // Eylem sonrası sıfırla
  };

  const handleAdd = () => send("add-money", { playerId: meId, amount: Number(amount) });
  const handleSubtract = () => send("subtract-money", { playerId: meId, amount: Number(amount) });
  const handleTransfer = () => {
    if (!target || !amount) return;
    send("transfer-money", { fromId: meId, toId: target, amount: Number(amount) });
  };

  const endTurn = () => socket.emit("end-turn", lobbyCode);

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl space-y-6 backdrop-blur-sm">
      <h2 className="text-2xl font-bold text-slate-200">Action Menu</h2>

      {/* Amount Input */}
      <div className="space-y-3">
        <label htmlFor="amount" className="block text-sm font-medium text-slate-400">Amount</label>
        <input
          id="amount"
          type="number"
          className="border-2 border-slate-600 bg-slate-900 p-3 rounded-lg w-full text-white text-lg font-mono focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition"
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="0"
        />
        <div className="flex gap-2">
          {[100, 500, 1000, 5000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setAmount(Number(amount || 0) + val)}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded-full transition-colors font-semibold"
            >
              +{val.toLocaleString()}
            </button>
          ))}
        </div>
      </div>
      
      {/* Bank Actions */}
      <div className="flex gap-4">
        <button onClick={handleAdd} className="w-full bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105">Receive from Bank</button>
        <button onClick={handleSubtract} className="w-full bg-orange-500 hover:bg-orange-400 text-white font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105">Pay to Bank</button>
      </div>

      {/* Transfer Actions */}
      <div className="space-y-3">
        <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full border-2 border-slate-600 bg-slate-900 p-3 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition">
          <option value="">Select Player...</option>
          {players.filter(p => p.id !== meId).map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button onClick={handleTransfer} disabled={!target} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-transform hover:scale-105 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:transform-none">Transfer</button>
      </div>
      
      <div className="border-t border-slate-700 my-4"></div>

      {/* End Turn */}
      <button onClick={endTurn} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-transform hover:scale-105">End Turn</button>
    </div>
  );
}