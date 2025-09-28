# 🏦 Monopoly Bank

A digital banking system for Monopoly board game that allows players to manage transactions and track game progress through a web interface. Built with Next.js, Socket.IO, and TypeScript.

## 📋 Features

- **🎮 Multi-player Lobbies**: Create or join game lobbies with unique codes
- **💰 Digital Banking**: Track player balances and transactions in real-time
- **🔄 Turn Management**: Automated turn order system with customizable settings
- **📊 Transaction History**: Complete log of all game transactions
- **⚡ Quick Transfer Buttons**: Pre-configured amounts for fast transactions
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🔴 Real-time Updates**: Live synchronization across all connected players using WebSocket

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Express.js, Socket.IO
- **Styling**: Tailwind CSS
- **Real-time Communication**: Socket.IO
- **Build Tools**: TypeScript, ESLint

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/0ffG/monopolyBank.git
   cd monopoly_bank
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Application

You need to run both the frontend and backend servers:

1. **Start the Socket.IO server** (in one terminal):
   ```bash
   npm run server
   ```
   This will:
   - Compile TypeScript files
   - Start the Express server with Socket.IO on port 3001

2. **Start the Next.js frontend** (in another terminal):
   ```bash
   npm run dev
   ```
   This will start the Next.js development server on `http://localhost:3000`

3. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The application will be accessible on your local network at `http://[your-ip]:3000`

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run server` - Compile and start the Socket.IO server
- `npm run lint` - Run ESLint for code quality

## 🎯 How to Play

### Creating a Game

1. **Enter your name** on the home page
2. **Click "Create Lobby"** to generate a unique game code
3. **Share the code** with other players
4. **Configure game settings**:
   - Initial balance for each player
   - Turn order
   - Quick transfer button amounts
5. **Start the game** once all players have joined

### Joining a Game

1. **Enter your name** on the home page
2. **Enter the lobby code** provided by the host
3. **Click "Join Lobby"** to join the game
4. **Wait for the host** to start the game

### During Gameplay

- **View balances** of all players in real-time
- **Make transactions** using the transfer interface
- **Use quick buttons** for common transaction amounts
- **Follow turn order** as managed by the system
- **Check transaction history** to review past moves

## 🏗️ Project Structure

```
monopoly_bank/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Home page with lobby creation/joining
│   ├── layout.tsx         # Root layout
│   ├── game/[code]/       # Dynamic game pages
│   └── lobby/[code]/      # Dynamic lobby pages
├── components/            # React components
│   ├── LobbyClient.tsx    # Main lobby interface
│   ├── Lobby.tsx          # Lobby management
│   ├── GameControls.tsx   # Game control interface
│   ├── PlayerList.tsx     # Player list display
│   └── TransactionHistory.tsx # Transaction log
├── lib/                   # Utility libraries
│   └── socket.ts          # Socket.IO client configuration
├── socket-server.ts       # Express + Socket.IO server
└── public/               # Static assets
```

## 🔧 Configuration

### Socket.IO CORS Configuration

The server is configured to accept connections from:
- `http://localhost:3000` (development)
- `http://192.168.1.9:3000` (local network access)

To add more allowed origins, modify the CORS configuration in `socket-server.ts`:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://your-ip:3000"],
    methods: ["GET", "POST"],
  },
});
```

### Game Settings

Default game settings can be modified in the lobby before starting:
- **Initial Balance**: Starting money for each player
- **Turn Order**: Custom sequence of player turns
- **Quick Buttons**: Three preset amounts for fast transfers

## 🌐 Network Play

The application supports local network play:
1. **Find your local IP address**:
   - macOS/Linux: `ifconfig | grep inet`
   - Windows: `ipconfig`
2. **Update CORS settings** in `socket-server.ts` with your IP
3. **Share the network URL** `http://[your-ip]:3000` with other players

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Troubleshooting

### Common Issues

1. **Socket connection failed**
   - Ensure the server is running (`npm run server`)
   - Check that port 3001 is not blocked by firewall

2. **Players can't join lobby**
   - Verify the lobby code is correct
   - Check network connectivity
   - Ensure CORS settings include the client's IP

3. **Game state not syncing**
   - Refresh the page to reconnect to the server
   - Check browser console for Socket.IO errors

### Port Configuration

- **Frontend**: Port 3000 (Next.js)
- **Backend**: Port 3001 (Socket.IO server)

To change ports, update:
- `package.json` scripts for Next.js port
- `socket-server.ts` for backend port
- `lib/socket.ts` for Socket.IO client connection

---

**Happy Gaming! 🎲🏠💰**
