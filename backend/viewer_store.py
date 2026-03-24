import asyncio
import os
from datetime import datetime, timedelta

from models import Viewer, ViewerStatus

# In-memory store: unique_id → Viewer
_viewers: dict[str, Viewer] = {}
_viewer_count: int = 0

INACTIVE_THRESHOLD = int(os.getenv("INACTIVE_THRESHOLD_MINUTES", "5"))


def upsert_viewer(unique_id: str, nickname: str, avatar_url: str | None = None) -> Viewer:
    """Add new viewer or refresh last_seen_at for existing viewer."""
    now = datetime.utcnow()
    if unique_id in _viewers:
        viewer = _viewers[unique_id]
        viewer.last_seen_at = now
        viewer.status = ViewerStatus.ACTIVE
        viewer.event_count += 1
    else:
        viewer = Viewer(
            unique_id=unique_id,
            nickname=nickname,
            avatar_url=avatar_url,
            joined_at=now,
            last_seen_at=now,
        )
        _viewers[unique_id] = viewer
    return viewer


def get_all_viewers() -> list[Viewer]:
    return list(_viewers.values())


def get_viewer(unique_id: str) -> Viewer | None:
    return _viewers.get(unique_id)


def set_viewer_count(count: int) -> None:
    global _viewer_count
    _viewer_count = count


def get_viewer_count() -> int:
    return _viewer_count


def clear_all() -> None:
    _viewers.clear()
    global _viewer_count
    _viewer_count = 0


def check_inactive() -> list[Viewer]:
    """Return viewers that just became INACTIVE. Call this periodically."""
    threshold = timedelta(minutes=INACTIVE_THRESHOLD)
    now = datetime.utcnow()
    newly_inactive = []
    for viewer in _viewers.values():
        if viewer.status == ViewerStatus.ACTIVE:
            if now - viewer.last_seen_at > threshold:
                viewer.status = ViewerStatus.INACTIVE
                newly_inactive.append(viewer)
    return newly_inactive
