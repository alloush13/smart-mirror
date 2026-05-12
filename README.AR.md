# المرآة الذكية - Smart Mirror

تطبيق مرآة ذكية يستخدم Voice AI لمعالجة الأوامر الصوتية.

## المميزات

✅ **التعرف على الصوت** - تحويل الكلام إلى نص  
✅ **معالجة AI** - فهم الأوامر والرد عليها  
✅ **اتصال Real-time** - Socket.IO للتواصل الفوري  
✅ **واجهة سهلة** - React مع Tailwind CSS  
✅ **دعم العربية** - دعم كامل للغة العربية  

## البنية المعمارية

```
┌─────────────────────────────────────────┐
│         المتصفح (React Client)         │
│  - UI للتحكم والعرض                    │
│  - Socket.IO للاتصال                  │
└────────────────┬────────────────────────┘
                 │ WebSocket
                 │
┌────────────────▼────────────────────────┐
│         الخادم (Express + Node)        │
│  - Socket.IO Server                    │
│  - معالجة الصوت                        │
│  - تكامل Gemini AI                     │
└─────────────────────────────────────────┘
```

## المتطلبات

- Node.js v18+
- npm أو yarn
- Gemini API Key (من Google)

## التثبيت السريع

```bash
# 1. استنساخ المشروع
git clone <repo-url>
cd smart-mirror

# 2. تثبيت السيرفر
cd server
npm install
cd ..

# 3. تثبيت العميل
cd client
npm install
cd ..
```

## التشغيل

### الطريقة الأولى: طرفيات منفصلة

**الطرفية الأولى - السيرفر:**
```bash
cd server
npm run dev
```

**الطرفية الثانية - العميل:**
```bash
cd client
npm run dev
```

ثم افتح متصفحك على: http://localhost:5173

### الطريقة الثانية: أتمتة (tmux مطلوب)

```bash
chmod +x start.sh
./start.sh
```

## المتغيرات البيئية

### السيرفر (server/.env)
```env
PORT=3000
MONGODB_URI=mongodb://root:root@127.0.0.1:27017/mirror?authSource=admin
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=replace-with-a-strong-secret
GEMINI_API_KEY=your-gemini-api-key
```

### العميل (client/.env)
```env
VITE_SERVER_URL=http://localhost:3000
```

## الاستخدام

1. **قدّم الإذن** للوصول للميكروفون
2. **ابدأ التسجيل** بالضغط على زر "Start Recording"
3. **تحدث** إلى الميكروفون
4. **انتظر النتائج**:
   - الـ transcript (النص المستخلص)
   - رد AI
5. **أوقف التسجيل** بالضغط على "Stop Recording"

## العمليات المُدعومة

```typescript
type Intent = 
  | 'mirror.turn_on'      // تشغيل المرآة
  | 'mirror.turn_off'     // إغلاق المرآة
  | 'skin.analyze'        // تحليل البشرة
  | 'weather.show'        // عرض الطقس
  | 'unknown';            // أمر غير معروف
```

## البنية الملفية

```
smart-mirror/
├── server/
│   ├── src/
│   │   ├── index.ts                    # نقطة الدخول
│   │   ├── sockets/
│   │   │   └── voice.socket.ts        # معالجات الصوت
│   │   ├── services/
│   │   │   ├── genai.service.ts       # Gemini AI
│   │   │   ├── whisper.service.ts     # تحويل الصوت
│   │   │   └── genai.intent.ts        # معالجة الأوامر
│   │   └── intents/
│   │       └── intent.schema.ts       # Zod schemas
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── App.tsx                    # الصفحة الرئيسية
│   │   ├── socket.ts                  # اتصال Socket.IO
│   │   ├── hooks/
│   │   │   └── useRealtimeMic.ts     # hook الميكروفون
│   │   ├── main.tsx                   # entry point
│   │   └── index.css                  # Tailwind
│   ├── package.json
│   └── vite.config.ts
│
├── RUN.md                             # تعليمات التشغيل
├── SETUP.md                           # إعداد المشروع
├── start.sh                           # script التشغيل
└── README.AR.md                       # هذا الملف
```

## تدفق البيانات

```
[العميل]
   │
   ├─ يطلب وصول الميكروفون
   │
   ├─ يبدأ التسجيل
   │
   └─ يرسل أجزاء الصوت (كل 500ms)
        │
        ▼ Socket.IO: "audio-chunk"
    [السيرفر]
        │
        ├─ يجمع أجزاء الصوت
        │
        ├─ كل 4 ثوانٍ:
        │  ├─ يحول الصوت إلى نص (Whisper)
        │  ├─ يحلل النص (Gemini AI)
        │  └─ يحدد قصد المستخدم
        │
        └─ يرسل النتائج
        │
        ▼ Socket.IO: "transcript"
        ▼ Socket.IO: "ai-response"
    [العميل]
        │
        └─ يعرض النتائج في الواجهة
```

## الأحداث (Socket Events)

### من العميل → السيرفر
| الحدث | البيانات | الوصف |
|------|---------|-------|
| `audio-chunk` | `ArrayBuffer` | بيانات الصوت |

### من السيرفر → العميل
| الحدث | البيانات | الوصف |
|------|---------|-------|
| `transcript` | `{ text: string }` | النص المستخلص من الصوت |
| `ai-response` | `{ intent: string, reply: string }` | رد الذكاء الاصطناعي |
| `error` | `{ message: string }` | رسالة الخطأ |

## استكشاف الأخطاء

### ❌ العميل لا يتصل بالسيرفر

**الأسباب المحتملة:**
- السيرفر لم يتم تشغيله
- المنفذ 3000 مشغول
- مشاكل CORS

**الحل:**
```bash
# تأكد من السيرفر
cd server && npm run dev

# في terminal آخر، تحقق
lsof -i :3000
```

### ❌ الميكروفون لا يعمل

**الأسباب المحتملة:**
- المتصفح لم يُعطَ إذن الوصول
- الجهاز ليس له ميكروفون
- مشاكل في المتصفح

**الحل:**
- امسح إذونات المتصفح وأعد المحاولة
- جرب متصفح آخر
- تحقق من أن الميكروفون يعمل

### ❌ خطأ في معالجة الصوت

**الحل:**
افتح console السيرفر وابحث عن رسائل الخطأ:
```bash
cd server && npm run dev
```

## الملاحظات الهامة

- ⚠️ **Whisper Service**: حالياً تُرجع نص وهمي - استبدلها بـ API حقيقي
- ⚠️ **API Key**: لا تنشر GEMINI_API_KEY في الـ Git
- ⚠️ **CORS**: في الإنتاج، غيّر `origin: '*'` إلى قائمة محددة
- ⚠️ **SSL**: استخدم HTTPS في الإنتاج

## الخطوات القادمة

- [ ] دعم Whisper.cpp المحلي
- [ ] إضافة قاعدة بيانات MongoDB
- [ ] نظام المصادقة (JWT)
- [ ] لوحة تحكم المسؤول
- [ ] نشر على الإنتاج

## الترخيص

ISC

## المدعومة

📧 البريد، 🐛 الأخطاء، ⭐ النجوم في GitHub

---

صُنع بـ ❤️ باستخدام TypeScript, React, Express, Socket.IO
