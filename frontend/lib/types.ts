export type ViewerStatus = "active" | "inactive";

export interface Viewer {
  unique_id: string;
  nickname: string;
  avatar_url: string | null;
  joined_at: string;
  last_seen_at: string;
  status: ViewerStatus;
  event_count: number;
}

export type WSMessageType =
  | "viewer_join"
  | "viewer_update"
  | "viewer_count"
  | "session_status"
  | "error";

export interface WSMessage {
  type: WSMessageType;
  data: Record<string, unknown>;
}

export interface SessionStatus {
  connected: boolean;
  host: string | null;
}
