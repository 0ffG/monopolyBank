// lib/lobbyManager.ts

type LobbySettings = {
  balance: number;
  distribution: string;
};

type LobbyData = {
  owner: string;
  players: string[];
  settings: LobbySettings;
};

const lobbies = new Map<string, LobbyData>();

export function createLobby(ownerName: string): string {
  let code: string;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (lobbies.has(code));

  lobbies.set(code, {
    owner: ownerName,
    players: [ownerName],
    settings: {
      balance: 1500,
      distribution: "equal"
    },
  });

  return code;
}

export function getLobby(code: string): LobbyData | undefined {
  return lobbies.get(code);
}

export function joinLobby(code: string, playerName: string): boolean {
  const lobby = lobbies.get(code);
  if (!lobby) return false;
  if (lobby.players.includes(playerName)) return true;

  lobby.players.push(playerName);
  return true;
}
