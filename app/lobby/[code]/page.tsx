"use client";

import { useSearchParams } from "next/navigation";
import LobbyClient from "@/components/LobbyClient";

export default function LobbyWrapper() {
  const searchParams = useSearchParams();
  const code = typeof window !== "undefined"
    ? window.location.pathname.split("/").pop() ?? ""
    : "";

  return <LobbyClient lobbyCode={code} />;
}
