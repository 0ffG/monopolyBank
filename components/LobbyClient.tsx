"use client";

import { useState, useEffect } from "react";
import { getSocket } from "../lib/socket";
import Lobby from "./Lobby";

interface Player {
  id: string;
  name: string;
}

interface GameSettings {
  maxPlayers: number;
  gameMode: string;
  initialBalance: number; // Added missing property
  firstPlayer: string; // Added missing property
  turnOrder: string[]; // Added missing property
  quickButtons: [number, number, number]; // Updated type to match expected type
}

interface LobbyType {
  code: string;
  hostId: string;
  players: Player[];
  gameSettings: GameSettings; // Added the missing property
}

export default function LobbyClient() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [lobby, setLobby] = useState<LobbyType | null>(null);

  const socket = getSocket();

  useEffect(() => {
    socket.on("lobby-updated", (updatedLobby: LobbyType) => {
      setLobby(updatedLobby);
    });

    socket.on("error-message", (msg: string) => {
      alert(msg);
    });

    return () => {
      socket.off("lobby-updated");
      socket.off("error-message");
    };
  }, [socket]);

  const handleCreateLobby = () => {
    if (!name) return alert("You must enter a name!");
    socket.emit("create-lobby", name);
  };

  const handleJoinLobby = () => {
    if (!name || !code) return alert("You must enter a name and lobby code!");
    socket.emit("join-lobby", { code, name });
  };

  if (lobby) {
    return <Lobby lobby={lobby} />;
  }

  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-gray-400">
        <circle cx="7.5" cy="15.5" r="5.5"></circle>
        <path d="M12 10h5.5a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-1.5"></path>
        <path d="m12 13-1.5-1.5"></path>
    </svg>
);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl p-6 md:p-20 max-w-7xl w-full min-h-[600px] md:min-h-[780px] text-center transform transition-all duration-500 hover:scale-105">
      <div className="relative mb-8 md:mb-20">
        <div className="absolute inset-0 bg-blue-500 transform -skew-y-3 rounded-lg"></div>
        <h1 className="relative text-4xl md:text-7xl font-extrabold text-white py-4 md:py-6 tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}>
          JOIN GAME
        </h1>
      </div>

      <div className="mb-8 md:mb-16">
        <label htmlFor="name" className="sr-only">Your Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 md:pl-5 flex items-center pointer-events-none">
            <UserIcon />
          </div>
          <input
            id="name"
            type="text"
            placeholder="Enter Your Name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full max-w-xl mx-auto border-2 border-gray-300 rounded-full p-4 md:p-6 pl-12 md:pl-16 text-lg md:text-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-around space-y-8 md:space-y-0 md:space-x-16">
        
        {/* Create Lobby Section */}
        <div className="flex flex-col items-center space-y-4 md:space-y-8 w-full md:w-1/2">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-700">Create Lobby</h2>
          <p className="text-lg md:text-xl text-gray-500 px-4 text-center">Start a new game and invite your friends.</p>
          <button
            onClick={handleCreateLobby}
            className="w-full max-w-md bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 md:py-6 px-8 md:px-10 rounded-full shadow-lg transform hover:-translate-y-1 transition duration-300 ease-in-out text-xl md:text-2xl"
          >
            Create
          </button>
        </div>
        
        {/* Ayırıcı */}
        <div className="relative w-full md:w-auto flex items-center justify-center my-4 md:my-0">
          <div className="block md:hidden w-full h-px bg-gray-300"></div>
          <div className="hidden md:block h-64 w-px bg-gray-300"></div>
          <div className="absolute bg-white px-4 md:px-6 py-2 md:py-3 rounded-full border-2 border-gray-300 font-bold text-gray-500 text-lg md:text-xl">
            OR
          </div>
        </div>

        {/* Join Lobby Section */}
        <div className="flex flex-col items-center space-y-4 md:space-y-8 w-full md:w-1/2">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-700">Join Lobby</h2>
          <p className="text-lg md:text-xl text-gray-500 px-4 text-center">Enter the code to join an existing game.</p>
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 md:pl-5 flex items-center pointer-events-none">
              <KeyIcon />
            </div>
            <input
              type="text"
              placeholder="Lobby Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-full p-4 md:p-6 pl-12 md:pl-16 text-lg md:text-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>
          <button
            onClick={handleJoinLobby}
            className="w-full max-w-md bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 md:py-6 px-8 md:px-10 rounded-full shadow-lg transform hover:-translate-y-1 transition duration-300 ease-in-out text-xl md:text-2xl"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
