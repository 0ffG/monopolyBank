"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

type Player = { id: string; name: string };

type Props = {
  players: Player[];
  isOwner: boolean;
  lobbyCode: string;
  owner: string;
};

export default function PlayerList({ players, isOwner, lobbyCode, owner }: Props) {
  const socket = getSocket();
  const [order, setOrder] = useState<Player[]>(players);

  useEffect(() => {
    setOrder(players);
  }, [players]);

  const move = (index: number, dir: number) => {
    const newOrder = [...order];
    const target = index + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setOrder(newOrder);
    socket.emit("set-player-order", {
      code: lobbyCode,
      order: newOrder.map((p) => p.id),
    });
  };

  return (
    <ul className="mb-6 space-y-2">
      {order.map((player, i) => (
        <li
          key={player.id}
          className="py-2 px-4 bg-gradient-to-r from-cyan-200 to-blue-400 rounded-lg flex items-center justify-between shadow-md border-2 border-blue-300"
        >
          <span className="font-bold text-indigo-800 text-lg drop-shadow">
            {player.name && player.name.trim() !== "" ? player.name : "İsimsiz Oyuncu"}
          </span>
          <div className="flex items-center gap-1">
            {player.name === owner && (
              <span className="text-base text-purple-700 font-extrabold bg-purple-100 px-3 py-1 rounded-full shadow mr-2">
                Kurucu
              </span>
            )}
            {isOwner && (
              <>
                <button
                  className="px-2 text-sm border rounded disabled:opacity-50 font-bold text-blue-700 bg-blue-200 hover:bg-blue-300 transition-colors"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                >
                  ▲
                </button>
                <button
                  className="px-2 text-sm border rounded disabled:opacity-50 font-bold text-blue-700 bg-blue-200 hover:bg-blue-300 transition-colors"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                >
                  ▼
                </button>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
