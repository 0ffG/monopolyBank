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
  const CrownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500">
      <polygon points="12,6 15.09,12.26 22,12 17.74,16.85 19.46,23.41 12,19.77 4.54,23.41 6.26,16.85 2,12 8.91,12.26"></polygon>
    </svg>
  );

  const MoneyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 6v12"></path>
      <path d="M15 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path>
    </svg>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 transform -skew-y-1 rounded-lg"></div>
        <h3 className="relative text-2xl font-bold text-white py-3 text-center tracking-wide">
          👥 OYUNCULAR
        </h3>
      </div>

      {players.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-xl text-gray-500 font-medium">Henüz oyuncu yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`relative bg-gradient-to-r p-5 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${
                currentTurn === player.id 
                  ? "from-yellow-100 to-orange-100 border-2 border-yellow-400 shadow-xl scale-105" 
                  : "from-gray-50 to-white border border-gray-200 hover:shadow-xl"
              }`}
            >
              {currentTurn === player.id && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  🎯 SIRA
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg font-semibold ${
                        currentTurn === player.id ? "text-orange-800" : "text-gray-800"
                      }`}>
                        {player.name}
                      </span>
                      {currentTurn === player.id && <CrownIcon />}
                    </div>
                  </div>
                </div>
                
                {balances && (
                  <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-md">
                    <MoneyIcon />
                    <span className="text-lg font-bold text-green-600 font-mono">
                      {balances[player.id]?.toLocaleString() ?? 0}₺
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
