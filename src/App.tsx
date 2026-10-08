import { useMemo, useState } from 'react'
import { BrowsePage } from './components/BrowsePage'
import { FlashCard } from './components/FlashCard'
import { MatchingGame } from './components/MatchingGame'
import { loadTaiwanCards } from './data/loadCards'
import { markCardSeen } from './storage/progress'
import { speakChinese } from './utils/speech'

function App() {
  const cards = useMemo(() => loadTaiwanCards(), [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [speechMessage, setSpeechMessage] = useState<string | null>(null)
  const [view, setView] = useState<'flashcard' | 'browse' | 'matching'>('flashcard')

  if (cards.length === 0) {
    return <main className="flashcard-shell">No cards found in data/taiwan.yaml.</main>
  }

  if (view === 'browse') {
    return <BrowsePage onBack={() => setView('flashcard')} />
  }

  if (view === 'matching') {
    return <MatchingGame cards={cards} onBack={() => setView('flashcard')} />
  }

  const currentCard = cards[currentIndex]

  const handleReveal = () => {
    setRevealed(true)
    setSpeechMessage(null)
  }

  const handleSpeak = async () => {
    const result = await speakChinese(currentCard.chinese)
    if (result.status === 'started') {
      setSpeechMessage(null)
      return
    }

    setSpeechMessage(result.message)
  }

  const handleNext = () => {
    markCardSeen(currentCard)
    setCurrentIndex((previous) => (previous + 1) % cards.length)
    setRevealed(false)
    setSpeechMessage(null)
  }

  return (
    <main className="flashcard-shell">
      <div className="flashcard-view">
        <div className="nav-bar">
          <button
            className="secondary-button nav-browse-btn"
            onClick={() => setView('matching')}
            type="button"
          >
            Matching Game
          </button>
          <button className="secondary-button nav-browse-btn" onClick={() => setView('browse')} type="button">
            Browse
          </button>
        </div>
        <FlashCard
          card={currentCard}
          isRevealed={revealed}
          speechMessage={speechMessage}
          onReveal={handleReveal}
          onSpeak={handleSpeak}
          onNext={handleNext}
        />
      </div>
    </main>
  )
}

export default App
