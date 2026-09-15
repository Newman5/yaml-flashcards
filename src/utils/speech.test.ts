import { describe, expect, it, vi } from 'vitest'
import { pickPreferredChineseVoice, speakChinese } from './speech'

function voice(lang: string): SpeechSynthesisVoice {
  return {
    default: false,
    lang,
    localService: true,
    name: `${lang}-voice`,
    voiceURI: `${lang}-uri`,
  }
}

describe('pickPreferredChineseVoice', () => {
  it('prefers zh-TW over other Chinese voices', () => {
    const selected = pickPreferredChineseVoice([
      voice('zh-CN'),
      voice('en-US'),
      voice('zh-TW'),
    ])

    expect(selected?.lang).toBe('zh-TW')
  })

  it('falls back to other zh voices when zh-TW is unavailable', () => {
    const selected = pickPreferredChineseVoice([voice('en-US'), voice('zh-HK')])

    expect(selected?.lang).toBe('zh-HK')
  })
})

describe('speakChinese', () => {
  it('waits for voiceschanged when voices are initially empty', () => {
    vi.useFakeTimers()

    const speak = vi.fn()
    const cancel = vi.fn()
    let currentVoices: SpeechSynthesisVoice[] = []
    let listener: (() => void) | undefined

    const synthMock = {
      getVoices: () => currentVoices,
      speak,
      cancel,
      addEventListener: (_event: string, callback: () => void) => {
        listener = callback
      },
      removeEventListener: vi.fn(),
    } as unknown as SpeechSynthesis

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: synthMock,
    })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      function MockSpeechSynthesisUtterance(this: { text: string; lang?: string; voice?: SpeechSynthesisVoice }, text: string) {
        this.text = text
      },
    )

    expect(speakChinese('蝦肉水餃')).toBe(true)
    expect(speak).not.toHaveBeenCalled()

    currentVoices = [voice('zh-TW')]
    listener?.()

    expect(speak).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})
