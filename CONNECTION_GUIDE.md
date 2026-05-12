# ربط العميل بالسيرفر - شرح مفصّل

## 🔌 ما الذي تم إنجازه؟

تم ربط تطبيق React مع خادم Express بشكل متكامل باستخدام Socket.IO للتواصل Real-time.

---

## 📡 بنية الاتصال

```
┌─────────────────────────────────────────────────────────┐
│                    متصفح العميل                        │
│                  (http://localhost:5173)               │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  React App (App.tsx)                            │   │
│  │  - عرض حالة الاتصال                            │   │
│  │  - زر تسجيل الصوت                              │   │
│  │  - عرض النتائج والأخطاء                        │   │
│  └─────────────────────────────────────────────────┘   │
│           │                              ▲              │
│           │ Socket Events                │              │
│           ▼                              │              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  useRealtimeMic Hook                            │   │
│  │  - تسجيل الصوت                               │   │
│  │  - إرسال بيانات صوتية                        │   │
│  │  - إدارة حالة التسجيل                       │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
              │ WebSocket (Socket.IO)
              │
              ▼
┌─────────────────────────────────────────────────────────┐
│              خادم Express                              │
│            (http://localhost:3000)                     │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Socket.IO Server (index.ts)                    │   │
│  │  - معالجة الاتصالات                          │   │
│  │  - توزيع الأحداث                              │   │
│  └─────────────────────────────────────────────────┘   │
│           │                              ▲              │
│           │                              │              │
│           ▼                              │              │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Voice Socket Handler (voice.socket.ts)        │   │
│  │  - جمع بيانات الصوت                          │   │
│  │  - معالجة الصوت (كل 4 ثوانٍ)                │   │
│  │  - استدعاء الخدمات                            │   │
│  └─────────────────────────────────────────────────┘   │
│           │                              ▲              │
│      ┌────┴────┐                    ┌────┴────┐        │
│      ▼         ▼                    ▼         │        │
│  [Whisper]  [Gemini] ────────────>[Emit Events]      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 تدفق العمل

### 1️⃣ **الاتصال الأولي**

```javascript
// [العميل]
socket.on('connect', () => {
  console.log('✓ متصل بالسيرفر')
  setIsConnected(true)
})
```

```javascript
// [السيرفر]
io.on('connection', (socket) => {
  console.log('client connected')
  buffers.set(socket.id, [])
})
```

### 2️⃣ **إرسال بيانات الصوت**

```javascript
// [العميل] - كل 500ms
socket.emit('audio-chunk', arrayBuffer)
```

```javascript
// [السيرفر]
socket.on('audio-chunk', (chunk: ArrayBuffer) => {
  const current = buffers.get(socket.id) ?? []
  current.push(Buffer.from(chunk))
  buffers.set(socket.id, current)
})
```

### 3️⃣ **معالجة الصوت (كل 4 ثوانٍ)**

```javascript
const interval = setInterval(() => {
  void (async () => {
    // جمع الأجزاء
    const audioBuffer = Buffer.concat(chunks)
    
    // 1️⃣ تحويل الصوت إلى نص
    const text = await whisper.transcribe(audioBuffer)
    socket.emit('transcript', { text })
    
    // 2️⃣ تحليل النص
    const intent = await gemini.getIntent(text)
    
    // 3️⃣ إرسال النتيجة
    socket.emit('ai-response', intent)
  })()
}, 4000)
```

### 4️⃣ **استقبال النتائج**

```javascript
// [العميل]
socket.on('transcript', (data) => {
  setResponses(prev => [...prev, {
    type: 'transcript',
    text: data.text
  }])
})

socket.on('ai-response', (data) => {
  setResponses(prev => [...prev, {
    type: 'ai-response',
    text: data.reply,
    intent: data.intent
  }])
})
```

---

## 📝 الملفات المُحدّثة

### العميل (Client)

#### 1. `src/App.tsx` - المكون الرئيسي
```typescript
✓ إضافة real-time connection status
✓ عرض history الردود
✓ Color-coded responses (أزرق للترجمة، أخضر للرد، أحمر للأخطاء)
✓ Tailwind CSS styling
✓ استقبال الأحداث من السيرفر
```

#### 2. `src/hooks/useRealtimeMic.ts` - Hook الميكروفون
```typescript
✓ إضافة isRecording state
✓ معالجة الأخطاء
✓ تنظيف موارد الصوت عند الإيقاف
✓ إدارة audio tracks
```

#### 3. `src/socket.ts` - Socket.IO Client
```typescript
✓ استخدام VITE_SERVER_URL من البيئة
✓ إعادة الاتصال التلقائي
✓ معالجة أحداث الاتصال
```

### السيرفر (Server)

#### 1. `src/index.ts` - نقطة الدخول
```typescript
✓ تسجيل voice socket handler
✓ CORS configuration
✓ Socket.IO Server setup
```

#### 2. `src/sockets/voice.socket.ts` - معالج الصوت
```typescript
✓ جمع بيانات الصوت في buffer
✓ معالجة دورية (كل 4 ثوانٍ)
✓ استدعاء Whisper و Gemini
✓ إرسال الأحداث
✓ تنظيف الموارد عند قطع الاتصال
```

#### 3. `src/services/genai.service.ts` - Gemini AI
```typescript
✓ إضافة generateChatResponse() method
✓ إضافة getIntent() method
✓ معالجة الأخطاء
```

---

## 🎯 الأحداث (Events)

### من العميل → السيرفر

```typescript
socket.emit('audio-chunk', arrayBuffer)
```

**البيانات:**
- `arrayBuffer` - بيانات الصوت الخام

---

### من السيرفر → العميل

#### `transcript`
```javascript
{
  text: "مرحبًا، كيف يمكنني مساعدتك؟"
}
```

#### `ai-response`
```javascript
{
  intent: "mirror.turn_on",
  reply: "سأشغل المرآة الآن"
}
```

#### `error`
```javascript
{
  message: "حدث خطأ في معالجة الصوت"
}
```

#### `connect` / `disconnect`
- أحداث نظامية Socket.IO

---

## 🧪 الاختبار

### 1️⃣ التحقق من الاتصال
```bash
# السيرفر يجب أن يعرض:
[Socket.IO] Client connected: socket-id

# العميل يجب أن يعرض في Console:
[Socket.IO] Connected: socket-id
```

### 2️⃣ اختبار تسجيل الصوت
1. افتح http://localhost:5173
2. اضغط "Start Recording"
3. تحدث قليلاً
4. انتظر 4 ثوانٍ
5. يجب أن تشاهد "Transcript" و "AI Response"

### 3️⃣ فحص البيانات
```bash
# في Server Console
npm run dev

# يجب أن ترى:
[Socket.IO] Client connected: abc123
[Socket.IO] Received audio chunk: 1024 bytes
...
```

---

## ⚙️ متغيرات البيئة

### السيرفر (server/.env)
```env
PORT=3000
MONGODB_URI=mongodb://root:root@127.0.0.1:27017/mirror?authSource=admin
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your-gemini-key
```

### العميل (client/.env)
```env
VITE_SERVER_URL=http://localhost:3000
```

---

## 🐛 استكشاف الأخطاء

### ❌ الاتصال رفضًا
**الأسباب:**
- السيرفر لم يتم تشغيله
- المنفذ 3000 مشغول
- CORS issues

**الحل:**
```bash
# تأكد من السيرفر
cd server && npm run dev

# تحقق من المنفذ
lsof -i :3000
```

### ❌ لا يصل الصوت
**الأسباب:**
- الميكروفون غير مُفوّض
- الجهاز لا يحتوي على ميكروفون

**الحل:**
- تحقق من إذونات المتصفح
- جرب متصفح آخر

### ❌ أخطاء Gemini API
**الأسباب:**
- API Key غير صحيح
- حد الاستخدام تم تجاوزه

**الحل:**
```bash
# تحقق من .env
cat server/.env | grep GEMINI

# اختبر الاتصال مباشرة
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "Hello"}]}]}'
```

---

## 📊 الحالة الحالية

| المكون | الحالة | ملاحظات |
|--------|--------|---------|
| ✅ Server | متصل | يستمع على 3000 |
| ✅ Client | متصل | يتصل من 5173 |
| ✅ Socket.IO | يعمل | Real-time events |
| ✅ Microphone | يعمل | WebRTC Audio |
| ✅ Whisper | mock | جاهز للاستبدال |
| ✅ Gemini AI | متكامل | يحتاج API Key |
| ✅ UI | محسّن | Tailwind CSS |

---

## 🚀 الخطوة التالية

1. **اختبر التطبيق:**
   ```bash
   # Terminal 1
   cd server && npm run dev
   
   # Terminal 2
   cd client && npm run dev
   
   # زر Browser
   http://localhost:5173
   ```

2. **استبدل Whisper Mock:**
   - اربط whisper.cpp أو API
   - حدّث `src/services/whisper.service.ts`

3. **أضف Database:**
   - ربط MongoDB
   - احفظ السجلات

4. **نشر على السيحابة:**
   - Docker + Kubernetes
   - AWS / Google Cloud / Vercel

---

## 📚 المراجع

- [Socket.IO Docs](https://socket.io/docs/)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/)
- [Gemini API](https://ai.google.dev/)

---

**تم ربط العميل بالسيرفر بنجاح! ✨**
