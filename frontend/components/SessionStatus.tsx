"use client";

import { SessionStatus as SessionStatusType } from "@/lib/types";

interface Props {
  session: SessionStatusType;
  wsConnected: boolean;
  isConnecting: boolean;
}

export function SessionStatus({ session, wsConnected, isConnecting }: Props) {
  const dotColor = session.connected
    ? "bg-emerald-400 animate-pulse"
    : isConnecting
    ? "bg-amber-400 animate-pulse"
    : "bg-slate-300 dark:bg-slate-600";

  const label = session.connected
    ? `Connected · @${session.host}`
    : isConnecting
    ? "กำลังเชื่อมต่อ TikTok Live..."
    : wsConnected
    ? "Ready to connect"
    : "Connecting to server...";

  return (
    <div className="flex items-center gap-2">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}
