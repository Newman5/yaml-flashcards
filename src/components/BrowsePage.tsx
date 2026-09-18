import { useMemo, useState } from 'react'
import { loadTaiwanCards } from '../data/loadCards'
import { speakChinese } from '../utils/speech'
import type { FlashCard } from '../types/card'

type Props = {
  onBack: () => void
}

type BrowseCardProps = {
  card: FlashCard
  showPinyin: boolean
  showEnglish: boolean
  onTap: (chinese: string) => void
}

function BrowseCard({ card, showPinyin, showEnglish, onTap }: BrowseCardProps) {
  return (
    <button
      className="browse-card"
      onClick={() => onTap(card.chinese)}
      aria-label={`Speak ${card.chinese} (${card.pinyin}) – ${card.english}`}
    >
      <span className="browse-chinese">{card.chinese}</span>
      {showPinyin && <span className="browse-pinyin">{card.pinyin}</span>}
      {showEnglish && <span className="browse-english">{card.english}</span>}
    </button>
  )
}

export function BrowsePage({ onBack }: Props) {
  const cards = useMemo(() => loadTaiwanCards(), [])
  const [speechMessage, setSpeechMessage] = useState<string | null>(null)
  const [showPinyin, setShowPinyin] = useState(true)
  const [showEnglish, setShowEnglish] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  const grouped = useMemo<[string, FlashCard[]][]>(() => {
    if (!showCategories) return []
    const map = new Map<string, FlashCard[]>()
    for (const card of cards) {
      const key = card.category?.trim() || 'Uncategorized'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(card)
    }
    const entries = Array.from(map.entries())
    // Sort: named categories first (alphabetical), Uncategorized last
    entries.sort(([a], [b]) => {
      if (a === 'Uncategorized') return 1
      if (b === 'Uncategorized') return -1
      return a.localeCompare(b)
    })
    return entries
  }, [cards, showCategories])

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
      <div className="browse-controls">
        <label className="browse-control-label">
          <input
            type="checkbox"
            checked={showPinyin}
            onChange={(e) => setShowPinyin(e.target.checked)}
          />
          Show pinyin
        </label>
        <label className="browse-control-label">
          <input
            type="checkbox"
            checked={showEnglish}
            onChange={(e) => setShowEnglish(e.target.checked)}
          />
          Show English
        </label>
        <label className="browse-control-label">
          <input
            type="checkbox"
            checked={showCategories}
            onChange={(e) => setShowCategories(e.target.checked)}
          />
          Show categories
        </label>
      </div>
      {speechMessage && <p className="speech-message browse-speech-message">{speechMessage}</p>}
      {showCategories ? (
        grouped.map(([category, groupCards]) => (
          <section key={category} className="browse-category-section">
            <h2 className="browse-category-heading">{category}</h2>
            <div className="browse-grid">
              {groupCards.map((card) => (
                <BrowseCard
                  key={card.id}
                  card={card}
                  showPinyin={showPinyin}
                  showEnglish={showEnglish}
                  onTap={handleTap}
                />
              ))}
            </div>
          </section>
        ))
      ) : (
        <div className="browse-grid">
          {cards.map((card) => (
            <BrowseCard
              key={card.id}
              card={card}
              showPinyin={showPinyin}
              showEnglish={showEnglish}
              onTap={handleTap}
            />
          ))}
        </div>
      )}
    </main>
  )
}
