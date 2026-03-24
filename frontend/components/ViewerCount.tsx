"use client";

interface Props {
  count: number;
}

export function ViewerCount({ count }: Props) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {count.toLocaleString()} viewers
    </div>
  );
}
