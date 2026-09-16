export type SpeechVoiceDiagnostic = {
  name: string
  lang: string
  default: boolean
  localService: boolean
}

export type SpeechResultStatus =
  | 'started'
  | 'unsupported'
  | 'voices_not_loaded'
  | 'no_matching_voice'
  | 'error'

export type SpeechResult = {
  status: SpeechResultStatus
  message: string
  error?: string
}

function normalizeLang(lang: string): string {
  return lang.toLowerCase().replace(/_/g, '-')
}

function hasTaiwanTag(lang: string): boolean {
  return normalizeLang(lang).includes('-tw')
}

function isTraditionalChineseTaiwan(lang: string): boolean {
  return hasTaiwanTag(lang) && (lang.includes('hant') || lang.startsWith('cmn-') || lang.startsWith('zh-'))
}

export function getSpeechVoiceDiagnostics(voices: SpeechSynthesisVoice[]): SpeechVoiceDiagnostic[] {
  return voices.map((voice) => ({
    name: voice.name,
    lang: voice.lang,
    default: voice.default,
    localService: voice.localService,
  }))
}

export function logSpeechVoiceDiagnostics(voices: SpeechSynthesisVoice[]): void {
  const diagnostics = getSpeechVoiceDiagnostics(voices)
  console.debug('[speech] available voices', diagnostics)
}

export function pickPreferredChineseVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) {
    return undefined
  }

  return (
    voices.find((voice) => normalizeLang(voice.lang) === 'zh-tw') ??
    voices.find((voice) => normalizeLang(voice.lang) === 'cmn-tw') ??
    voices.find((voice) => isTraditionalChineseTaiwan(normalizeLang(voice.lang))) ??
    voices.find((voice) => normalizeLang(voice.lang).startsWith('zh-'))
  )
}

export function canSpeakInBrowser(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function createResult(status: SpeechResultStatus, message: string, error?: string): SpeechResult {
  return { status, message, error }
}

function waitForVoicesToLoad(synth: SpeechSynthesis, timeoutMs = 5000): Promise<SpeechSynthesisVoice[]> {
  const initialVoices = synth.getVoices()
  if (initialVoices.length > 0) {
    return Promise.resolve(initialVoices)
  }

  return new Promise((resolve) => {
    let finished = false

    const finish = (voices: SpeechSynthesisVoice[]) => {
      if (finished) {
        return
      }

      finished = true
      synth.removeEventListener?.('voiceschanged', handleVoicesChanged)
      window.clearInterval(pollInterval)
      window.clearTimeout(timeout)
      resolve(voices)
    }

    const handleVoicesChanged = () => {
      const updatedVoices = synth.getVoices()
      if (updatedVoices.length > 0) {
        finish(updatedVoices)
      }
    }

    const pollInterval = window.setInterval(() => {
      const updatedVoices = synth.getVoices()
      if (updatedVoices.length > 0) {
        finish(updatedVoices)
      }
    }, 250)

    const timeout = window.setTimeout(() => {
      finish(synth.getVoices())
    }, timeoutMs)

    synth.addEventListener?.('voiceschanged', handleVoicesChanged)
  })
}

export async function speakChinese(text: string): Promise<SpeechResult> {
  if (!canSpeakInBrowser()) {
    return createResult('unsupported', 'Speech synthesis is not supported in this browser.')
  }

  if (text.trim() === '') {
    return createResult('error', 'Cannot speak empty text.')
  }

  const synth = window.speechSynthesis
  const voices = await waitForVoicesToLoad(synth)

  if (voices.length === 0) {
    return createResult(
      'voices_not_loaded',
      'Speech voices are not available yet. Try tapping Speak again after voices load.',
    )
  }

  const selectedVoice = pickPreferredChineseVoice(voices)
  if (!selectedVoice) {
    logSpeechVoiceDiagnostics(voices)
    return createResult('no_matching_voice', 'No Chinese speech voice is available on this device.')
  }

  return new Promise((resolve) => {
    let started = false
    const utterance = new SpeechSynthesisUtterance(text)

    utterance.voice = selectedVoice
    utterance.lang = selectedVoice.lang

    const startTimeout = window.setTimeout(() => {
      if (!started) {
        resolve(createResult('error', 'Speech did not start in time.', 'start_timeout'))
      }
    }, 5000)

    utterance.onstart = () => {
      started = true
      window.clearTimeout(startTimeout)
      resolve(createResult('started', `Speaking with ${selectedVoice.name} (${selectedVoice.lang}).`))
    }

    utterance.onend = () => {
      window.clearTimeout(startTimeout)
      if (!started) {
        resolve(createResult('error', 'Speech ended before playback started.', 'ended_before_start'))
      }
    }

    utterance.onerror = (event) => {
      window.clearTimeout(startTimeout)
      resolve(createResult('error', `Speech synthesis failed: ${event.error}.`, event.error))
    }

    synth.cancel()
    synth.speak(utterance)
  })
}
