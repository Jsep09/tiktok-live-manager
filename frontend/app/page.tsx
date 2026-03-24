"use client";

import { useCallback, useState } from "react";
import { Viewer, WSMessage, SessionStatus } from "@/lib/types";
import { useTTS } from "@/hooks/useTTS";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ConnectForm } from "@/components/ConnectForm";
import { SessionStatus as SessionStatusDisplay } from "@/components/SessionStatus";
import { ViewerCount } from "@/components/ViewerCount";
import { SearchBar } from "@/components/SearchBar";
import { ViewerList } from "@/components/ViewerList";
import { ThemeToggle } from "@/components/ThemeToggle";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function Home() {
  const [viewers, setViewers] = useState<Map<string, Viewer>>(new Map());
  const [session, setSession] = useState<SessionStatus>({
    connected: false,
    host: null,
  });
  const [viewerCount, setViewerCount] = useState(0);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { speak, isSupported } = useTTS();

  const handleMessage = useCallback((msg: WSMessage) => {
    switch (msg.type) {
      case "viewer_join":
      case "viewer_update": {
        const v = msg.data as unknown as Viewer;
        setViewers((prev) => new Map(prev).set(v.unique_id, v));
        break;
      }
      case "viewer_count":
        setViewerCount((msg.data as { count: number }).count);
        break;
      case "session_status": {
        const s = msg.data as unknown as SessionStatus;
        setSession(s);
        setIsConnecting(false);
        if (!s.connected) {
          setViewers(new Map());
          setViewerCount(0);
        }
        break;
      }
      default:
        break;
    }
  }, []);

  const { isConnected: wsConnected } = useWebSocket(handleMessage);

  const handleConnect = async () => {
    if (!username.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/session/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      if (res.ok) setIsConnecting(true);
    } catch (e) {
      console.error("Failed to start session", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    setIsConnecting(false);
    try {
      await fetch(`${API_URL}/api/session/stop`, { method: "POST" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredViewers: Viewer[] = Array.from(viewers.values()).filter((v) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.unique_id.toLowerCase().includes(q) ||
      v.nickname.toLowerCase().includes(q)
    );
  });

  filteredViewers.sort(
    (a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime()
  );

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-xl mx-auto space-y-3">

        {/* Header */}
        <div className="flex items-start justify-between pt-6 pb-1">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              TikTok Live Manager
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              กดปุ่มอ่านเสียงเพื่อฟัง username
            </p>
            {!isSupported && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">
                Browser นี้ไม่รองรับ TTS — แนะนำใช้ Chrome
              </p>
            )}
          </div>
          <ThemeToggle />
        </div>

        {/* Connect panel */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 space-y-3 shadow-sm">
          <ConnectForm
            username={username}
            onChange={setUsername}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            isConnected={session.connected}
            isConnecting={isConnecting}
            isLoading={isLoading}
          />
          <div className="flex items-center justify-between">
            <SessionStatusDisplay
              session={session}
              wsConnected={wsConnected}
              isConnecting={isConnecting}
            />
            {session.connected && <ViewerCount count={viewerCount} />}
          </div>
        </div>

        {/* Search */}
        {viewers.size > 0 && (
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        )}

        {/* Viewer list */}
        <ViewerList
          viewers={filteredViewers}
          onSpeak={speak}
          isConnected={session.connected}
          searchQuery={searchQuery}
        />

        {/* Footer */}
        <p className="text-center text-xs text-slate-300 dark:text-slate-700 pb-6">
          Powered by TikTokLive + Web Speech API
        </p>
      </div>
    </main>
  );
}
