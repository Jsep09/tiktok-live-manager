"use client";

import { useState } from "react";
import { Viewer } from "@/lib/types";
import { ViewerCard } from "./ViewerCard";

interface Props {
  viewers: Viewer[];
  onSpeak: (username: string) => void;
  isConnected: boolean;
  searchQuery: string;
}

export function ViewerList({ viewers, onSpeak, isConnected, searchQuery }: Props) {
  const [tab, setTab] = useState<"active" | "left">("active");

  const active = viewers.filter((v) => v.status === "active");
  const left = viewers.filter((v) => v.status !== "active");
  const list = tab === "active" ? active : left;

  // Not connected yet — show prompt
  if (!isConnected && viewers.length === 0) {
    return (
      <div className="text-center py-14 text-slate-300 dark:text-slate-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-3"
        >
          <circle cx="12" cy="12" r="2" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M21.06 13.31A16 16 0 0 1 22.56 15" />
          <path d="M1.42 15a16 16 0 0 0 20.12 4" />
          <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
        <p className="text-sm">กด Connect เพื่อเริ่มต้น</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
        <TabButton
          label="กำลังดูอยู่"
          count={active.length}
          active={tab === "active"}
          onClick={() => setTab("active")}
        />
        <TabButton
          label="ออกไปแล้ว"
          count={left.length}
          active={tab === "left"}
          onClick={() => setTab("left")}
        />
      </div>

      {/* List */}
      {list.length > 0 ? (
        <div className="space-y-2">
          {list.map((viewer) => (
            <ViewerCard key={viewer.unique_id} viewer={viewer} onSpeak={onSpeak} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-400 dark:text-slate-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-2.5 opacity-50"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <p className="text-sm">
            {searchQuery
              ? "ไม่พบ viewer ที่ค้นหา"
              : tab === "active"
              ? "รอ viewer เข้า Live..."
              : "ยังไม่มีใครออกไป"}
          </p>
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
        active
          ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
      }`}
    >
      {label}
      <span
        className={`text-xs px-1.5 py-0.5 rounded-md font-medium tabular-nums ${
          active
            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
            : "bg-slate-200/80 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
