// app/page.tsx
import JoinOrCreateLobbyForm from "@/components/JoinOrCreateLobbyForm";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Monopoly Dijital Kasa</h1>
        <JoinOrCreateLobbyForm />
      </div>
    </main>
  );
}
