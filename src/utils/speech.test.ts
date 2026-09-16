import { describe, expect, it, vi } from 'vitest'
import { pickPreferredChineseVoice, speakChinese } from './speech'

type MockUtterance = {
  text: string
  lang?: string
  voice?: SpeechSynthesisVoice
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
}

function voice(lang: string, name = `${lang}-voice`): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name,
    voiceURI: `${lang}-uri`,
  }
}

function installUtteranceMock() {
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    function MockSpeechSynthesisUtterance(this: MockUtterance, text: string) {
      this.text = text
      this.onstart = null
      this.onend = null
      this.onerror = null
    },
  )
}

describe('pickPreferredChineseVoice', () => {
  it('prefers zh-TW over other Chinese voices', () => {
    const selected = pickPreferredChineseVoice([voice('zh-CN'), voice('zh-TW')])
    expect(selected?.lang).toBe('zh-TW')
  })

  it('falls back to cmn-TW when zh-TW is unavailable', () => {
    const selected = pickPreferredChineseVoice([voice('zh-HK'), voice('cmn-TW')])
    expect(selected?.lang).toBe('cmn-TW')
  })

  it('falls back to other zh-* voice when Taiwan-specific voice is unavailable', () => {
    const selected = pickPreferredChineseVoice([voice('en-US'), voice('zh-HK')])
    expect(selected?.lang).toBe('zh-HK')
  })

  it('returns undefined when no Chinese voice is available', () => {
    const selected = pickPreferredChineseVoice([voice('en-US'), voice('fr-FR')])
    expect(selected).toBeUndefined()
  })
})

describe('speakChinese', () => {
  it('returns unsupported when speech synthesis is unavailable', async () => {
    const originalWindow = globalThis.window
    try {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: {},
      })

      const result = await speakChinese('蝦肉水餃')
      expect(result.status).toBe('unsupported')
    } finally {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      })
    }
  })

  it('returns no_matching_voice when only non-Chinese voices exist', async () => {
    installUtteranceMock()

    const synthMock = {
      getVoices: () => [voice('en-US')],
      speak: vi.fn(),
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as SpeechSynthesis

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: synthMock,
    })

    const result = await speakChinese('蝦肉水餃')
    expect(result.status).toBe('no_matching_voice')
  })

  it('returns started when synthesis starts successfully', async () => {
    installUtteranceMock()

    const speak = vi.fn((utterance: MockUtterance) => {
      utterance.onstart?.()
    })

    const synthMock = {
      getVoices: () => [voice('zh-TW', 'Taiwan Voice')],
      speak,
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as SpeechSynthesis

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: synthMock,
    })

    const result = await speakChinese('蝦肉水餃')

    expect(result.status).toBe('started')
    expect(speak).toHaveBeenCalledTimes(1)
  })

  it('returns error when synthesis reports an error event', async () => {
    installUtteranceMock()

    const speak = vi.fn((utterance: MockUtterance) => {
      utterance.onerror?.({ error: 'not-allowed' })
    })

    const synthMock = {
      getVoices: () => [voice('zh-TW')],
      speak,
      cancel: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as SpeechSynthesis

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: synthMock,
    })

    const result = await speakChinese('蝦肉水餃')

    expect(result.status).toBe('error')
    expect(result.error).toBe('not-allowed')
  })

  it('returns voices_not_loaded when voices never become available', async () => {
    installUtteranceMock()
    vi.useFakeTimers()

    try {
      const listeners: Record<string, (() => void) | undefined> = {}
      const synthMock = {
        getVoices: () => [],
        speak: vi.fn(),
        cancel: vi.fn(),
        addEventListener: vi.fn((event: string, callback: () => void) => {
          listeners[event] = callback
        }),
        removeEventListener: vi.fn(),
      } as unknown as SpeechSynthesis

      Object.defineProperty(window, 'speechSynthesis', {
        configurable: true,
        value: synthMock,
      })

      const resultPromise = speakChinese('蝦肉水餃')
      await vi.advanceTimersByTimeAsync(5100)

      const result = await resultPromise
      expect(result.status).toBe('voices_not_loaded')
    } finally {
      vi.useRealTimers()
    }
  })
})
