import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Next.js frontend
    methods: ["GET", "POST"],
  },
});

// Bellekte lobby bilgilerini tutalım (ileride DB’ye taşınabilir)
interface Player {
  id: string;
  name: string;
}

interface Lobby {
  code: string;
  hostId: string;
  players: Player[];
}

interface GameState {
  currentTurn: string; // sıra kimde (socket.id)
  balances: Record<string, number>; // oyuncu bakiyeleri
  history: { id: string; action: string; details: any }[]; // işlem geçmişi
}

// Lobiye bağlı oyun durumunu saklayalım
const games: Record<string, GameState> = {};



// ✅ Oyunu başlatma
io.on("connection", (socket) => {
  console.log("🔌 Yeni bağlantı:", socket.id);

socket.on("start-game", ({ code }) => {
  const lobby = lobbies[code];
  if (!lobby || lobby.hostId !== socket.id) return;

  const balances: Record<string, number> = {};
  lobby.players.forEach((p) => {
    balances[p.id] = 1500;
  });

  games[code] = {
    currentTurn: lobby.players[0].id,
    balances,
    history: [],
  };

  io.to(code).emit("game-updated", games[code]);
});


  // ✅ Para transferi
  socket.on("transfer-money", ({ code, from, to, amount }) => {
    const game = games[code];
    if (!game) return;
    if (game.currentTurn !== from) {
      socket.emit("error-message", "Sıra sende değil!");
      return;
    }

    if (game.balances[from] >= amount) {
      game.balances[from] -= amount;
      game.balances[to] += amount;

      const action = {
        id: Date.now().toString(),
        action: "transfer",
        details: { from, to, amount },
      };
      game.history.push(action);

      io.to(code).emit("game-updated", game);
      io.to(code).emit("transaction-history", game.history);
    } else {
      socket.emit("error-message", "Yetersiz bakiye!");
    }
  });

  // ✅ Bankadan ekleme/çıkarma
  socket.on("bank-action", ({ code, playerId, amount, action }) => {
    const game = games[code];
    if (!game) return;
    if (game.currentTurn !== playerId) {
      socket.emit("error-message", "Sıra sende değil!");
      return;
    }

    if (action === "add") {
      game.balances[playerId] += amount;
    } else if (action === "remove") {
      game.balances[playerId] -= amount;
    }

    const log = {
      id: Date.now().toString(),
      action: "bank-" + action,
      details: { playerId, amount },
    };
    game.history.push(log);

    io.to(code).emit("game-updated", game);
    io.to(code).emit("transaction-history", game.history);
  });

  // ✅ Sıra bitirme
  socket.on("end-turn", ({ code }) => {
    const lobby = lobbies[code];
    const game = games[code];
    if (!lobby || !game) return;

    const playerIds = lobby.players.map((p) => p.id);
    const currentIndex = playerIds.indexOf(game.currentTurn);
    const nextIndex = (currentIndex + 1) % playerIds.length;

    game.currentTurn = playerIds[nextIndex];

    io.to(code).emit("game-updated", game);
  });
});

  
const lobbies: Record<string, Lobby> = {};

// Basit random lobby kodu üretici
function generateLobbyCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket) => {
  console.log("🔌 Yeni bağlantı:", socket.id);

  // ✅ Lobby oluşturma
  socket.on("create-lobby", (playerName: string) => {
    const code = generateLobbyCode();
    const newLobby: Lobby = {
      code,
      hostId: socket.id,
      players: [{ id: socket.id, name: playerName }],
    };
    lobbies[code] = newLobby;

    socket.join(code);
    console.log(`🎉 Yeni lobby oluşturuldu: ${code} (host: ${playerName})`);

    io.to(code).emit("lobby-updated", newLobby);
  });

  // ✅ Lobby’ye katılma
  socket.on("join-lobby", ({ code, name }) => {
    const lobby = lobbies[code];
    if (!lobby) {
      socket.emit("error-message", "Lobby bulunamadı!");
      return;
    }

    lobby.players.push({ id: socket.id, name });
    socket.join(code);

    console.log(`👤 ${name} lobiye katıldı (${code})`);
    io.to(code).emit("lobby-updated", lobby);
  });

  // Oyuncu ayrıldığında
  socket.on("disconnect", () => {
    console.log("❌ Oyuncu ayrıldı:", socket.id);
    for (const code in lobbies) {
      const lobby = lobbies[code];
      const index = lobby.players.findIndex((p) => p.id === socket.id);
      if (index !== -1) {
        lobby.players.splice(index, 1);
        io.to(code).emit("lobby-updated", lobby);
      }
    }
  });

  // ✅ Undo Transaction (sadece host yapabilir)
  socket.on("undo-transaction", ({ code }) => {
    const lobby = lobbies[code];
    const game = games[code];
    if (!lobby || !game) return;

    // sadece host geri alabilir
    if (lobby.hostId !== socket.id) {
      socket.emit("error-message", "Sadece host undo yapabilir!");
      return;
    }

    // son işlemi sil
    const lastAction = game.history.pop();
    if (!lastAction) {
      socket.emit("error-message", "Geri alınacak işlem yok!");
      return;
    }

    // işlemin etkisini geri al
    if (lastAction.action === "transfer") {
      const { from, to, amount } = lastAction.details;
      game.balances[from] += amount;
      game.balances[to] -= amount;
    }
    if (lastAction.action === "bank-add") {
      const { playerId, amount } = lastAction.details;
      game.balances[playerId] -= amount;
    }
    if (lastAction.action === "bank-remove") {
      const { playerId, amount } = lastAction.details;
      game.balances[playerId] += amount;
    }

    console.log("↩️ Undo yapıldı:", lastAction);

    // herkese güncel durumu gönder
    io.to(code).emit("game-updated", game);
    io.to(code).emit("transaction-history", game.history);
  });
});


httpServer.listen(3001, () => {
  console.log("✅ Socket.IO server 3001 portunda çalışıyor...");
});
