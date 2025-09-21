"use client";

interface Player {
  id: string;
  name: string;
}

interface PlayerListProps {
  players: Player[];
  balances?: Record<string, number>; // opsiyonel parametre
}

export default function PlayerList({ players, balances }: PlayerListProps) {
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
              className="flex justify-between border-b pb-1"
            >
              <span>{player.name}</span>
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
