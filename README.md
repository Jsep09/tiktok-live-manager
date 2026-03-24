# TikTok Live Viewer Manager

ช่วย TikTok Live host อ่าน username ของ viewer ผ่าน TTS — กดปุ่มเดียว ได้ยินเสียงทันที

---

## Prerequisites

| Tool | Version | ติดตั้ง |
|---|---|---|
| Python | 3.11+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| npm / pnpm | latest | มากับ Node.js |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## Project Structure

```
tiktok-live-manager/
├── backend/
│   ├── main.py              # FastAPI app + WebSocket endpoint
│   ├── tiktok_client.py     # TikTokLive event handlers
│   ├── models.py            # Pydantic data models
│   ├── viewer_store.py      # In-memory viewer state
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main page
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── ConnectForm.tsx   # ฟอร์มกรอก @username
│   │   ├── ViewerList.tsx    # รายการ viewer
│   │   ├── ViewerCard.tsx    # viewer card + TTS button
│   │   └── SearchBar.tsx     # ช่องค้นหา
│   ├── hooks/
│   │   ├── useTTS.ts         # Web Speech API hook
│   │   └── useWebSocket.ts   # WebSocket connection hook
│   ├── lib/
│   │   └── types.ts          # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
├── SPEC.md                   # Full project specification
└── README.md                 # คู่มือนี้
```

---

## Setup — Backend

### 1. สร้าง virtual environment

```bash
cd tiktok-live-manager/backend

# สร้าง venv
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 2. ติดตั้ง dependencies

```bash
pip install -r requirements.txt
```

### 3. ตั้งค่า environment variables

```bash
cp .env.example .env
# แก้ไข .env ตามต้องการ (ถ้ามี)
```

### 4. รัน backend

```bash
uvicorn main:app --reload --port 8000
```

Backend จะเปิดที่ `http://localhost:8000`
API docs (Swagger UI) ที่ `http://localhost:8000/docs`

---

## Setup — Frontend

### 1. ติดตั้ง dependencies

```bash
cd tiktok-live-manager/frontend

npm install
# หรือถ้าใช้ pnpm
pnpm install
```

### 2. ตั้งค่า environment variables

```bash
cp .env.local.example .env.local
```

ไฟล์ `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### 3. รัน frontend

```bash
npm run dev
# หรือ
pnpm dev
```

Frontend จะเปิดที่ `http://localhost:3000`

---

## การใช้งาน

1. เปิด browser ไปที่ `http://localhost:3000`
2. กรอก TikTok username ของ host (เช่น `@myusername`) ในช่อง Connect
3. กด **Connect** — รอสักครู่จนสถานะเป็น "Connected"
4. Viewer ที่เข้า Live จะปรากฏในรายการแบบ real-time
5. กดปุ่ม 🔊 บน viewer card เพื่อฟังเสียงอ่าน username
6. ใช้ช่องค้นหาเพื่อกรอง viewer ตามชื่อ
7. กด **Disconnect** เมื่อต้องการหยุด

---

## Browser Compatibility (TTS)

Web Speech API รองรับ:
- ✅ Google Chrome (แนะนำ)
- ✅ Microsoft Edge
- ⚠️ Firefox (limited voices)
- ❌ Safari (บาง version)

**แนะนำให้ใช้ Chrome สำหรับ TTS ที่ดีที่สุด**

---

## Dependencies

### Backend (`requirements.txt`)

```
fastapi>=0.110.0
uvicorn[standard]>=0.29.0
tiktoklive>=6.0.0
pydantic>=2.0.0
python-dotenv>=1.0.0
websockets>=12.0
```

### Frontend (`package.json` key deps)

```json
{
  "next": "^14.0.0",
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.4.0"
}
```

---

## Development Notes

### Hot reload
- Backend: `--reload` flag บน uvicorn จะ reload อัตโนมัติเมื่อแก้ไข Python files
- Frontend: Next.js มี Fast Refresh built-in

### WebSocket testing
ทดสอบ WebSocket ด้วย:
```bash
# ติดตั้ง wscat
npm install -g wscat

# เชื่อมต่อ
wscat -c ws://localhost:8000/ws
```

### ทดสอบโดยไม่มี TikTok Live จริง
สร้าง mock events ใน backend สำหรับ development:
```bash
# ใน backend/main.py มี endpoint สำหรับ dev
POST http://localhost:8000/dev/mock-join
{"username": "test_user_123"}
```

---

## Troubleshooting

**Backend ไม่สามารถเชื่อมต่อ TikTok Live ได้**
- ตรวจสอบว่า host กำลัง Live จริงๆ อยู่
- ลอง username โดยไม่มี `@` (library handle เองได้)
- TikTokLive library อาจ outdated → รัน `pip install --upgrade tiktoklive`

**TTS ไม่มีเสียง**
- ตรวจสอบ volume ของ browser ไม่ได้ mute
- ลองกด interact กับ page ก่อน (click ที่ไหนก็ได้) แล้วกดปุ่ม TTS ใหม่
- ใช้ Chrome แทน Firefox/Safari

**CORS Error**
- ตรวจสอบว่า `NEXT_PUBLIC_API_URL` ใน `.env.local` ตรงกับ port ของ backend
- Backend ต้องอนุญาต origin `http://localhost:3000`

---

## Contributing

1. Fork this repo
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push: `git push origin feature/my-feature`
5. Open Pull Request

---

## License

MIT License — ใช้งานได้ฟรี ไม่ค้าขาย
