import { describe, expect, it } from 'vitest'
import { pickPreferredChineseVoice } from './speech'

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
