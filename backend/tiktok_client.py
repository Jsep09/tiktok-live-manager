"""
TikTokLive event handler.
Connects to a TikTok Live stream and forwards events to viewer_store + WebSocket broadcast.
"""
import asyncio
import logging

from TikTokLive import TikTokLiveClient
from TikTokLive.events import (
    ConnectEvent,
    DisconnectEvent,
    JoinEvent,
    RoomUserSeqEvent,
    CommentEvent,
    LikeEvent,
)

import viewer_store

logger = logging.getLogger(__name__)

_client: TikTokLiveClient | None = None
_broadcast_callback = None  # async fn(message: dict) → None


def set_broadcast_callback(callback):
    """Register a callback to broadcast WebSocket messages."""
    global _broadcast_callback
    _broadcast_callback = callback


async def _broadcast(message: dict):
    if _broadcast_callback:
        await _broadcast_callback(message)


async def start(username: str):
    """Start listening to a TikTok Live session."""
    global _client

    if _client is not None:
        await stop()

    username = username.lstrip("@")
    _client = TikTokLiveClient(unique_id=f"@{username}")

    @_client.on(ConnectEvent)
    async def on_connect(event: ConnectEvent):
        logger.info(f"Connected to @{username} Live")
        await _broadcast({
            "type": "session_status",
            "data": {"connected": True, "host": username}
        })

    @_client.on(DisconnectEvent)
    async def on_disconnect(event: DisconnectEvent):
        logger.info(f"Disconnected from @{username} Live")
        await _broadcast({
            "type": "session_status",
            "data": {"connected": False, "host": username}
        })

    @_client.on(JoinEvent)
    async def on_member_join(event: JoinEvent):
        user = event.user
        viewer = viewer_store.upsert_viewer(
            unique_id=user.unique_id,
            nickname=user.nickname,
            avatar_url=getattr(user, "avatar_thumb", None),
        )
        msg_type = "viewer_join" if viewer.event_count == 1 else "viewer_update"
        await _broadcast({
            "type": msg_type,
            "data": viewer.model_dump(mode="json"),
        })
        logger.debug(f"Member joined: {user.unique_id}")

    @_client.on(CommentEvent)
    async def on_comment(event: CommentEvent):
        user = event.user
        viewer = viewer_store.upsert_viewer(
            unique_id=user.unique_id,
            nickname=user.nickname,
        )
        await _broadcast({
            "type": "viewer_update",
            "data": viewer.model_dump(mode="json"),
        })

    @_client.on(LikeEvent)
    async def on_like(event: LikeEvent):
        user = event.user
        viewer = viewer_store.upsert_viewer(
            unique_id=user.unique_id,
            nickname=user.nickname,
        )
        await _broadcast({
            "type": "viewer_update",
            "data": viewer.model_dump(mode="json"),
        })

    @_client.on(RoomUserSeqEvent)
    async def on_viewer_update(event: RoomUserSeqEvent):
        count = event.total_user
        viewer_store.set_viewer_count(count)
        await _broadcast({
            "type": "viewer_count",
            "data": {"count": count},
        })

    # Run in background
    asyncio.create_task(_client.start())
    logger.info(f"TikTok client started for @{username}")


async def stop():
    """Stop the TikTok Live connection."""
    global _client
    if _client:
        try:
            await _client.disconnect()
        except Exception as e:
            logger.warning(f"Error disconnecting: {e}")
        _client = None
    viewer_store.clear_all()
    logger.info("TikTok client stopped")


def is_connected() -> bool:
    return _client is not None and _client.connected
