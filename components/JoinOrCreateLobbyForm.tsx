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
    console.log("JoinOrCreateLobbyForm: useEffect çalışıyor, localStorage kontrol ediliyor.");
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("playerName");
      if (storedName) {
        setName(storedName);
        console.log("JoinOrCreateLobbyForm: playerName localStorage'dan alındı:", storedName);
      } else {
        console.log("JoinOrCreateLobbyForm: localStorage'da playerName bulunamadı.");
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
      console.log("JoinOrCreateLobbyForm: playerName localStorage'a kaydedildi (anlık):", newName);
    }
  };

  /**
   * "Lobi Kur" butonuna basıldığında tetiklenir.
   * Sunucu API'sinden yeni bir lobi kodu talep eder.
   */
  const handleCreate = async () => {
    setError(""); // Önceki hataları temizle
    if (!name.trim()) {
      return setError("Lütfen lobi kurmak için isminizi girin.");
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
        throw new Error(errorData.message || "Lobi oluşturulamadı.");
      }

      const data = await res.json();
      if (data.code) {
        // Başarılı lobi oluşturulduysa, lobi sayfasına yönlendir
        console.log(`Lobi başarıyla oluşturuldu, kod: ${data.code}`);
        // localStorage.setItem("playerName", name.trim()); // Zaten handleNameChange içinde yapılıyor
        router.push(`/lobby/${data.code}`);
      } else {
        setError("Lobi oluşturulamadı: Geçerli bir kod alınamadı.");
      }
    } catch (err: any) {
      console.error("Lobi oluşturma hatası:", err);
      setError(err.message || "Lobi oluşturulurken bir hata oluştu.");
    }
  };

  /**
   * "Lobiye Katıl" butonuna basıldığında tetiklenir.
   * Sunucu API'sine lobiye katılma isteği gönderir.
   */
  const handleJoin = async () => {
    setError(""); // Önceki hataları temizle
    if (!name.trim()) {
      return setError("Lütfen lobiye katılmak için isminizi girin.");
    }
    if (!lobbyCode.trim()) {
      return setError("Lütfen katılmak istediğiniz lobi kodunu girin.");
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
        throw new Error(errorData.message || "Lobiye katılım başarısız.");
      }

      const data = await res.json();
      if (data.success) {
        // Katılım başarılıysa, lobi sayfasına yönlendir
        console.log(`Lobiye başarıyla katılma isteği gönderildi, kod: ${lobbyCode}`);
        // localStorage.setItem("playerName", name.trim()); // Zaten handleNameChange içinde yapılıyor
        router.push(`/lobby/${lobbyCode.trim().toUpperCase()}`);
      } else {
        // Sunucudan success: false dönerse
        setError(data.message || "Lobi bulunamadı veya katılım başarısız.");
      }
    } catch (err: any) {
      console.error("Lobiye katılma hatası:", err);
      setError(err.message || "Lobiye katılırken bir hata oluştu.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* İsim Girişi */}
      <input
        type="text"
        placeholder="İsminiz"
        className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
        value={name}
        onChange={handleNameChange} // Güncellenmiş onChange handler
        maxLength={15}
        required
      />

      {/* Lobi Kur Butonu */}
      <button
        onClick={handleCreate}
        className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold shadow transition duration-200 disabled:opacity-50"
        disabled={!name.trim()} // İsim boşsa pasif yap
      >
        Lobi Kur
      </button>

      {/* Lobi Kodu Girişi */}
      <input
        type="text"
        placeholder="Lobi Kodu"
        className="border rounded-lg p-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200 uppercase tracking-wider"
        value={lobbyCode}
        onChange={(e) => {
          setLobbyCode(e.target.value);
          setError(""); // Yeni giriş yapıldığında hatayı temizle
        }}
        maxLength={6} // Lobi kodunu 6 karakterle sınırla
        required
      />

      {/* Lobiye Katıl Butonu */}
      <button
        onClick={handleJoin}
        className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold shadow transition duration-200 disabled:opacity-50"
        disabled={!name.trim() || !lobbyCode.trim()} // İsim veya lobi kodu boşsa pasif yap
      >
        Lobiye Katıl
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

