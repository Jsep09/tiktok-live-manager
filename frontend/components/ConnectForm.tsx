"use client";

interface Props {
  username: string;
  onChange: (value: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnected: boolean;
  isConnecting: boolean;
  isLoading: boolean;
}

export function ConnectForm({
  username,
  onChange,
  onConnect,
  onDisconnect,
  isConnected,
  isConnecting,
  isLoading,
}: Props) {
  const isBusy = isLoading || isConnecting;

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={username}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && !isConnected && !isBusy && onConnect()
        }
        placeholder="@your_tiktok_username"
        disabled={isConnected || isConnecting}
        className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-indigo-500/30 disabled:opacity-50 transition-colors"
      />
      {isConnected || isConnecting ? (
        <button
          onClick={onDisconnect}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? "..." : "Disconnect"}
        </button>
      ) : (
        <button
          onClick={onConnect}
          disabled={isBusy || !username.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {isLoading ? "..." : "Connect"}
        </button>
      )}
    </div>
  );
}
