export function pickPreferredChineseVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) {
    return undefined
  }

  const normalize = (lang: string) => lang.toLowerCase().replace(/_/g, '-')

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

function speakWithPreferredVoice(
  synth: SpeechSynthesis,
  text: string,
  voices: SpeechSynthesisVoice[],
): void {
  const utterance = new SpeechSynthesisUtterance(text)
  const selectedVoice = pickPreferredChineseVoice(voices)

  utterance.lang = selectedVoice?.lang ?? 'zh-TW'
  if (selectedVoice) {
    utterance.voice = selectedVoice
  }

  synth.cancel()
  synth.speak(utterance)
}

export function speakChinese(text: string): boolean {
  if (!canSpeakInBrowser() || text.trim() === '') {
    return false
  }

  const synth = window.speechSynthesis
  const voices = synth.getVoices()
  if (voices.length > 0) {
    speakWithPreferredVoice(synth, text, voices)
    return true
  }

  let spoken = false
  const speakOnce = () => {
    if (spoken) {
      return
    }

    spoken = true
    speakWithPreferredVoice(synth, text, synth.getVoices())
  }

  const removeListener = () => {
    synth.removeEventListener?.('voiceschanged', speakOnce)
  }

  synth.addEventListener?.('voiceschanged', speakOnce, { once: true })
  window.setTimeout(() => {
    if (!spoken) {
      removeListener()
      speakOnce()
    }
  }, 250)

  return true
}
