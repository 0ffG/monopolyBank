"use client";

import { Transaction, GamePlayer } from "@/lib/gameLogic";

type Props = {
  transactions: Transaction[];
  players: GamePlayer[];
  isOwner: boolean;
  lobbyCode: string;
};

export default function TransactionHistory({ transactions, players, isOwner, lobbyCode }: Props) {
  const socket = require("@/lib/socket").getSocket();

  const nameOf = (id?: string) => players.find(p => p.id === id)?.name || "?";

  const handleDelete = (id: string) => {
    socket.emit("delete-transaction", { code: lobbyCode, id });
  };

  if (transactions.length === 0) {
    return <p className="text-sm text-gray-500">Henüz işlem yok.</p>;
  }

  return (
    <ul className="space-y-1">
      {transactions.map((t) => {
        let text = "";
        if (t.type === "add") {
          text = `${nameOf(t.to)} bankadan ${t.amount}$ aldı`;
        } else if (t.type === "subtract") {
          text = `${nameOf(t.from)} bankaya ${t.amount}$ ödedi`;
        } else {
          text = `${nameOf(t.from)} -> ${nameOf(t.to)} : ${t.amount}$`;
        }
        return (
          <li key={t.id} className="flex justify-between items-center bg-white border px-2 py-1 rounded">
            <span>{text}</span>
            {isOwner && (
              <button className="text-red-500" onClick={() => handleDelete(t.id)}>Sil</button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

