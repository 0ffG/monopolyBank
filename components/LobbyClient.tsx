// components/LobbyClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket"; // Doğru yolu kontrol edin
import PlayerList from "./PlayerList";

// Oyuncu tipi tanımı: Şimdi id içeriyor
type Player = {
  id: string; // Oyuncunun Socket ID'si olacak (benzersiz bir anahtar sağlar)
  name: string;
};

type LobbyData = {
  code: string;
  players: Player[];
  owner: string; // Bu hala oyuncunun ismi olacak (lobi sahibinin adı)
};

/**
 * LobbyClient bileşeni, bir lobiye katılmayı, oyuncuları görüntülemeyi ve
 * lobi sahibinin oyunu başlatmasını sağlar.
 *
 * @param {object} props - Bileşen özellikleri.
 * @param {string} props.lobbyCode - Katılınacak lobinin benzersiz kodu.
 */
export default function LobbyClient({ lobbyCode }: { lobbyCode: string }) {
  const [playerName, setPlayerName] = useState("");
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [balance, setBalance] = useState(1500);
  const router = useRouter();

  // 1. localStorage'tan playerName güvenli şekilde alınır
  // Bu useEffect, yalnızca bileşen ilk yüklendiğinde çalışır ve playerName'i alır.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("playerName");
      if (name && name.trim() !== '') { // İsimin boş veya sadece boşluk olmadığını kontrol et
        setPlayerName(name.trim()); // İsimdeki boşlukları temizleyerek set et
      } else {
        console.warn("LobbyClient (1): localStorage'da geçerli playerName bulunamadı, ana sayfaya yönlendiriliyor.");
        router.push("/");
      }
    }
  }, [router]);

  // 2. Socket bağlantısı ve lobiye katılma işlemi
  // Bu useEffect, playerName veya lobbyCode değiştiğinde tetiklenir.
  useEffect(() => {
    // playerName boşsa (yukarıdaki useEffect'ten henüz gelmediyse) veya lobbyCode boşsa işlemi atla.
    if (!playerName || !lobbyCode) {
      return;
    }

    const socket = getSocket();

    // Olay dinleyicilerini önceden ekleyelim ki join sonrası gelecek ilk mesajı kaçırmayalım
    const handleLobbyUpdate = (data: LobbyData) => {
      setLobby(data);
      setIsOwner(data.owner === playerName);
      if (data.players && data.players.length > 0) {
        data.players.forEach((p) => {
          /* player info */
        });
      }
    };

    const handleGameStarted = (data: { lobbyCode: string }) => {
      router.push(`/game/${data.lobbyCode}`);
    };

    const handleJoinError = (data: { message: string }) => {
      console.error("Error joining lobby:", data.message);
      alert(`Error joining lobby: ${data.message}`);
      router.push("/");
    };

    socket.on("lobby-updated", handleLobbyUpdate);
    socket.on("game-started", handleGameStarted);
    socket.on("join-error", handleJoinError);

    const handleConnect = () => {
      socket.emit("join-lobby", { name: playerName, code: lobbyCode });
    };

    if (socket.connected) {
      socket.emit("join-lobby", { name: playerName, code: lobbyCode });
    } else {
      socket.once("connect", handleConnect);
    }


    /**
     * Cleanup fonksiyonu: Bileşen kaldırıldığında veya bağımlılıklar değiştiğinde
     * olay dinleyicilerini kaldırır.
     */
    return () => {
      socket.off("connect", handleConnect); // Eklenen 'connect' listener'ı da kaldır
      socket.off("lobby-updated", handleLobbyUpdate);
      socket.off("game-started", handleGameStarted);
      socket.off("join-error", handleJoinError);
    };
  }, [playerName, lobbyCode, router]); // playerName ve router bağımlılık olarak eklendi

  /**
   * "Oyunu Başlat" butonuna tıklandığında tetiklenir.
   * Yalnızca lobi sahibi görebilir.
   */
  async function handleStartGame() {
    const socket = getSocket();
    socket.emit("start-game", { code: lobbyCode, balance });
  }

  // Loading state while lobby data is being fetched
  if (!lobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-500 p-4">
        <div className="p-6 text-center text-gray-800 bg-white shadow-2xl rounded-2xl animate-pulse border-2 border-blue-200">
          <div className="mb-2 text-2xl font-extrabold tracking-wide">
            <span className="font-extrabold text-indigo-700 drop-shadow">Lobby Code:</span>{" "}
            <span className="text-blue-600 font-extrabold text-2xl animate-pulse-slow drop-shadow">{lobbyCode}</span>
          </div>
          <p className="text-lg font-semibold text-indigo-700">⏳ Loading lobby...</p>
          <p className="mt-2 text-base text-blue-500 font-medium">
            Please wait, waiting for other players.
          </p>
          {/* Eğer playerName boşsa ek uyarı göster */}
          {!playerName && (
              <p className="mt-4 text-red-600 text-base font-bold">
                Joining the lobby may be blocked because no name was set. Please return to the home page and enter your name.
              </p>
          )}
        </div>
      </div>
    );
  }

  // Main lobby screen (player list and start settings)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-500 p-4">
      <div className="p-8 max-w-lg w-full bg-white shadow-2xl rounded-2xl mt-10 border-2 border-blue-200">
        <h2 className="text-4xl font-extrabold mb-6 text-center text-indigo-800 drop-shadow">
          Lobby Code:{" "}
          <span className="text-blue-600 animate-pulse-slow font-extrabold text-4xl drop-shadow">
            {lobby?.code || lobbyCode}
          </span>
        </h2>
        <h3 className="text-2xl font-bold mb-4 text-indigo-700 drop-shadow">Players:</h3>
        <PlayerList
          players={lobby.players}
          isOwner={isOwner}
          lobbyCode={lobbyCode}
          owner={lobby.owner}
        />
        {isOwner && (
          <div className="flex flex-col gap-5 p-4 bg-blue-50 rounded-lg border-2 border-blue-300 shadow">
            <label htmlFor="balance-input" className="text-lg font-bold text-indigo-700">
              Starting Money:
            </label>
            <input
              id="balance-input"
              type="number"
              className="border-2 border-blue-400 rounded-lg p-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out shadow-md text-indigo-800"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              min="0"
            />
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-extrabold py-3 rounded-lg shadow-xl transform transition duration-300 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 text-lg"
            >
              Start Game
            </button>
          </div>
        )}
        {!isOwner && (
          <p className="text-lg text-center mt-6 text-indigo-600 italic font-semibold">
            Waiting for the host to start the game...
          </p>
        )}
      </div>
    </div>
  );
}

