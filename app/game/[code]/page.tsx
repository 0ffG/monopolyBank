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
    return <div className="p-4">Yükleniyor...</div>;
  }

  const isOwner = game.owner === myName;
  const isMyTurn = game.players[game.currentTurn]?.id === myId;

  return (
    <div className="min-h-screen p-4 space-y-4 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100">
      <MoneyDisplay players={game.players} currentTurn={game.currentTurn} />
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
  );
}

