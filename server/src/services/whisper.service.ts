export class WhisperService {
  async transcribe(audio: Buffer) {
    // MVP: placeholder local or API-based whisper
    // لاحقًا يمكن استبداله بـ whisper.cpp أو cloud STT

    const text = await fakeTranscription(audio);

    return text;
  }
}

// TEMP MOCK (استبدله لاحقًا بـ whisper.cpp أو API)
async function fakeTranscription(_: Buffer): Promise<string> {
  console.log(_);
  return await Promise.resolve('مرحبًا، كيف يمكنني مساعدتك؟');
}
