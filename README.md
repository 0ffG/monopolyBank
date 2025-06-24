Proje Adı: "Dijital Monopoly Kasası"

Proje Özeti

Bu web uygulaması, Monopoly oyuncularının fiziksel para kullanmak yerine tüm finansal işlemlerini dijital ortamda takip etmelerini sağlar. Bir oyuncu "Lobi Kurucu" (Host) olarak oyunu başlatır, diğer oyuncular benzersiz bir lobi kodu ile katılır. Oyun başladığında, sırası gelen oyuncu para transferi, kasadan para ekleme/çıkarma gibi işlemleri yapabilir. Tüm işlemler bir geçmiş kaydında tutulur ve lobi kurucusu hatalı işlemleri geri alabilir.

Teknoloji Yığını (Technology Stack)

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Frontend: Next.js (React ile)
Styling: Tailwind CSS (Hızlı ve modern tasarım için ideal) veya Chakra UI / Shadcn/UI (Hazır bileşenler için)
Backend: Next.js API Routes
Real-time İletişim: Socket.IO veya Pusher. Bu proje için Socket.IO en uygunudur çünkü lobiye katılım, anlık bakiye güncellemeleri ve sıra geçişleri gibi gerçek zamanlı iletişim gerektirir.
State Management (Durum Yönetimi): React Context API veya Zustand. Küçük ve orta ölçekli bu proje için Context API yeterli olacaktır.
