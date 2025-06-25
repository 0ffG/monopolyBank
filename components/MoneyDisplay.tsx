"use client";

import { GamePlayer } from "@/lib/gameLogic";

type Props = {
  players: GamePlayer[];
  currentTurn: number;
  myId: string; // Kendi ID'mizi bilmek, kendimizi vurgulamak için faydalı olabilir.
};

export default function MoneyDisplay({ players, currentTurn, myId }: Props) {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-slate-200">Players</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((p, idx) => (
            <div
              key={p.id}
              className={`
                p-5 rounded-xl shadow-lg transition-all duration-300
                flex flex-col items-center justify-center space-y-2
                ${
                  idx === currentTurn
                    ? "bg-cyan-500/10 ring-2 ring-cyan-400 scale-105" // Sıradaki oyuncu
                    : "bg-slate-700/50" // Diğer oyuncular
                }
              `}
            >
              <p className="font-bold text-xl text-white truncate">
                {p.name}
                {p.id === myId && " (You)"}
              </p>
              <p className="text-3xl font-mono text-cyan-300 font-semibold tracking-wider">${p.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
    </div>
  );
}