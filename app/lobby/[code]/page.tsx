"use client";

import { useParams } from "next/navigation";
import LobbyClient from "@/components/LobbyClient";

export default function LobbyWrapper() {
  const params = useParams<{ code: string }>();
  const code = params.code ?? "";

  return <LobbyClient lobbyCode={code} />;
}
