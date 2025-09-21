Project Summary 

This web application allows Monopoly players to track all financial transactions digitally instead of using physical money. One player launches the game as the "Lobby Host", and other players join with a unique lobby code. Once the game starts, the player whose turn it is can perform actions such as transferring money between players or adding/removing funds from the bank. All transactions are kept in a history log, and the lobby host can undo incorrect transactions.





🔹 **Lobby ile İlgili Eventler**

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
