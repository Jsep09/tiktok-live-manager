"""
TikTok Live Viewer Manager — FastAPI Backend
"""
import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import tiktok_client
import viewer_store
from models import StartSessionRequest, SessionStatus, Viewer

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------- #
# WebSocket connection manager
# --------------------------------------------------------------------------- #

class ConnectionManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        logger.info(f"WS client connected. Total: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        self.active.remove(ws)
        logger.info(f"WS client disconnected. Total: {len(self.active)}")

    async def broadcast(self, message: dict):
        data = json.dumps(message, default=str)
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.active.remove(ws)


manager = ConnectionManager()

# Register broadcast callback with tiktok_client
tiktok_client.set_broadcast_callback(manager.broadcast)


# --------------------------------------------------------------------------- #
# Background task: detect inactive viewers
# --------------------------------------------------------------------------- #

async def inactive_checker():
    while True:
        await asyncio.sleep(60)
        newly_inactive = viewer_store.check_inactive()
        for viewer in newly_inactive:
            await manager.broadcast({
                "type": "viewer_update",
                "data": viewer.model_dump(mode="json"),
            })


# --------------------------------------------------------------------------- #
# App lifecycle
# --------------------------------------------------------------------------- #

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(inactive_checker())
    yield
    task.cancel()


app = FastAPI(
    title="TikTok Live Viewer Manager",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------- #
# REST Endpoints
# --------------------------------------------------------------------------- #

@app.post("/api/session/start")
async def start_session(body: StartSessionRequest):
    if tiktok_client.is_connected():
        raise HTTPException(status_code=400, detail="Session already active")
    await tiktok_client.start(body.username)
    return {"status": "connecting", "username": body.username}


@app.post("/api/session/stop")
async def stop_session():
    await tiktok_client.stop()
    await manager.broadcast({
        "type": "session_status",
        "data": {"connected": False, "host": None},
    })
    return {"status": "disconnected"}


@app.get("/api/session/status", response_model=SessionStatus)
async def get_session_status():
    return SessionStatus(
        is_connected=tiktok_client.is_connected(),
        viewer_count=viewer_store.get_viewer_count(),
    )


@app.get("/api/viewers", response_model=list[Viewer])
async def get_viewers():
    return viewer_store.get_all_viewers()


@app.get("/api/viewers/{unique_id}", response_model=Viewer)
async def get_viewer(unique_id: str):
    viewer = viewer_store.get_viewer(unique_id)
    if not viewer:
        raise HTTPException(status_code=404, detail="Viewer not found")
    return viewer


# --------------------------------------------------------------------------- #
# Dev-only: mock events (for testing without real TikTok Live)
# --------------------------------------------------------------------------- #

@app.post("/dev/mock-join")
async def mock_join(body: dict):
    username = body.get("username", "test_user")
    viewer = viewer_store.upsert_viewer(
        unique_id=username,
        nickname=username.replace("_", " ").title(),
    )
    await manager.broadcast({
        "type": "viewer_join",
        "data": viewer.model_dump(mode="json"),
    })
    return {"ok": True, "viewer": viewer}


# --------------------------------------------------------------------------- #
# WebSocket
# --------------------------------------------------------------------------- #

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)

    # Send current state on connect
    await ws.send_text(json.dumps({
        "type": "session_status",
        "data": {
            "connected": tiktok_client.is_connected(),
            "host": None,
        }
    }))
    all_viewers = viewer_store.get_all_viewers()
    for v in all_viewers:
        await ws.send_text(json.dumps({
            "type": "viewer_join",
            "data": v.model_dump(mode="json"),
        }, default=str))

    try:
        while True:
            await ws.receive_text()  # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(ws)
