"use client";

import { Viewer } from "@/lib/types";

interface Props {
  viewer: Viewer;
  onSpeak: (username: string) => void;
}

export function ViewerCard({ viewer, onSpeak }: Props) {
  const isActive = viewer.status === "active";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isActive
          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700/60 shadow-sm"
          : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 opacity-50"
      }`}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
        {viewer.avatar_url ? (
          <img
            src={viewer.avatar_url}
            alt={viewer.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          viewer.unique_id.charAt(0).toUpperCase()
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 dark:text-slate-200 truncate text-sm">
          @{viewer.unique_id}
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
          {viewer.nickname}
        </p>
      </div>

      {/* Status badge */}
      <span
        className={`text-xs px-2 py-0.5 rounded-md font-medium flex-shrink-0 ${
          isActive
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
        }`}
      >
        {isActive ? "Watching" : "Left"}
      </span>

      {/* TTS Button */}
      <button
        onClick={() => onSpeak(viewer.nickname)}
        title={`อ่านชื่อ "${viewer.nickname}"`}
        className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center transition-all flex-shrink-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </button>
    </div>
  );
}
