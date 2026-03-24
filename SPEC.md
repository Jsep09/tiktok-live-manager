# TikTok Live Viewer Manager — SPEC.md

> Version: 1.0
> Last updated: 2026-03-24
> Status: Draft

---

## 1. Overview

**TikTok Live Viewer Manager** คือ web application สำหรับช่วย TikTok Live host ที่อ่าน username ภาษาอังกฤษไม่คล่อง ให้สามารถกดฟังเสียงอ่าน username ของ viewer แต่ละคนได้ทันที พร้อมดูสถานะว่า viewer ยังดูอยู่หรือออกไปแล้ว

**ปัญหาหลักที่แก้:**
Host ไม่สามารถอ่าน username ภาษาอังกฤษออกเสียงได้ → ทำให้พูดถึง viewer ไม่ได้ → engagement ลดลง

**Solution:**
Real-time viewer list + ปุ่ม TTS กดเองทีละคน (ไม่อ่านอัตโนมัติ) ผ่าน Web Speech API

---

## 2. Tech Stack

| Layer | Technology | เหตุผล |
|---|---|---|
| Backend | Python 3.11+ / FastAPI | async-native, WebSocket support ดี |
| TikTok Integration | TikTokLive (isaackogan) | unofficial library ที่นิยมที่สุด |
| Real-time transport | WebSocket (FastAPI built-in) | push events จาก backend → frontend |
| Frontend | Next.js 14+ (App Router) | React ecosystem, SSR optional |
| Styling | Tailwind CSS | rapid UI, ไม่ต้องเขียน CSS เอง |
| TTS | Web Speech API (browser built-in) | ฟรี, ไม่ต้องมี API key, ทำงานใน browser |
| State (frontend) | React useState / useEffect | ไม่ต้องการ global state ซับซ้อน |
| Package manager | pip + npm/pnpm | standard |

---

## 3. TikTokLive Library — Events ที่ใช้

Library: `TikTokLive` by isaackogan (PyPI: `tiktoklive`)
Version target: `>=6.0.0`

### Events ที่ใช้งานในโปรเจกต์นี้

| Event Class | Trigger | ข้อมูลที่ได้ |
|---|---|---|
| `ConnectEvent` | เชื่อมต่อ Live สำเร็จ | — |
| `DisconnectEvent` | การเชื่อมต่อหลุด | error reason |
| `MemberEvent` | มีคนเข้า Live (join) | `user.unique_id`, `user.nickname`, `user.avatar` |
| `CommentEvent` | มีคน comment | `user.unique_id`, `comment` |
| `ViewerUpdateEvent` | จำนวน viewer อัปเดต | `viewer_count` |
| `LikeEvent` | มีคนกด like | `user.unique_id`, `like_count` |
| `GiftEvent` | มีคนส่งของขวัญ | `user.unique_id`, `gift.name` |

### ข้อจำกัดสำคัญ

> **ไม่มี "LeaveEvent"** ใน TikTokLive library
> การตรวจสอบว่า viewer ออกไปแล้วทำโดย:
> 1. Track `last_seen_at` timestamp ของแต่ละ viewer
> 2. ถ้าไม่มี event จาก user นั้นนาน > 5 นาที → mark เป็น `INACTIVE`
> 3. `ViewerUpdateEvent` ให้จำนวนรวม แต่ไม่ได้บอกว่าใครออก

### Example Usage

```python
from TikTokLive import TikTokLiveClient
from TikTokLive.events import ConnectEvent, MemberEvent, CommentEvent

client = TikTokLiveClient(unique_id="@host_username")

@client.on(ConnectEvent)
async def on_connect(event: ConnectEvent):
    print("Connected to Live!")

@client.on(MemberEvent)
async def on_member_join(event: MemberEvent):
    user = event.user
    print(f"{user.unique_id} joined the stream")
    # user.unique_id  → @username
    # user.nickname   → display name
    # user.avatar_url → profile picture URL

client.run()
```

---

## 4. User Stories

### Host (Primary User)

| ID | Story | Priority |
|---|---|---|
| US-01 | ในฐานะ Host ฉันอยากกรอก username ของตัวเองเพื่อเชื่อมต่อกับ Live ของตัวเอง | P0 |
| US-02 | ในฐานะ Host ฉันอยากเห็นรายชื่อ viewer ที่เข้ามาดู Live ของฉัน real-time | P0 |
| US-03 | ในฐานะ Host ฉันอยากกดปุ่มเพื่อให้ระบบอ่าน username ของ viewer คนนั้นออกเสียง | P0 |
| US-04 | ในฐานะ Host ฉันอยากค้นหา viewer ด้วยชื่อ เพื่อหาคนที่ต้องการจะพูดถึง | P1 |
| US-05 | ในฐานะ Host ฉันอยากรู้ว่า viewer คนไหนยังดูอยู่และคนไหนออกไปแล้ว | P1 |
| US-06 | ในฐานะ Host ฉันอยากเห็นจำนวน viewer ทั้งหมดในขณะนั้น | P1 |
| US-07 | ในฐานะ Host ฉันอยากเลือก voice / language สำหรับ TTS ได้ | P2 |
| US-08 | ในฐานะ Host ฉันอยากเห็น viewer ที่เข้ามาล่าสุดก่อน (newest first) | P2 |

---

## 5. Features & Priority

### P0 — Must Have (MVP)

- **[F-01] TikTok Live Connection**
  กรอก `@username` ของ host → backend เชื่อมต่อผ่าน TikTokLive library → แสดงสถานะ Connected/Disconnected

- **[F-02] Real-time Viewer List**
  แสดงรายชื่อ viewer ที่เข้า Live พร้อม `unique_id` และ `nickname` อัปเดต real-time ผ่าน WebSocket

- **[F-03] TTS Button per Viewer**
  ทุก viewer card มีปุ่ม 🔊 — เมื่อกด จะใช้ Web Speech API อ่าน `unique_id` ออกเสียง (ภาษาอังกฤษ, EN-US)
  ไม่มีการอ่านอัตโนมัติทุกกรณี

### P1 — Should Have

- **[F-04] Viewer Search**
  Search bar กรอง viewer list แบบ real-time ตาม `unique_id` หรือ `nickname`

- **[F-05] Active / Inactive Status**
  Viewer ที่ไม่มี activity นาน > 5 นาที จะถูก mark เป็น Inactive (สีจาง / badge "Left")
  Viewer ที่ยัง active แสดง badge "Watching"

- **[F-06] Viewer Count Display**
  แสดงจำนวน viewer ปัจจุบัน (จาก `ViewerUpdateEvent`)

### P2 — Nice to Have

- **[F-07] TTS Voice Selection**
  Dropdown เลือก voice จาก `speechSynthesis.getVoices()` ของ browser

- **[F-08] Sort Options**
  Sort by: เข้าล่าสุด, ชื่อ A-Z, Active first

- **[F-09] Viewer History Export**
  Export รายชื่อ viewer เป็น .csv

- **[F-10] Comment Feed**
  แสดง comment stream แยกต่างหาก

---

## 6. Data Models

### Backend (Python / in-memory)

```python
class ViewerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class Viewer(BaseModel):
    unique_id: str          # TikTok @username (primary key)
    nickname: str           # Display name
    avatar_url: str | None  # Profile picture URL
    joined_at: datetime     # เวลาที่เข้า Live ครั้งแรก
    last_seen_at: datetime  # เวลาที่มี event ล่าสุด
    status: ViewerStatus    # ACTIVE | INACTIVE
    event_count: int        # จำนวน event ที่เกิดจาก user นี้ (join/comment/like)
```

### Frontend (TypeScript)

```typescript
type ViewerStatus = "active" | "inactive";

interface Viewer {
  unique_id: string;
  nickname: string;
  avatar_url: string | null;
  joined_at: string;       // ISO datetime
  last_seen_at: string;    // ISO datetime
  status: ViewerStatus;
  event_count: number;
}

interface LiveSession {
  host_username: string;
  is_connected: boolean;
  viewer_count: number;
  viewers: Viewer[];
  started_at: string | null;
}
```

### WebSocket Message Format

```typescript
// Backend → Frontend
type WSMessage =
  | { type: "viewer_join";    data: Viewer }
  | { type: "viewer_update";  data: Viewer }
  | { type: "viewer_count";   data: { count: number } }
  | { type: "session_status"; data: { connected: boolean; host: string } }
  | { type: "error";          data: { message: string } };
```

---

## 7. API Endpoints

### REST API (FastAPI)

| Method | Path | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/session/start` | เริ่มเชื่อมต่อ TikTok Live | `{ "username": "@host" }` | `{ "status": "connecting" }` |
| `POST` | `/api/session/stop` | หยุดการเชื่อมต่อ | — | `{ "status": "disconnected" }` |
| `GET` | `/api/session/status` | ดูสถานะ session ปัจจุบัน | — | `SessionStatus` |
| `GET` | `/api/viewers` | ดึง viewer list ทั้งหมด | — | `Viewer[]` |
| `GET` | `/api/viewers/{unique_id}` | ดูข้อมูล viewer คนเดียว | — | `Viewer` |

### WebSocket

| Path | Description |
|---|---|
| `WS /ws` | Real-time event stream (viewer join, update, viewer count) |

---

## 8. Frontend Pages & Components

```
pages/
  /               → Main app (viewer list + connect form)

components/
  ConnectForm     → กรอก @username + ปุ่ม Connect/Disconnect
  SessionStatus   → แสดงสถานะ Connected | Disconnected | Connecting
  ViewerCount     → แสดงจำนวน viewer
  SearchBar       → ช่องค้นหา viewer
  ViewerList      → รายการ ViewerCard ทั้งหมด
  ViewerCard      → แสดงข้อมูล viewer 1 คน + ปุ่ม TTS

hooks/
  useTTS          → Web Speech API wrapper (speak(text), voices, selectedVoice)
  useWebSocket    → WebSocket connection + message handler
  useViewerStore  → State management สำหรับ viewer list
```

---

## 9. TTS Behavior

```
เมื่อกดปุ่ม 🔊 บน ViewerCard:
1. เรียก window.speechSynthesis.speak()
2. อ่าน unique_id (เช่น "john_doe_99" อ่านว่า "john doe 99")
3. ถ้ากำลังอ่านอยู่แล้ว → cancel แล้วอ่านใหม่
4. Voice: EN-US (default), เลือกได้ใน Settings (P2)

ข้อควรระวัง:
- Browser ต้อง support Web Speech API (Chrome/Edge รองรับดี, Firefox limited)
- บางอุปกรณ์ต้องการ user interaction ก่อนถึงจะเล่น audio ได้
```

---

## 10. Inactive Detection Logic

```python
INACTIVE_THRESHOLD_MINUTES = 5

async def check_inactive_viewers():
    """รัน background task ทุก 60 วินาที"""
    now = datetime.utcnow()
    for viewer in viewer_store.values():
        elapsed = (now - viewer.last_seen_at).total_seconds() / 60
        if elapsed > INACTIVE_THRESHOLD_MINUTES:
            viewer.status = ViewerStatus.INACTIVE
            await broadcast_ws({"type": "viewer_update", "data": viewer})
```

---

## 11. Out of Scope (v1.0)

- Authentication / login system
- Multi-host / multi-session support (1 session ต่อครั้ง)
- Paid TTS (AWS Polly, Google TTS, ElevenLabs)
- Storing data in database (ใช้ in-memory เท่านั้น)
- Moderation features (ban, mute viewer)
- Mobile app
- Gift / like analytics dashboard
- Scheduled auto-start
- TikTok official API (ใช้ unofficial library)
- Deployment / production infrastructure

---

## 12. Known Risks & Limitations

| Risk | Impact | Mitigation |
|---|---|---|
| TikTokLive library อาจ break เมื่อ TikTok เปลี่ยน API | High | Pin version, monitor GitHub issues |
| ไม่มี LeaveEvent → ไม่รู้ว่าใครออกชัดเจน | Medium | ใช้ inactivity timeout แทน |
| Web Speech API ไม่รองรับทุก browser | Low | แสดง warning ถ้า browser ไม่รองรับ |
| Rate limiting จาก TikTok | Medium | reconnect logic + exponential backoff |
| CORS / network issues ใน local dev | Low | ตั้งค่า FastAPI CORS ให้ถูกต้อง |
