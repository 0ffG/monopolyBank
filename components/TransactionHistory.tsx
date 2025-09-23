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
      `Bu işlemi geri almak istediğinizden emin misiniz?\n\n"${transactionText}"\n\nBu işlem geri alınamaz.`
    );
    
    if (confirmed) {
      console.log("🔄 Spesifik işlem geri alma isteği:", { transactionId, transactionDetails, action });
      socket.emit("undo-specific-transaction", { code: lobbyCode, transactionId });
    }
  };

  const getTransactionText = (details: any, action: string) => {
    if (action === "transfer") {
      return `${getPlayerName(details.from)} → ${getPlayerName(details.to)} : ${details.amount.toLocaleString()}₺`;
    } else if (action === "bank-add") {
      return `Bankadan eklendi: +${details.amount.toLocaleString()}₺ → ${getPlayerName(details.playerId)}`;
    } else if (action === "bank-remove") {
      return `Bankadan çıkarıldı: -${details.amount.toLocaleString()}₺ → ${getPlayerName(details.playerId)}`;
    }
    return "Bilinmeyen işlem";
  };

  const getPlayerName = (id: string) => {
    const player = players.find((p) => p.id === id);
    return player ? player.name : "Bilinmeyen Oyuncu";
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
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 transform -skew-y-1 rounded-lg"></div>
        <h3 className="relative text-2xl font-bold text-white py-3 text-center tracking-wide">
          📋 İŞLEM GEÇMİŞİ
        </h3>
      </div>

      <div className="flex-1 overflow-hidden">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-500 font-medium">Henüz işlem yapılmadı</p>
            <p className="text-lg text-gray-400 mt-2">İlk işlemi yapmayı bekliyor...</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.slice().reverse().map((tx, index) => (
              <div 
                key={tx.id} 
                className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    {tx.action === "transfer" && (
                      <>
                        <TransferIcon />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="font-semibold text-blue-600">{getPlayerName(tx.details.from)}</span>
                            <span className="text-gray-500">→</span>
                            <span className="font-semibold text-purple-600">{getPlayerName(tx.details.to)}</span>
                          </div>
                          <div className="font-bold text-green-600 text-lg">
                            {tx.details.amount.toLocaleString()}₺
                          </div>
                        </div>
                      </>
                    )}
                    {tx.action === "bank-add" && (
                      <>
                        <BankAddIcon />
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">Bankadan eklendi</div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-green-600 text-lg">+{tx.details.amount.toLocaleString()}₺</span>
                            <span className="text-gray-500">→</span>
                            <span className="font-semibold text-blue-600">{getPlayerName(tx.details.playerId)}</span>
                          </div>
                        </div>
                      </>
                    )}
                    {tx.action === "bank-remove" && (
                      <>
                        <BankRemoveIcon />
                        <div className="flex-1">
                          <div className="text-sm text-gray-600">Bankadan çıkarıldı</div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-red-600 text-lg">-{tx.details.amount.toLocaleString()}₺</span>
                            <span className="text-gray-500">→</span>
                            <span className="font-semibold text-blue-600">{getPlayerName(tx.details.playerId)}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                      #{history.length - index}
                    </div>
                    {isHost && (
                      <button
                        onClick={() => handleUndoSpecific(tx.id, tx.details, tx.action)}
                        className="opacity-0 group-hover:opacity-100 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white p-2 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-xs"
                        title="Bu işlemi geri al"
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

      {isHost && history.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
          <button
            onClick={handleUndo}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-full shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <UndoIcon />
            <span>🔄 Son İşlemi Geri Al</span>
          </button>
          <div className="text-center">
            <p className="text-sm text-gray-500">
              💡 <strong>İpucu:</strong> Herhangi bir işlemin üzerine gelip kırmızı butona tıklayarak o işlemi geri alabilirsiniz
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
