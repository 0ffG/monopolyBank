// components/LobbyClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket"; // Doğru yolu kontrol edin

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
    console.log("LobbyClient useEffect (1): localStorage'dan playerName okunuyor.");
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("playerName");
      if (name && name.trim() !== '') { // İsimin boş veya sadece boşluk olmadığını kontrol et
        setPlayerName(name.trim()); // İsimdeki boşlukları temizleyerek set et
        console.log("LobbyClient (1): playerName localStorage'dan alındı:", name.trim());
      } else {
        console.warn("LobbyClient (1): localStorage'da geçerli playerName bulunamadı, ana sayfaya yönlendiriliyor.");
        // Eğer playerName yoksa veya geçersizse, kullanıcıyı isim girmeye zorlamak için ana sayfaya yönlendir.
        // Bu, refresh sonrası isimsiz kalma sorununu çözmelidir.
        router.push("/");
      }
    }
  }, [router]); // router bağımlılık olarak eklendi

  // 2. Socket bağlantısı ve lobiye katılma işlemi
  // Bu useEffect, playerName veya lobbyCode değiştiğinde tetiklenir.
  useEffect(() => {
    // playerName boşsa (yukarıdaki useEffect'ten henüz gelmediyse) veya lobbyCode boşsa işlemi atla.
    if (!playerName || !lobbyCode) {
      console.log("LobbyClient useEffect (2): playerName veya lobbyCode mevcut değil, socket join atlanıyor.", { playerName, lobbyCode });
      return;
    }

    const socket = getSocket();

    // Olay dinleyicilerini önceden ekleyelim ki join sonrası gelecek ilk mesajı kaçırmayalım
    const handleLobbyUpdate = (data: LobbyData) => {
      console.log("✅ 'lobby-updated' alındı:", data);
      setLobby(data);
      setIsOwner(data.owner === playerName);
      if (data.players && data.players.length > 0) {
        data.players.forEach((p) =>
          console.log(`  Gelen Oyuncu: ID=${p.id}, İsim='${p.name}'`)
        );
      } else {
        console.log("  Gelen lobide hiç oyuncu yok veya liste boş.");
      }
    };

    const handleGameStarted = (data: { lobbyCode: string }) => {
      console.log("🚀 'game-started' alındı, oyuna yönlendiriliyor:", data.lobbyCode);
      router.push(`/game/${data.lobbyCode}`);
    };

    const handleJoinError = (data: { message: string }) => {
      console.error("Lobiye katılım hatası:", data.message);
      alert(`Lobiye katılırken hata oluştu: ${data.message}`);
      router.push("/");
    };

    socket.on("lobby-updated", handleLobbyUpdate);
    socket.on("game-started", handleGameStarted);
    socket.on("join-error", handleJoinError);

    const handleConnect = () => {
      console.log("Socket bağlandı, join-lobby gönderiliyor...");
      socket.emit("join-lobby", { name: playerName, code: lobbyCode });
    };

    if (socket.connected) {
      console.log(
        "🟢 'join-lobby' olayını sunucuya gönderiliyor (socket zaten bağlı):",
        { name: playerName, code: lobbyCode }
      );
      socket.emit("join-lobby", { name: playerName, code: lobbyCode });
    } else {
      console.log("Socket henüz bağlı değil, 'connect' olayını dinliyor...");
      socket.once("connect", handleConnect);
    }


    /**
     * Cleanup fonksiyonu: Bileşen kaldırıldığında veya bağımlılıklar değiştiğinde
     * olay dinleyicilerini kaldırır.
     */
    return () => {
      console.log("LobbyClient useEffect (2) Cleanup: Socket event listener'ları kaldırılıyor.");
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
    console.log("Oyunu başlatılıyor...");
    const socket = getSocket();
    socket.emit("start-game", { code: lobbyCode, balance });
    console.log(`'start-game' olayı gönderildi: Lobi ${lobbyCode}, Başlangıç Parası: ${balance}`);
  }

  // Lobi verileri yüklenirken gösterilecek yükleme durumu
  if (!lobby) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="p-6 text-center text-gray-700 bg-white shadow-xl rounded-2xl animate-pulse">
          <div className="mb-2 text-xl font-semibold">
            <span className="font-bold">Lobi Kodu:</span>{" "}
            <span className="text-blue-600">{lobbyCode}</span>
          </div>
          <p className="text-lg">⏳ Lobi yükleniyor...</p>
          <p className="mt-2 text-sm text-gray-500">
            Lütfen bekleyin, diğer oyuncular bekleniyor.
          </p>
          {/* Eğer playerName boşsa ek uyarı göster */}
          {!playerName && (
              <p className="mt-4 text-red-500 text-sm font-semibold">
                İsim belirlenmediği için lobiye katılım engellenmiş olabilir. Lütfen ana sayfaya dönüp isminizi girin.
              </p>
          )}
        </div>
      </div>
    );
  }

  // Ana lobi ekranı (oyuncu listesi, başlatma ayarları)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-4">
      <div className="p-8 max-w-lg w-full bg-white shadow-2xl rounded-2xl mt-10 border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Lobi Kodu:{" "}
          <span className="text-blue-600 animate-pulse-slow">
            {lobby?.code || lobbyCode}
          </span>
        </h2>
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Oyuncular:</h3>
        <ul className="mb-6 space-y-2">
          {/* Oyuncu listesini render et */}
          {lobby.players.map((player) => {
            console.log(`Oyuncu render ediliyor: ID='${player.id}', İsim='${player.name}'`);
            return (
              <li
                key={player.id} // Her zaman benzersiz 'player.id'yi anahtar olarak kullanıyoruz
                className="py-2 px-4 bg-gray-50 rounded-lg flex items-center justify-between shadow-sm border border-gray-100"
              >
                {/* Oyuncunun ismini göster, boşsa veya geçersizse varsayılan metin göster */}
                <span className="font-medium text-gray-800">
                  {player.name && player.name.trim() !== '' ? player.name : "İsimsiz Oyuncu"}
                </span>
                {player.name === lobby.owner && ( // Owner hala isimle karşılaştırılıyor
                  <span className="text-sm text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-full">
                    Kurucu
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {isOwner && (
          <div className="flex flex-col gap-5 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <label htmlFor="balance-input" className="text-lg font-medium text-gray-700">
              Başlangıç Parası:
            </label>
            <input
              id="balance-input"
              type="number"
              className="border border-blue-300 rounded-lg p-3 text-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 ease-in-out shadow-sm"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              min="0" // Bakiye negatif olmasın
            />
            <button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-lg shadow-lg transform transition duration-300 ease-in-out hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
              Oyunu Başlat
            </button>
          </div>
        )}

        {!isOwner && (
          <p className="text-md text-center mt-6 text-gray-600 italic">
            Kurucunun oyunu başlatmasını bekliyorsunuz...
          </p>
        )}
      </div>
    </div>
  );
}

