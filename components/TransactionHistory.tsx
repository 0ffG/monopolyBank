"use client";

import { Transaction, GamePlayer } from "@/lib/gameLogic";
import { getSocket } from "@/lib/socket"; // getSocket'ı baştan import edelim

type Props = {
  transactions: Transaction[];
  players: GamePlayer[];
  isOwner: boolean;
  lobbyCode: string;
};

// İşlem türüne göre ikon ve renk belirleyen yardımcı fonksiyon
const getTransactionStyle = (type: Transaction['type']) => {
    switch(type) {
        case 'add': return { icon: '➕', color: 'text-teal-400' };
        case 'subtract': return { icon: '➖', color: 'text-orange-400' };
        case 'transfer': return { icon: '✈️', color: 'text-blue-400' };
        default: return { icon: '▪️', color: 'text-slate-400' };
    }
}

export default function TransactionHistory({ transactions, players, isOwner, lobbyCode }: Props) {
  const socket = getSocket();

  const nameOf = (id?: string) => players.find(p => p.id === id)?.name || "Bilinmeyen Oyuncu";

  const handleDelete = (id: string) => {
    socket.emit("delete-transaction", { code: lobbyCode, id });
  };

  return (
     <div className="bg-slate-800/50 p-6 rounded-2xl shadow-2xl backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-6 text-slate-200">Transaction History</h2>
        {transactions.length === 0 ? (
            <p className="text-sm text-center py-4 text-slate-400">No transactions yet.</p>
        ) : (
            <ul className="space-y-3 h-96 overflow-y-auto pr-2">
            {[...transactions].reverse().map((t) => { // En yeni işlem en üstte
                const { icon, color } = getTransactionStyle(t.type);
                let text = "";
                if (t.type === "add") {
                    text = <><span className="font-semibold">{nameOf(t.to)}</span> received <span className="font-bold">${t.amount.toLocaleString()}</span> from the bank.</>;
                } else if (t.type === "subtract") {
                    text = <><span className="font-semibold">{nameOf(t.from)}</span> paid <span className="font-bold">${t.amount.toLocaleString()}</span> to the bank.</>;
                } else {
                    text = <><span className="font-semibold">{nameOf(t.from)}</span> sent <span className="font-semibold">{nameOf(t.to)}</span> <span className="font-bold">${t.amount.toLocaleString()}</span>.</>;
                }
                return (
                <li key={t.id} className="flex justify-between items-center bg-slate-700/70 p-3 rounded-lg transition-colors hover:bg-slate-700">
                    <div className="flex items-center gap-3">
                        <span className={`text-xl ${color}`}>{icon}</span>
                        <p className="text-sm text-slate-300">{text}</p>
                    </div>
                    {isOwner && (
                    <button 
                        className="text-red-700 hover:text-white text-xs font-extrabold transition-colors opacity-90 hover:opacity-100 bg-red-200 hover:bg-red-500 px-3 py-1 rounded shadow"
                        onClick={() => handleDelete(t.id)}
                        title="Delete this transaction"
                    >
                        DELETE
                    </button>
                    )}
                </li>
                );
            })}
            </ul>
        )}
     </div>
  );
}