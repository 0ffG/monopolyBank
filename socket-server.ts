// socket-server.ts
// Bu dosya, Next.js uygulamanızdan ayrı çalışan bağımsız bir Socket.IO sunucusudur.

import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";

// Express uygulamasını başlat
const app = express();
app.use(cors({
  origin: "*", // Güvenlik için üretimde Next.js URL'nizi buraya yazın: "http://localhost:3000"
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Güvenlik için üretimde Next.js URL'nizi buraya yazın
    methods: ["GET", "POST"]
  },
});

// Oyuncu tipi tanımı
type Player = { id: string; name: string; };

type GamePlayer = Player & { balance: number };

type Transaction = {
  id: string;
  type: "add" | "subtract" | "transfer";
  from?: string; // player id
  to?: string;   // player id
  amount: number;
};

type GameState = {
  players: GamePlayer[];
  currentTurn: number;
  owner: string;
  transactions: Transaction[];
};

// Lobi verilerini bellekte saklamak için bir kayıt
// Oyuncuların listesi { id: string; name: string } objelerinden oluşur
const lobbies: Record<string, { players: Player[]; owner: string }> = {};

// Oyun durumlarını saklamak için kayıt
const games: Record<string, GameState> = {};

// Soket ID'lerini ve bulundukları lobi kodlarını eşleştirmek için yardımcı bir harita
const socketLobbyMap: Record<string, string> = {}; // { socketId: lobbyCode }

io.on("connection", (socket) => {
  console.log(`✅ Yeni Socket.IO bağlantısı: ${socket.id}`);

  // 'join-lobby' olayını dinle
  socket.on("join-lobby", ({ name, code }: { name: string; code: string }) => {
    console.log(`🎮 'join-lobby' olayı alındı: Soket ID: ${socket.id}, Oyuncu: '${name}', Lobi: '${code}'`);

    // Gelen isim boşsa veya sadece boşluklardan oluşuyorsa hata gönder ve işlemi durdur
    if (!name || name.trim() === '') {
      console.warn(`[SERVER] Boş veya geçersiz isimle lobiye katılma denemesi engellendi: Soket ID ${socket.id}`);
      socket.emit("join-error", { message: "Oyuncu adı boş olamaz." });
      return;
    }
    const trimmedName = name.trim(); // İsimdeki boşlukları temizle

    // Lobiyi al veya oluştur
    let lobby = lobbies[code];
    if (!lobby) {
      lobby = {
        players: [],
        owner: trimmedName, // İlk katılan oyuncu sahibi olur (temizlenmiş isimle)
      };
      lobbies[code] = lobby;
      console.log(`[SERVER] Yeni lobi oluşturuldu: '${code}' sahibi '${trimmedName}'`);
    }

    // Oyuncuyu lobiye ekle (eğer zaten o socket ID'si ile yoksa)
    const playerExists = lobby.players.some((p) => p.id === socket.id);
    if (!playerExists) {
        lobby.players.push({ id: socket.id, name: trimmedName });
        console.log(`[SERVER] Oyuncu '${trimmedName}' (${socket.id}) lobi '${code}'ye eklendi.`);
    } else {
        // Zaten lobide olan bir oyuncu tekrar katılıyor (örn: sayfa yenileme)
        // Oyuncu ismini güncelleyebiliriz, çünkü localStorage'dan gelmiş olabilir
        const existingPlayer = lobby.players.find(p => p.id === socket.id);
        if (existingPlayer) {
            // Sadece ismi değiştiyse güncelle, performans için
            if (existingPlayer.name !== trimmedName) {
                existingPlayer.name = trimmedName;
                console.log(`[SERVER] Mevcut oyuncu '${existingPlayer.name}' (${socket.id}) ismi güncellendi: ${trimmedName}`);
            }
        }
        console.log(`[SERVER] Oyuncu '${trimmedName}' (${socket.id}) zaten lobi '${code}'de. Yeniden katılım.`);
    }

    // Soketi lobinin odasına dahil et
    socket.join(code);
    socketLobbyMap[socket.id] = code; // Soketin hangi lobide olduğunu kaydet
    console.log(`[SERVER] Soket ${socket.id} '${code}' odasına katıldı. SocketLobbyMap güncellendi.`);

    // Güncel lobi verilerini istemcilere gönder
    const lobbyDataForClient = {
      code,
      players: lobby.players,
      owner: lobby.owner, // Owner ismi olarak gönderiliyor
    };

    io.to(code).emit("lobby-updated", lobbyDataForClient);
    console.log(`[SERVER] 'lobby-updated' olayı '${code}' odasına gönderildi:`, lobbyDataForClient);
  });

  // 'start-game' olayını dinle
  socket.on("start-game", ({ code, balance }: { code: string; balance: number }) => {
    console.log(`[SERVER] 'start-game' olayı alındı: Lobi '${code}' için oyun başlatılıyor, başlangıç parası: '${balance}'`);
    const lobby = lobbies[code];
    if (!lobby) {
      console.warn(`[SERVER] '${code}' kodlu lobi bulunamadı.`);
      return;
    }

    const gamePlayers: GamePlayer[] = lobby.players.map((p) => ({ ...p, balance }));
    games[code] = {
      players: gamePlayers,
      currentTurn: 0,
      owner: lobby.owner,
      transactions: [],
    };

    io.to(code).emit("game-started", { lobbyCode: code, initialBalance: balance, players: gamePlayers });
    console.log(`[SERVER] 'game-started' olayı '${code}' odasına gönderildi.`);
  });

  socket.on("request-game-state", (code: string) => {
    const game = games[code];
    if (game) {
      io.to(socket.id).emit("game-state", game);
    }
  });

  socket.on("add-money", ({ code, playerId, amount }: { code: string; playerId: string; amount: number }) => {
    const game = games[code];
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    player.balance += amount;
    const txn: Transaction = { id: Date.now().toString(), type: "add", to: playerId, amount };
    game.transactions.push(txn);
    io.to(code).emit("game-updated", game);
  });

  socket.on("subtract-money", ({ code, playerId, amount }: { code: string; playerId: string; amount: number }) => {
    const game = games[code];
    if (!game) return;
    const player = game.players.find(p => p.id === playerId);
    if (!player) return;
    player.balance -= amount;
    const txn: Transaction = { id: Date.now().toString(), type: "subtract", from: playerId, amount };
    game.transactions.push(txn);
    io.to(code).emit("game-updated", game);
  });

  socket.on("transfer-money", ({ code, fromId, toId, amount }: { code: string; fromId: string; toId: string; amount: number }) => {
    const game = games[code];
    if (!game) return;
    const from = game.players.find(p => p.id === fromId);
    const to = game.players.find(p => p.id === toId);
    if (!from || !to) return;
    from.balance -= amount;
    to.balance += amount;
    const txn: Transaction = { id: Date.now().toString(), type: "transfer", from: fromId, to: toId, amount };
    game.transactions.push(txn);
    io.to(code).emit("game-updated", game);
  });

  socket.on("end-turn", (code: string) => {
    const game = games[code];
    if (!game) return;
    game.currentTurn = (game.currentTurn + 1) % game.players.length;
    io.to(code).emit("game-updated", game);
  });

  socket.on("delete-transaction", ({ code, id }: { code: string; id: string }) => {
    const game = games[code];
    if (!game) return;
    const index = game.transactions.findIndex(t => t.id === id);
    if (index === -1) return;
    const txn = game.transactions.splice(index, 1)[0];
    switch (txn.type) {
      case "add": {
        const p = game.players.find(p => p.id === txn.to);
        if (p) p.balance -= txn.amount;
        break;
      }
      case "subtract": {
        const p = game.players.find(p => p.id === txn.from);
        if (p) p.balance += txn.amount;
        break;
      }
      case "transfer": {
        const from = game.players.find(p => p.id === txn.from);
        const to = game.players.find(p => p.id === txn.to);
        if (from) from.balance += txn.amount;
        if (to) to.balance -= txn.amount;
        break;
      }
    }
    io.to(code).emit("game-updated", game);
  });

  // Bir soket bağlantısı kesildiğinde
  socket.on("disconnect", () => {
    console.log(`❌ Soket bağlantısı kesildi: ${socket.id}`);
    const lobbyCode = socketLobbyMap[socket.id];

    if (lobbyCode && lobbies[lobbyCode]) {
      const lobby = lobbies[lobbyCode];
      const disconnectedPlayerName = lobby.players.find(p => p.id === socket.id)?.name || "Bilinmeyen Oyuncu";
      console.log(`[SERVER] Oyuncu '${disconnectedPlayerName}' (${socket.id}) lobi '${lobbyCode}'den ayrıldı.`);

      // Lobiden oyuncuyu çıkar
      lobby.players = lobby.players.filter(p => p.id !== socket.id);

      // Eğer ayrılan oyuncu lobinin sahibi ise
      if (lobby.owner === disconnectedPlayerName) {
         console.warn(`[SERVER] Lobi sahibi '${disconnectedPlayerName}' (${socket.id}) ayrıldı!`);
         if (lobby.players.length > 0) {
             // Kalan ilk oyuncuyu yeni sahip yap
             lobby.owner = lobby.players[0].name;
             console.log(`[SERVER] Lobi '${lobbyCode}' yeni sahibi: ${lobby.owner}`);
         } else {
             // Lobi tamamen boşaldı, lobiyi sil
             delete lobbies[lobbyCode];
             console.log(`[SERVER] Lobi '${lobbyCode}' boşaldığı için silindi.`);
         }
      }

      // Güncellenmiş lobi verilerini odaya yayınla (lobi silinmediyse)
      if (lobbies[lobbyCode]) {
        io.to(lobbyCode).emit("lobby-updated", {
          code: lobbyCode,
          players: lobby.players,
          owner: lobby.owner,
        });
        console.log(`[SERVER] 'lobby-updated' olayı '${lobbyCode}' odasına yeniden gönderildi.`);
      }
    }
    // Socket ID'yi haritadan kaldır
    delete socketLobbyMap[socket.id];
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO sunucusu şu adreste dinliyor: http://localhost:${PORT}`);
});

