import type { FlashCard } from '../types/card'

export type CardProgress = {
  seenCount: number
  lastSeenAt: string
}

export type ProgressState = Record<string, CardProgress>

const STORAGE_KEY = 'yaml-flashcards-progress'

export function readProgressState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed = JSON.parse(raw) as ProgressState
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function markCardSeen(card: FlashCard): void {
  const currentState = readProgressState()
  const currentCard = currentState[card.id]

  currentState[card.id] = {
    seenCount: currentCard ? currentCard.seenCount + 1 : 1,
    lastSeenAt: new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState))
}
