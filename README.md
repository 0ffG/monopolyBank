# 🏦 Monopoly Bank - Digital Money Tracker

This web application allows Monopoly players to track all### Lobby Events

**create-lobby**
- **Triggered by**: Host (game initiator)
- **Description**: Creates a new lobby. Server generates a unique lobby code and automatically adds the host to that lobby.
- **Server Response**: Returns lobby state via **lobby-updated** event.

**join-lobby**
- **Triggered by**: Players
- **Description**: Join an existing lobby using a lobby code.
- **Server Response**: Player is added to lobby and updated list (**lobby-updated**) is sent to everyone.

**lobby-updated**
- **Triggered by**: Server
- **Description**: When a player joins/leaves the lobby, the current player list is sent to all clients.

### Game Events

**start-game**
- **Triggered by**: Host
- **Description**: Starts the game. All players are assigned initial balance (e.g., 1500₺). First player is determined.
- **Server Response**: Game state is sent via **game-updated**.

**game-updated**
- **Triggered by**: Server
- **Description**: Sent to all players when game state changes (balances, turn, etc.).

**error-message**
- **Triggered by**: Server
- **Description**: Returns error message for incorrect or unauthorized actions (e.g., not your turn, insufficient balance).

### Game Actions

**transfer-money**
- **Triggered by**: Current turn player
- **Description**: Transfer money from one player to another.
- **Server Response**: Balances are updated, **game-updated** and **transaction-history** events are sent.

**bank-action**
- **Triggered by**: Current turn player
- **Description**: Add or remove money from bank.
- **Parameters**: action: "add" | "remove"
- **Server Response**: Balances are updated, **game-updated** and **transaction-history** events are sent.

**end-turn**
- **Triggered by**: Current turn player
- **Description**: Pass turn to next player.
- **Server Response**: New turn information is sent in **game-updated** event.

### Transaction History

**transaction-history**
- **Triggered by**: Server
- **Description**: Every transaction (transfer, bank-action, undo) is sent to all players via this event.

**undo-transaction**
- **Triggered by**: Host
- **Description**: Undoes the last transaction. Both removed from history list and balances are restored.
- **Server Response**: New state is sent to everyone via **game-updated** and **transaction-history**.

### Connection Management

**disconnect**
- **Triggered by**: Automatic (when client connection is lost)
- **Description**: Player is removed from lobby, updated list is sent via **lobby-updated**.

---

## 🛠️ Development Setup

### Environment Setup
1. Ensure Node.js v18+ is installed
2. Clone the repository
3. Install dependencies: `npm install`

### Running in Development
1. **Terminal 1 - Socket Server**:
   ```bash
   npm run server
   ```

2. **Terminal 2 - Next.js Frontend**:
   ```bash
   npm run dev
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Socket Server: http://localhost:3001

### Troubleshooting
- **Port conflicts**: Change ports in package.json scripts if needed
- **Dependencies issues**: Delete `node_modules` and `package-lock.json`, then run `npm install`
- **TypeScript errors**: Run `npx tsc --noEmit` to check for type errors

---

## 🔧 Build and Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
Create a `.env.local` file for environment-specific settings:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```ansactions digitally instead of using physical money. One player launches the game as the "Lobby Host", and other players join with a unique lobby code. Once the game starts, the player whose turn it is can perform actions such as transferring money between players or adding/removing funds from the bank. All transactions are kept in a history log, and the lobby host can undo incorrect transactions.

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn package manager

### Installation & Setup

1. **Clone and navigate to the project**
```bash
cd monopoly_bank
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Start the socket server (in a separate terminal)**
```bash
npm run server
```

5. **Open your browser**
- Navigate to `http://localhost:3000`
- Create a lobby or join an existing one with a lobby code
- Start playing!

## 📋 Available Scripts

```bash
npm run dev      # Start Next.js development server (port 3000)
npm run build    # Build the application for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run server   # Compile and start socket server (port 3001)
```

## 🏗️ Project Structure

```
monopoly_bank/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page (create/join lobby)
│   ├── lobby/[code]/      # Lobby page
│   └── game/[code]/       # Game page
├── components/            # Reusable React components
│   ├── LobbyClient.tsx   # Lobby management
│   ├── GameControls.tsx  # Game controls
│   ├── PlayerList.tsx    # Player list display
│   └── TransactionHistory.tsx # Transaction history
├── lib/
│   └── socket.ts         # Socket.IO client configuration
├── socket-server.ts      # Socket.IO server
└── package.json         # Dependencies and scripts
```

## 🎮 How to Play

1. **Create a Lobby**: One player creates a new lobby and becomes the host
2. **Join Lobby**: Other players join using the unique lobby code
3. **Start Game**: Host starts the game, all players get initial balance (1500₺)
4. **Take Turns**: Players can:
   - Transfer money between players
   - Add/remove money from bank
   - End their turn
5. **Track History**: All transactions are logged and can be undone by the host

## 🔧 Technical Details

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client

### Backend (Socket Server)
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Real-time**: Socket.IO Server
- **Port**: 3001

### Key Features
- Real-time multiplayer synchronization
- Transaction history with undo functionality
- Responsive design for mobile and desktop
- Type-safe TypeScript implementation



## � Socket Events Documentation

**create-lobby**
	• Tetikleyen: Host (oyunu başlatan kişi)
	• Açıklama: Yeni bir lobby oluşturur. Sunucu, unique bir lobby code üretir ve host’u otomatik olarak o lobiye ekler.
	• Sunucu → Lobby state’i döner (**lobby-updated** eventi ile).

**join-lobby**
	• Tetikleyen: Oyuncular
	• Açıklama: Var olan bir lobby code’u ile lobiye katılırlar.
	• Sunucu → Lobiye oyuncu eklenir ve güncel liste (**lobby-updated**) herkese gönderilir.

**lobby-updated**
	• Tetikleyen: Sunucu
	• Açıklama: Lobby’ye oyuncu girince/çıkınca güncel oyuncu listesi tüm istemcilere gönderilir.

---

🔹 **Oyun Başlatma ve Genel Eventler**

**start-game**
	• Tetikleyen: Host
	• Açıklama: Oyunu başlatır. Tüm oyunculara başlangıç bakiyesi atanır (örn. 1500₺). İlk oyuncu belirlenir.
	• Sunucu → **game-updated** ile oyun durumu gönderilir.

**game-updated**
	• Tetikleyen: Sunucu
	• Açıklama: Oyun durumunda değişiklik (bakiyeler, sıra, vs.) olduğunda tüm oyunculara gönderilir.

**error-message**
	• Tetikleyen: Sunucu
	• Açıklama: Yanlış veya yetkisiz bir işlem yapılırsa hata mesajı döner (örn. sıra sende değil, yetersiz bakiye).

---

🔹 **Oyun İçi İşlemler**

**transfer-money**
	• Tetikleyen: O an sırası gelen oyuncu
	• Açıklama: Bir oyuncudan diğerine para transferi yapar.
	• Sunucu → Bakiyeler güncellenir, **game-updated** ve **transaction-history** eventleri gönderilir.

**bank-action**
	• Tetikleyen: O an sırası gelen oyuncu
	• Açıklama: Bankadan para ekleme veya çıkarma işlemi yapılır.
	• Parametre: action: "add" | "remove"
	• Sunucu → Bakiyeler güncellenir, **game-updated** ve **transaction-history** eventleri gönderilir.

**end-turn**
	• Tetikleyen: O an sırası gelen oyuncu
	• Açıklama: Sıra bir sonraki oyuncuya geçer.
	• Sunucu → Yeni sıra bilgisini **game-updated** eventinde yollar.

---

🔹 **Transaction Geçmişi**

**transaction-history**
	• Tetikleyen: Sunucu
	• Açıklama: Yapılan her işlem (transfer, bank-action, undo) bu event ile tüm oyunculara gönderilir.

**undo-transaction**
	• Tetikleyen: Host
	• Açıklama: Son işlemi geri alır. Hem history listesinden silinir hem de bakiyeler eski haline getirilir.
	• Sunucu → **game-updated** ve **transaction-history** ile herkese yeni durum gönderilir.

---

🔹 **Bağlantı Yönetimi**

**disconnect**
	• Tetikleyen: Otomatik (istemci bağlantısı koparsa)
	• Açıklama: Oyuncu lobiden çıkarılır, **lobby-updated** ile güncel liste gönderilir.

---

✅ **Özet**

• Lobby Eventleri: create-lobby, join-lobby, lobby-updated
• Oyun Başlatma: start-game, game-updated, error-message
• İşlemler: transfer-money, bank-action, end-turn
• Geçmiş: transaction-history, undo-transaction
• Bağlantı: disconnect



## 🚀 **Kurulum ve Çalıştırma**

### **1. Gerekli Paketleri Yükleyin**
```bash
cd ~/Desktop/monopoly_bank
npm install
```

### **2. Socket Server'ı Başlatın (Terminal 1)**
```bash
# TypeScript dosyasını derle
npx tsc -p tsconfig.server.json

# Socket server'ı çalıştır (Port 3001)
node dist/socket-server.js
```

### **3. Next.js Frontend'ini Başlatın (Terminal 2)**
```bash
# Frontend'i geliştirme modunda çalıştır (Port 3000)
npm run dev
```

### **4. Uygulamayı Kullanın**
- Tarayıcıda `http://localhost:3000` adresine gidin
- Lobby oluşturun veya mevcut bir lobby'ye katılın
- Oyunu başlatın ve para transferlerini yapın

---

## 📁 **Dosya Yapısı ve Görevler**

### **Frontend (Next.js - Port 3000)**
- `app/page.tsx` → Ana sayfa (lobby oluşturma/katılma)
- `app/lobby/[code]/page.tsx` → Lobby sayfası
- `app/game/[code]/page.tsx` → Oyun sayfası
- `components/LobbyClient.tsx` → Lobby yönetimi
- `components/GameControls.tsx` → Oyun içi kontroller
- `lib/socket.ts` → Socket.IO client bağlantısı

### **Backend (Socket.IO Server - Port 3001)**
- `socket-server.ts` → Ana socket server dosyası
- Lobby yönetimi (oluşturma, katılma, güncelleme)
- Oyun durumu yönetimi (bakiyeler, sıra, geçmiş)
- Real-time iletişim (tüm eventler)

### **Yapılandırma Dosyaları**
- `tsconfig.json` → Next.js TypeScript yapılandırması
- `tsconfig.server.json` → Socket server TypeScript yapılandırması
- `package.json` → Proje bağımlılıkları ve scriptler
- `tailwind.config.ts` → Tailwind CSS ayarları

---

## 🔧 **Development Komutları**

```bash
# Tüm paketleri yükle
npm install

# Socket server'ı derle ve çalıştır
npm run server

# Frontend'i geliştirme modunda çalıştır
npm run dev

# TypeScript hatalarını kontrol et
npx tsc --noEmit

# Projeyi production için build et
npm run build
```