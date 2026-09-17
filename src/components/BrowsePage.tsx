import { useMemo, useState } from 'react'
import { loadTaiwanCards } from '../data/loadCards'
import { speakChinese } from '../utils/speech'

type Props = {
  onBack: () => void
}

export function BrowsePage({ onBack }: Props) {
  const cards = useMemo(() => loadTaiwanCards(), [])
  const [speechMessage, setSpeechMessage] = useState<string | null>(null)

  const handleTap = async (chinese: string) => {
    const result = await speakChinese(chinese)
    if (result.status === 'started') {
      setSpeechMessage(null)
    } else {
      setSpeechMessage(result.message)
    }
  }

  return (
    <main className="browse-shell">
      <div className="browse-header">
        <button className="secondary-button browse-back-btn" onClick={onBack}>
          ← Flashcards
        </button>
        <h1 className="browse-title">Characters</h1>
      </div>
      {speechMessage && <p className="speech-message browse-speech-message">{speechMessage}</p>}
      <div className="browse-grid">
        {cards.map((card) => (
          <button
            key={card.id}
            className="browse-card"
            onClick={() => handleTap(card.chinese)}
            aria-label={`Speak ${card.chinese} (${card.pinyin})`}
          >
            <span className="browse-chinese">{card.chinese}</span>
            <span className="browse-pinyin">{card.pinyin}</span>
          </button>
        ))}
      </div>
    </main>
  )
}
