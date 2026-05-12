# تشغيل المشروع

## البدء السريع

### المتطلبات
- Node.js v18+
- npm أو yarn

### التثبيت

```bash
# تثبيت dependencies السيرفر
cd server
npm install

# تثبيت dependencies العميل
cd ../client
npm install
```

### التشغيل في Development

افتح جهازي طرفية (Terminal):

#### الطرفية الأولى - السيرفر
```bash
cd server
npm run dev
```

يجب أن تشاهد:
```
Server running on http://localhost:3000
```

#### الطرفية الثانية - العميل
```bash
cd client
npm run dev
```

يجب أن تشاهد:
```
  VITE v8.0.12  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### الوصول إلى التطبيق

افتح متصفحك على: **http://localhost:5173**

## كيفية الاستخدام

1. **تأكد من الاتصال**: يجب أن ترى مؤشر "Connected" أخضر
2. **ابدأ التسجيل**: اضغط على "Start Recording" - سيطلب منك إذن الوصول للميكروفون
3. **تحدث**: تحدث إلى الميكروفون
4. **انتظر النتائج**: 
   - ستشاهد الـ Transcript (النص المستخلص من الصوت)
   - ثم AI Response (الرد من الخادم)
5. **أوقف التسجيل**: اضغط على "Stop Recording"

## بنية المشروع

```
smart-mirror/
├── server/                     # الخادم
│   ├── src/
│   │   ├── index.ts           # نقطة الدخول (Socket.IO Server)
│   │   ├── sockets/
│   │   │   └── voice.socket.ts # معالج أحداث الصوت
│   │   ├── services/
│   │   │   ├── genai.service.ts    # خدمة Gemini AI
│   │   │   └── whisper.service.ts  # خدمة تحويل الصوت للنص
│   │   └── intents/
│   │       └── intent.schema.ts    # الـ Schemas
│   ├── package.json
│   └── tsconfig.json
│
└── client/                     # العميل
    ├── src/
    │   ├── App.tsx            # المكون الرئيسي
    │   ├── socket.ts          # اتصال Socket.IO
    │   ├── hooks/
    │   │   └── useRealtimeMic.ts  # Hook لمعالجة الميكروفون
    │   ├── main.tsx           # entry point
    │   └── index.css          # Tailwind CSS
    ├── package.json
    └── vite.config.ts
```

## تدفق الاتصال

```
[العميل]                    [السيرفر]
  |                            |
  +-- audio-chunk (Socket) --> |
  |                         [Buffer جمع الصوت]
  |                            |
  |                      [كل 4 ثوانٍ]
  |                            |
  |                   [تحويل الصوت -> نص]
  |                            |
  | <-- transcript (Socket) ---+
  |                            |
  |                   [تحليل النص بـ Gemini]
  |                            |
  | <-- ai-response (Socket) --+
  |                            |
```

## الأحداث (Events)

### من العميل إلى السيرفر
- `audio-chunk` - بيانات الصوت (ArrayBuffer)

### من السيرفر إلى العميل
- `transcript` - النص المستخلص من الصوت
  ```javascript
  { text: "مرحبًا" }
  ```
- `ai-response` - الرد من AI
  ```javascript
  { intent: "mirror.turn_on", reply: "سأشغل المرآة الآن" }
  ```
- `error` - رسالة خطأ
  ```javascript
  { message: "حدث خطأ في معالجة الصوت" }
  ```

## استكشاف الأخطاء

### العميل لا يتصل بالسيرفر
- تأكد من تشغيل السيرفر على المنفذ 3000
- تحقق من browser console (F12) للأخطاء
- تأكد من أن `.env` يحتوي على `VITE_SERVER_URL=http://localhost:3000`

### لا يعمل الميكروفون
- تحقق من أن المتصفح منح إذن الوصول للميكروفون
- جرب متصفح آخر إن كانت هناك مشاكل

### الصوت لا يصل للسيرفر
- افتح Server Console وابحث عن رسائل الخطأ
- تأكد من أن Socket.IO متصل (يجب أن ترى "client connected")

## البناء للإنتاج

```bash
# بناء السيرفر
cd server
npm run build

# بناء العميل
cd client
npm run build
```

## ملاحظات
- السيرفر يستخدم Gemini API (احتاج GEMINI_API_KEY في `.env`)
- Whisper Service حالياً يعطي نص وهمي للاختبار
- يمكن استبداله بـ whisper.cpp أو API اسمع
