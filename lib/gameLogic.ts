export type GamePlayer = {
  id: string;
  name: string;
  balance: number;
};

export type Transaction = {
  id: string;
  type: "add" | "subtract" | "transfer";
  from?: string;
  to?: string;
  amount: number;
};

export type GameState = {
  players: GamePlayer[];
  currentTurn: number;
  owner: string;
  transactions: Transaction[];
};
