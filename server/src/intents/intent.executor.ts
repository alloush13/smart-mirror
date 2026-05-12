export async function executeIntent(
  intent: string,
): Promise<void> {
  switch (intent) {
    case 'TURN_ON_SCREEN':
      console.log(
        '🪞 Turning screen ON',
      )

      break

    case 'TURN_OFF_SCREEN':
      console.log(
        '🌑 Turning screen OFF',
      )

      break

    case 'GET_TIME':
      console.log(
        '🕒 Getting current time',
      )

      break

    case 'ANALYZE_SKIN':
      console.log(
        '📸 Opening skin analyzer',
      )

      break

    default:
      console.log(
        '❓ Unknown intent',
      )
  }
}