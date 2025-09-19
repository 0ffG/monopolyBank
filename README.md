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



calistirma icin 



---Socket server için (terminal 1)  
cd ~/Desktop/monopoly_bank
npx ts-node socket-server.ts

!!ts-node kurulu degilse 
npm install -D ts-node typescript @types/node


--nextjs icin (terminal 2)
cd ~/Desktop/monopoly_bank
npm run dev
