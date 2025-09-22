"use client";

import LobbyClient from "../components/LobbyClient";

export default function HomePage() {
  return (
    // Canlı ve modern bir arka plan ekledim.
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 p-4 font-sans">
      <LobbyClient />
    </main>
  );
}
