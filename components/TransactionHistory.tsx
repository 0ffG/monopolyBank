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
      console.log("📥 Transaction history güncellendi:", transactions);
      setHistory(transactions);
    });

    socket.on("error-message", (msg: string) => {
      console.log("❌ Error message alındı:", msg);
      alert(msg);
    });

    return () => {
      socket.off("transaction-history");
      socket.off("error-message");
    };
  }, [socket]);

  const handleUndo = () => {
    socket.emit("undo-transaction", { code: lobbyCode });
  };

  const handleUndoSpecific = (transactionId: string, transactionDetails: any, action: string) => {
    const transactionText = getTransactionText(transactionDetails, action);
    const confirmed = window.confirm(
      `Are you sure you want to undo this transaction?\n\n"${transactionText}"\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      console.log("🔄 Specific transaction undo request:", { transactionId, transactionDetails, action });
      socket.emit("undo-specific-transaction", { code: lobbyCode, transactionId });
    }
  };

  const getTransactionText = (details: any, action: string) => {
    if (action === "transfer") {
      return `${getPlayerName(details.from)} → ${getPlayerName(details.to)} : ${details.amount.toLocaleString()}₺`;
    } else if (action === "bank-add") {
      return `Added from bank: +${details.amount.toLocaleString()}₺ → ${getPlayerName(details.playerId)}`;
    } else if (action === "bank-remove") {
      return `Removed from bank: -${details.amount.toLocaleString()}₺ → ${getPlayerName(details.playerId)}`;
    }
    return "Unknown transaction";
  };

  const getPlayerName = (id: string) => {
    const player = players.find((p) => p.id === id);
    return player ? player.name : "Unknown Player";
  };

  const TransferIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
      <path d="M5 12h14"></path>
      <path d="m12 5 7 7-7 7"></path>
    </svg>
  );

  const BankAddIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 8v8"></path>
      <path d="M8 12h8"></path>
    </svg>
  );

  const BankRemoveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 12h8"></path>
    </svg>
  );

  const UndoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6"></path>
      <path d="m21 17-8-8-8 8"></path>
    </svg>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="relative p-4 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl"></div>
        <h3 className="relative text-xl font-bold text-white text-center tracking-wide">
          📋 TRANSACTION HISTORY
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-hidden flex flex-col">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-lg text-gray-500 font-medium">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-2">Waiting for the first transaction...</p>
          </div>
        ) : (
          <div className="space-y-2 flex-1 overflow-y-auto">
            {history.slice().reverse().map((tx, index) => (
              <div 
                key={tx.id} 
                className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    {tx.action === "transfer" && (
                      <>
                        <TransferIcon />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 text-xs">
                            <span className="font-semibold text-blue-600 truncate">{getPlayerName(tx.details.from)}</span>
                            <span className="text-gray-500">→</span>
                            <span className="font-semibold text-purple-600 truncate">{getPlayerName(tx.details.to)}</span>
                          </div>
                          <div className="font-bold text-green-600 text-sm">
                            {tx.details.amount.toLocaleString()}₺
                          </div>
                        </div>
                      </>
                    )}
                    {tx.action === "bank-add" && (
                      <>
                        <BankAddIcon />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-600">From Bank</div>
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-green-600 text-sm">+{tx.details.amount.toLocaleString()}₺</span>
                            <span className="text-gray-500 text-xs">→</span>
                            <span className="font-semibold text-blue-600 text-xs truncate">{getPlayerName(tx.details.playerId)}</span>
                          </div>
                        </div>
                      </>
                    )}
                    {tx.action === "bank-remove" && (
                      <>
                        <BankRemoveIcon />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-600">From Bank</div>
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-red-600 text-sm">-{tx.details.amount.toLocaleString()}₺</span>
                            <span className="text-gray-500 text-xs">→</span>
                            <span className="font-semibold text-blue-600 text-xs truncate">{getPlayerName(tx.details.playerId)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <div className="text-xs text-gray-400 bg-gray-100 px-1 py-0.5 rounded text-center min-w-[20px]">
                      {history.length - index}
                    </div>
                    {isHost && (
                      <button
                        onClick={() => handleUndoSpecific(tx.id, tx.details, tx.action)}
                        className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-1 rounded-full shadow-md transform hover:scale-110 transition-all duration-300"
                        title="Undo this transaction"
                      >
                        <UndoIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {isHost && history.length > 0 && (
        <div className="p-3 pt-2 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleUndo}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-1.5 px-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-1.5 text-xs"
          >
            <UndoIcon />
            <span>🔄 Undo Last Transaction</span>
          </button>
        </div>
      )}
    </div>
  );
}
