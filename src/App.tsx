import { useMemo, useState } from 'react'
import { FlashCard } from './components/FlashCard'
import { loadTaiwanCards } from './data/loadCards'
import { markCardSeen } from './storage/progress'
import { speakChinese } from './utils/speech'

function App() {
  const cards = useMemo(() => loadTaiwanCards(), [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  if (cards.length === 0) {
    return <main className="flashcard-shell">No cards found in data/taiwan.yaml.</main>
  }

  const currentCard = cards[currentIndex]

  const handleReveal = () => {
    setRevealed(true)
  }

  const handleSpeak = () => {
    speakChinese(currentCard.chinese)
  }

  const handleNext = () => {
    markCardSeen(currentCard)
    setCurrentIndex((previous) => (previous + 1) % cards.length)
    setRevealed(false)
  }

  return (
    <FlashCard
      card={currentCard}
      isRevealed={revealed}
      onReveal={handleReveal}
      onSpeak={handleSpeak}
      onNext={handleNext}
    />
  )
}

export default App
