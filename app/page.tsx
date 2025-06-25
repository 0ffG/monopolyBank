// app/page.tsx
import JoinOrCreateLobbyForm from "@/components/JoinOrCreateLobbyForm";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-300 via-amber-300 to-sky-400 animate-gradient-x">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 via-amber-500 to-cyan-500 drop-shadow-lg tracking-wide animate-pulse-slow">
          Monopoly Digital Bank
        </h1>
        <JoinOrCreateLobbyForm />
      </div>
    </main>
  );
}
