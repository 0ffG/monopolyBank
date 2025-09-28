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
    <div className="bg-white rounded-xl shadow-xl h-full flex flex-col">
      {/* Header */}
      <div className="relative p-3 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-xl"></div>
        <h3 className="relative text-lg font-bold text-white text-center tracking-wide">
          👥 PLAYERS
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 overflow-y-auto">
        {players.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🎮</div>
            <p className="text-base text-gray-500 font-medium">No players yet</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {players.map((player, index) => (
              <div
                key={player.id}
                className={`relative bg-gradient-to-r p-3 rounded-xl shadow-md transform transition-all duration-300 ${
                  currentTurn === player.id 
                    ? "from-yellow-100 to-orange-100 border-2 border-yellow-400 shadow-lg scale-105" 
                    : "from-gray-50 to-white border border-gray-200 hover:shadow-lg hover:scale-105"
                }`}
              >
                {currentTurn === player.id && (
                  <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    🎯
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {index + 1}
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${
                        currentTurn === player.id ? "text-orange-800" : "text-gray-800"
                      }`}>
                        {player.name}
                      </span>
                    </div>
                  </div>
                  
                  {balances && (
                    <div className="flex items-center space-x-1 bg-white rounded-full px-2 py-1 shadow-sm">
                      <MoneyIcon />
                      <span className="text-sm font-bold text-green-600 font-mono">
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
    </div>
  );
}
