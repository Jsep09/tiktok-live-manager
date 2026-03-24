from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ViewerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class Viewer(BaseModel):
    unique_id: str
    nickname: str
    avatar_url: str | None = None
    joined_at: datetime
    last_seen_at: datetime
    status: ViewerStatus = ViewerStatus.ACTIVE
    event_count: int = 1


class SessionStatus(BaseModel):
    is_connected: bool
    host_username: str | None = None
    viewer_count: int = 0
    started_at: datetime | None = None


class StartSessionRequest(BaseModel):
    username: str


class WSMessage(BaseModel):
    type: str
    data: dict
