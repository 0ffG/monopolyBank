"use client";

import { GamePlayer } from "@/lib/gameLogic";

type Props = {
  players: GamePlayer[];
  currentTurn: number;
};

export default function MoneyDisplay({ players, currentTurn }: Props) {
  return (
    <table className="min-w-full text-left border-collapse">
      <thead>
        <tr>
          <th className="px-4 py-2">Oyuncu</th>
          <th className="px-4 py-2">Bakiye</th>
        </tr>
      </thead>
      <tbody>
        {players.map((p, idx) => (
          <tr
            key={p.id}
            className={idx === currentTurn ? "bg-green-100" : ""}
          >
            <td className="px-4 py-2 font-medium">{p.name}</td>
            <td className="px-4 py-2">${p.balance}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

