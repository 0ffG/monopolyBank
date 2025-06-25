"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { GameState } from "@/lib/gameLogic";
import MoneyDisplay from "@/components/MoneyDisplay";
import GameControls from "@/components/GameControls";
import TransactionHistory from "@/components/TransactionHistory";

export default function GamePage() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";
  const [game, setGame] = useState<GameState | null>(null);
  const [myName, setMyName] = useState("");
  const [myId, setMyId] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("playerName");
    if (stored) setMyName(stored);
    const socket = getSocket();

    const handleState = (state: GameState) => setGame(state);
    socket.on("game-state", handleState);
    socket.on("game-updated", handleState);
    setMyId(socket.id);
    socket.emit("request-game-state", code);

    return () => {
      socket.off("game-state", handleState);
      socket.off("game-updated", handleState);
    };
  }, [code]);

  if (!game) {
    // Modern loading screen
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full animate-pulse bg-cyan-400"></div>
          <div className="w-4 h-4 rounded-full animate-pulse bg-pink-500 [animation-delay:0.2s]"></div>
          <div className="w-4 h-4 rounded-full animate-pulse bg-purple-500 [animation-delay:0.4s]"></div>
          <span className="text-lg font-medium">Loading Game...</span>
        </div>
      </div>
    );
  }

  const isOwner = game.owner === myName;
  const isMyTurn = game.players[game.currentTurn]?.id === myId;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 to-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">Game Code: <span className="text-cyan-400">{code}</span></h1>
            <p className="text-slate-400 mt-2">Current Player: <span className="font-semibold text-white">{game.players[game.currentTurn]?.name}</span></p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Players */}
          <div className="lg:col-span-2">
              <MoneyDisplay players={game.players} currentTurn={game.currentTurn} myId={myId}/>
          </div>

          {/* Right Column: Controls and History */}
          <div className="lg:col-span-1 space-y-8">
            {isMyTurn && (
              <GameControls lobbyCode={code} players={game.players} meId={myId} />
            )}
            <TransactionHistory
              transactions={game.transactions}
              players={game.players}
              isOwner={isOwner}
              lobbyCode={code}
            />
          </div>
        </main>
      </div>
    </div>
  );
}