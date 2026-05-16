interface SidebarProps {
  isActive?: boolean
  isListening?: boolean
  isSpeaking?: boolean
  turnOn?: () => void
  turnOff?: () => void
  toggleMirror?: () => void
  toggleListening?: () => void
  onAnalyzeSkin?: () => void
  isAnalyzingSkin?: boolean
  skinResultCount?: number
  skinAnalysisError?: string | null
  onClearSkinResult?: () => void
}

export default function Sidebar({
  isActive,
  isListening,
  isSpeaking,
  turnOn,
  turnOff,
  toggleMirror,
  toggleListening,
  onAnalyzeSkin,
  isAnalyzingSkin,
  skinResultCount,
  skinAnalysisError,
  onClearSkinResult,
}: SidebarProps) {
  return (
    <aside className="fixed left-4 top-6 z-40 w-72 rounded-lg bg-black/60 p-4 backdrop-blur-sm text-white">
      <h3 className="mb-3 text-sm font-semibold">
        تحكم بالمرآة
      </h3>

      <div className="flex flex-col gap-2">
        <button
          className="rounded-md bg-green-600 px-3 py-2 text-sm font-medium hover:opacity-90"
          onClick={turnOn}
        >
          تشغيل المرآة
        </button>

        <button
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium hover:opacity-90"
          onClick={turnOff}
        >
          إيقاف المرآة
        </button>

        <button
          className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium hover:opacity-90"
          onClick={toggleMirror}
        >
          تبديل الحالة
        </button>

        <button
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium hover:opacity-90"
          onClick={toggleListening}
        >
          {isListening ? 'إيقاف الاستماع' : 'بدء الاستماع'}
        </button>

        <button
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onAnalyzeSkin}
          disabled={isAnalyzingSkin}
        >
          {isAnalyzingSkin ? 'جاري تحليل البشرة...' : 'تحليل البشرة'}
        </button>

        {(skinResultCount !== undefined || skinAnalysisError) && (
          <div className="mt-2 rounded-md border border-white/10 bg-white/5 p-3 text-sm">
            {skinAnalysisError ? (
              <div className="text-red-300">
                {skinAnalysisError}
              </div>
            ) : (
              <div className="text-gray-200">
                عدد النتائج: {skinResultCount ?? 0}
              </div>
            )}

            {(skinResultCount ?? 0) > 0 && onClearSkinResult && (
              <button
                onClick={onClearSkinResult}
                className="mt-2 text-xs text-gray-300 underline"
              >
                مسح النتيجة
              </button>
            )}
          </div>
        )}

        <div className="mt-3 text-xs text-gray-300">
          الحالة: {isActive ? 'مشتغلة' : 'مطفأة'} • {isSpeaking ? 'تتكلم' : 'صامتة'}
        </div>
      </div>
    </aside>
  )
}
