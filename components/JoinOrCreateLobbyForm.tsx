// components/JoinOrCreateLobbyForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// nanoid'i artık sunucu tarafında (API rotasında) kullanacağımız için burada ihtiyacımız yok.

/**
 * JoinOrCreateLobbyForm bileşeni, kullanıcıların isimlerini girmelerini,
 * yeni bir lobi oluşturmalarını veya mevcut bir lobiye katılmalarını sağlar.
 */
export default function JoinOrCreateLobbyForm() {
  // Oyuncunun adı state'i
  const [name, setName] = useState("");
  // Katılmak istenen lobi kodu state'i
  const [lobbyCode, setLobbyCode] = useState("");
  // Hata mesajı state'i
  const [error, setError] = useState("");
  // Yönlendirme için Next.js router
  const router = useRouter();

  // Komponent yüklendiğinde veya 'name' state'i değiştiğinde çalışır.
  // localStorage'dan oyuncu adını yükler ve input'a set eder.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("playerName");
      if (storedName) {
        setName(storedName);
      } else {
      }
    }
  }, []); // Bağımlılık dizisi boş olduğu için sadece bir kere çalışır

  // Oyuncu adı input'u değiştiğinde çalışır.
  // Yeni değeri state'e kaydeder ve localStorage'ı günceller.
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    setError(""); // Yeni giriş yapıldığında hatayı temizle
    if (typeof window !== "undefined") {
      localStorage.setItem("playerName", newName); // Her değişiklikte localStorage'ı güncelle
    }
  };

  /**
   * "Lobi Kur" butonuna basıldığında tetiklenir.
   * Sunucu API'sinden yeni bir lobi kodu talep eder.
   */
  const handleCreate = async () => {
    setError(""); // Önceki hataları temizle
    if (!name.trim()) {
      return setError("Please enter your name to create a lobby.");
    }

    try {
      // /api/create-lobby rotasına POST isteği gönder
      const res = await fetch("/api/create-lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }), // Sunucuya ismi gönder
      });

      if (!res.ok) {
        // HTTP hatası varsa
        const errorData = await res.json();
        throw new Error(errorData.message || "Lobby could not be created.");
      }

      const data = await res.json();
      if (data.code) {
        // Başarılı lobi oluşturulduysa, lobi sayfasına yönlendir
        router.push(`/lobby/${data.code}`);
      } else {
        setError("Lobby could not be created: no valid code received.");
      }
    } catch (err: any) {
      console.error("Lobby creation error:", err);
      setError(err.message || "An error occurred while creating the lobby.");
    }
  };

  /**
   * "Lobiye Katıl" butonuna basıldığında tetiklenir.
   * Sunucu API'sine lobiye katılma isteği gönderir.
   */
  const handleJoin = async () => {
    setError(""); // Önceki hataları temizle
    if (!name.trim()) {
      return setError("Please enter your name to join the lobby.");
    }
    if (!lobbyCode.trim()) {
      return setError("Please enter the lobby code you want to join.");
    }

    try {
      // /api/join-lobby rotasına POST isteği gönder
      const res = await fetch("/api/join-lobby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Bu API çağrısı aslında sadece lobinin varlığını doğrular.
        // Asıl lobiye katılım Socket.IO üzerinden LobbyClient yüklendiğinde gerçekleşir.
        body: JSON.stringify({ name: name.trim(), code: lobbyCode.trim().toUpperCase() }),
      });

      if (!res.ok) {
        // HTTP hatası varsa
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to join the lobby.");
      }

      const data = await res.json();
      if (data.success) {
        // Katılım başarılıysa, lobi sayfasına yönlendir
        router.push(`/lobby/${lobbyCode.trim().toUpperCase()}`);
      } else {
        // Sunucudan success: false dönerse
        setError(data.message || "Lobby not found or join failed.");
      }
    } catch (err: any) {
      console.error("Lobby join error:", err);
      setError(err.message || "An error occurred while joining the lobby.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Name Input */}
      <input
        type="text"
        placeholder="Your Name"
        className="border-2 border-blue-500 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 bg-white text-blue-900 font-bold shadow-md placeholder-blue-400 transition duration-200"
        value={name}
        onChange={handleNameChange}
        maxLength={15}
        required
      />

      {/* Create Lobby Button */}
      <button
        onClick={handleCreate}
        className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold shadow transition duration-200 disabled:opacity-50"
        disabled={!name.trim()} // İsim boşsa pasif yap
      >
        Create Lobby
      </button>

      {/* Lobby Code Input */}
      <input
        type="text"
        placeholder="Lobby Code"
        className="border-2 border-pink-500 rounded-xl p-3 focus:ring-2 focus:ring-pink-400 focus:border-pink-500 bg-white text-pink-900 font-bold shadow-md placeholder-pink-400 transition duration-200 uppercase tracking-wider"
        value={lobbyCode}
        onChange={(e) => {
          setLobbyCode(e.target.value);
          setError("");
        }}
        maxLength={6}
        required
      />

      {/* Join Lobby Button */}
      <button
        onClick={handleJoin}
        className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold shadow transition duration-200 disabled:opacity-50"
        disabled={!name.trim() || !lobbyCode.trim()} // İsim veya lobi kodu boşsa pasif yap
      >
        Join Lobby
      </button>

      {/* Hata Mesajı */}
      {error && (
        <p className="text-red-500 text-sm p-2 bg-red-100 border border-red-300 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}

