export const SMART_MIRROR_INTENTS = [
  {
    intent: 'TURN_ON_SCREEN',
    description:
      'Turn on the smart mirror screen',
    examples: [
      'شغل المرآة',
      'افتح الشاشة',
      'شغل الشاشة',
    ],
  },

  {
    intent: 'TURN_OFF_SCREEN',
    description:
      'Turn off the smart mirror screen',
    examples: [
      'اطفئ المرآة',
      'اغلق الشاشة',
      'اطفي الشاشة',
    ],
  },

  {
    intent: 'ANALYZE_SKIN',
    description:
      'Analyze the user skin using camera',
    examples: [
      'حلل بشرتي',
      'افحص وجهي',
      'افتح تحليل البشرة',
    ],
  },

  {
    intent: 'GET_TIME',
    description: 'Get current time',
    examples: [
      'كم الساعة',
      'ما الوقت',
      'اعطني الوقت',
    ],
  },
] as const