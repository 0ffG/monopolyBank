"use client";

import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

interface Transaction {
  id: string;
  action: string;
  details: any;
}

interface Player {
  id: string;
  name: string;
}

interface Props {
  isHost: boolean;
  lobbyCode: string;
  players: Player[];
}

export default function TransactionHistory({ isHost, lobbyCode, players }: Props) {
  const [history, setHistory] = useState<Transaction[]>([]);
  const socket = getSocket();

  useEffect(() => {
    socket.on("transaction-history", (transactions: Transaction[]) => {
      setHistory(transactions);
    });

    return () => {
      socket.off("transaction-history");
    };
  }, [socket]);

  const handleUndo = () => {
    socket.emit("undo-transaction", { code: lobbyCode });
  };

  const getPlayerName = (id: string) => {
    const player = players.find((p) => p.id === id);
    return player ? player.name : "Bilinmeyen Oyuncu";
  };

  return (
    <div className="p-4 border rounded space-y-2">
      <h3 className="font-bold">Transaction History</h3>
      {history.length === 0 ? (
        <p>Henüz işlem yapılmadı.</p>
      ) : (
        <>
          <ul className="list-disc ml-5 space-y-1">
            {history.map((tx) => (
              <li key={tx.id}>
                {tx.action === "transfer" && (
                  <span>
                    {getPlayerName(tx.details.from)} → {getPlayerName(tx.details.to)} : {tx.details.amount}₺
                  </span>
                )}
                {tx.action === "bank-add" && (
                  <span>
                    Bankadan eklendi: {tx.details.amount}₺ → {getPlayerName(tx.details.playerId)}
                  </span>
                )}
                {tx.action === "bank-remove" && (
                  <span>
                    Bankadan çıkarıldı: {tx.details.amount}₺ → {getPlayerName(tx.details.playerId)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {isHost && (
            <button
              onClick={handleUndo}
              className="bg-yellow-500 text-white px-3 py-1 rounded mt-3"
            >
              Son İşlemi Geri Al
            </button>
          )}
        </>
      )}
    </div>
  );
}
