import { useMemo, useState } from 'react'
import { FlashCard } from './components/FlashCard'
import { loadTaiwanCards } from './data/loadCards'
import { markCardSeen } from './storage/progress'
import { speakChinese } from './utils/speech'

function App() {
  const cards = useMemo(() => loadTaiwanCards(), [])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [speechMessage, setSpeechMessage] = useState<string | null>(null)

  if (cards.length === 0) {
    return <main className="flashcard-shell">No cards found in data/taiwan.yaml.</main>
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
      <FlashCard
        card={currentCard}
        isRevealed={revealed}
        speechMessage={speechMessage}
        onReveal={handleReveal}
        onSpeak={handleSpeak}
        onNext={handleNext}
      />
    </main>
  )
}

export default App
