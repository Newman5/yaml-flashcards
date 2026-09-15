export function pickPreferredChineseVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) {
    return undefined
  }

  const normalize = (lang: string) => lang.toLowerCase().replace('_', '-')

  return (
    voices.find((voice) => normalize(voice.lang) === 'zh-tw') ??
    voices.find((voice) => normalize(voice.lang).startsWith('zh-tw')) ??
    voices.find((voice) => normalize(voice.lang).startsWith('zh-')) ??
    voices.find((voice) => normalize(voice.lang) === 'cmn-tw')
  )
}

export function canSpeakInBrowser(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function speakChinese(text: string): boolean {
  if (!canSpeakInBrowser() || text.trim() === '') {
    return false
  }

  const synth = window.speechSynthesis
  const utterance = new SpeechSynthesisUtterance(text)
  const voices = synth.getVoices()
  const selectedVoice = pickPreferredChineseVoice(voices)

  utterance.lang = selectedVoice?.lang ?? 'zh-TW'
  if (selectedVoice) {
    utterance.voice = selectedVoice
  }

  synth.cancel()
  synth.speak(utterance)
  return true
}
