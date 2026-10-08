import { useState } from 'react'
import type { FlashCard } from '../types/card'
import {
  createMatchingRound,
  evaluateMatchAttempt,
  type MatchingMode,
  type MatchingRound,
} from './matchingGameLogic'

type Props = {
  cards: FlashCard[]
  onBack: () => void
}

function nextRound(cards: FlashCard[], mode: MatchingMode): MatchingRound {
  return createMatchingRound(cards, mode)
}

export function MatchingGame({ cards, onBack }: Props) {
  const [mode, setMode] = useState<MatchingMode>('english')
  const [round, setRound] = useState<MatchingRound>(() => nextRound(cards, 'english'))
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())
  const [selectedChineseId, setSelectedChineseId] = useState<string | null>(null)
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [isLocked, setIsLocked] = useState(false)

  const resolveAttempt = (chineseId: string, targetId: string) => {
    const result = evaluateMatchAttempt(
      matchedIds,
      chineseId,
      targetId,
      round.pairs.length,
    )

    setFeedback(result.isCorrect ? 'correct' : 'incorrect')
    setIsLocked(true)

    if (result.isCorrect) {
      setMatchedIds(result.matchedIds)
    }

    window.setTimeout(() => {
      setSelectedChineseId(null)
      setSelectedTargetId(null)
      setFeedback(null)
      setIsLocked(false)
    }, 700)
  }

  const handleSelectChinese = (cardId: string) => {
    if (isLocked || matchedIds.has(cardId)) {
      return
    }
    setSelectedChineseId(cardId)
    if (selectedTargetId) {
      resolveAttempt(cardId, selectedTargetId)
    }
  }

  const handleSelectTarget = (cardId: string) => {
    if (isLocked || matchedIds.has(cardId)) {
      return
    }
    setSelectedTargetId(cardId)
    if (selectedChineseId) {
      resolveAttempt(selectedChineseId, cardId)
    }
  }

  const handleChangeMode = (nextMode: MatchingMode) => {
    if (nextMode === mode) {
      return
    }

    setMode(nextMode)
    setRound(nextRound(cards, nextMode))
    setMatchedIds(new Set())
    setSelectedChineseId(null)
    setSelectedTargetId(null)
    setFeedback(null)
    setIsLocked(false)
  }

  const handleRestart = () => {
    setMatchedIds(new Set())
    setSelectedChineseId(null)
    setSelectedTargetId(null)
    setFeedback(null)
    setIsLocked(false)
  }

  const handlePlayAgain = () => {
    setRound(nextRound(cards, mode))
    setMatchedIds(new Set())
    setSelectedChineseId(null)
    setSelectedTargetId(null)
    setFeedback(null)
    setIsLocked(false)
  }

  const totalPairs = round.pairs.length
  const score = matchedIds.size
  const isComplete = totalPairs > 0 && score === totalPairs

  return (
    <main className="browse-shell">
      <div className="browse-header">
        <button className="secondary-button browse-back-btn" onClick={onBack} type="button">
          ← Flashcards
        </button>
        <h1 className="browse-title">Matching Game</h1>
      </div>

      <div className="matching-mode-toggle" role="group" aria-label="Matching mode">
        <button
          className={`secondary-button matching-mode-btn ${mode === 'english' ? 'is-active' : ''}`}
          onClick={() => handleChangeMode('english')}
          type="button"
        >
          English
        </button>
        <button
          className={`secondary-button matching-mode-btn ${mode === 'pinyin' ? 'is-active' : ''}`}
          onClick={() => handleChangeMode('pinyin')}
          type="button"
        >
          Pinyin
        </button>
      </div>

      {totalPairs === 0 ? (
        <p className="speech-message">No cards available for {mode} matching.</p>
      ) : (
        <>
          <p className="matching-progress">
            Matched {score} / {totalPairs}
          </p>
          {totalPairs < 5 ? (
            <p className="matching-note">Showing {totalPairs} pair(s) based on available unique cards.</p>
          ) : null}
          <div className="matching-columns">
            <div className="matching-column">
              <h2 className="matching-column-title">Chinese</h2>
              {round.chineseCards.map((card) => {
                const isMatched = matchedIds.has(card.id)
                const isSelected = selectedChineseId === card.id
                return (
                  <button
                    key={card.id}
                    className={`matching-card ${isSelected ? 'is-selected' : ''} ${isMatched ? 'is-matched' : ''}`}
                    onClick={() => handleSelectChinese(card.id)}
                    disabled={isLocked || isMatched}
                    type="button"
                  >
                    {card.text}
                  </button>
                )
              })}
            </div>
            <div className="matching-column">
              <h2 className="matching-column-title">{mode === 'english' ? 'English' : 'Pinyin'}</h2>
              {round.targetCards.map((card) => {
                const isMatched = matchedIds.has(card.id)
                const isSelected = selectedTargetId === card.id
                return (
                  <button
                    key={card.id}
                    className={`matching-card ${isSelected ? 'is-selected' : ''} ${isMatched ? 'is-matched' : ''}`}
                    onClick={() => handleSelectTarget(card.id)}
                    disabled={isLocked || isMatched}
                    type="button"
                  >
                    {card.text}
                  </button>
                )
              })}
            </div>
          </div>
          {feedback ? (
            <p
              className={`matching-feedback ${feedback === 'correct' ? 'is-correct' : 'is-incorrect'}`}
              role="status"
            >
              {feedback === 'correct' ? '🙂 Correct match!' : '🙁 Not a match.'}
            </p>
          ) : null}
          {isComplete ? (
            <p className="matching-complete" role="status">
              Great job! You matched all pairs.
            </p>
          ) : null}
        </>
      )}

      <div className="matching-actions">
        <button className="secondary-button" onClick={handleRestart} type="button">
          Restart
        </button>
        <button className="primary-button" onClick={handlePlayAgain} type="button">
          Play Again
        </button>
      </div>
    </main>
  )
}
