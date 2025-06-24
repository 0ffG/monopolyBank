"use client";

import { GamePlayer } from "@/lib/gameLogic";

type Props = {
  players: GamePlayer[];
  currentTurn: number;
};

export default function MoneyDisplay({ players, currentTurn }: Props) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
      {players.map((p, idx) => (
        <div
          key={p.id}
          className={`p-4 rounded-lg shadow-md text-center border-2 ${
            idx === currentTurn
              ? "bg-green-200 border-green-500"
              : "bg-white border-gray-200"
          }`}
        >
          <p className="font-bold text-lg mb-2">{p.name}</p>
          <p className="text-2xl font-mono">${p.balance}</p>
        </div>
      ))}
    </div>
  );
}

