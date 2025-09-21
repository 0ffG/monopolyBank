"use client";

interface Player {
  id: string;
  name: string;
}

interface PlayerListProps {
  players: Player[];
  balances?: Record<string, number>; // opsiyonel parametre
  currentTurn?: string; // sıra kimde
}

export default function PlayerList({ players, balances, currentTurn }: PlayerListProps) {
  return (
    <div className="p-4 border rounded space-y-2">
      <h3 className="font-bold">Oyuncular</h3>
      {players.length === 0 ? (
        <p>Henüz oyuncu yok.</p>
      ) : (
        <ul className="space-y-1">
          {players.map((player) => (
            <li
              key={player.id}
              className={`flex justify-between border-b pb-1 ${
                currentTurn === player.id ? "bg-yellow-100 font-bold" : ""
              }`}
            >
              <span>
                {player.name}
                {currentTurn === player.id && " 🎯"}
              </span>
              {balances && (
                <span className="font-mono">
                  {balances[player.id] ?? 0}₺
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
