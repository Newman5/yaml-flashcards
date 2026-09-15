import type { FlashCard as FlashCardType } from '../types/card'

type FlashCardProps = {
  card: FlashCardType
  isRevealed: boolean
  onReveal: () => void
  onSpeak: () => void
  onNext: () => void
}

export function FlashCard({ card, isRevealed, onReveal, onSpeak, onNext }: FlashCardProps) {
  return (
    <main className="flashcard-shell">
      <article className="flashcard" aria-live="polite">
        <p className="label">Chinese</p>
        <h1 className="chinese">{card.chinese}</h1>

        {!isRevealed ? (
          <button className="primary-button" onClick={onReveal} type="button">
            Reveal
          </button>
        ) : (
          <div className="answer-block">
            <p className="pinyin">{card.pinyin}</p>
            <p className="english">{card.english}</p>
            <div className="actions">
              <button className="secondary-button" onClick={onSpeak} type="button">
                Speak
              </button>
              <button className="primary-button" onClick={onNext} type="button">
                Next
              </button>
            </div>
          </div>
        )}
      </article>
    </main>
  )
}
