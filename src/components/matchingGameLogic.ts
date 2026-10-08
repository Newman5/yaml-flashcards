import type { FlashCard } from '../types/card'

export type MatchingMode = 'english' | 'pinyin'

export type MatchingRoundCard = {
  id: string
  text: string
}

export type MatchingRound = {
  pairs: MatchingRoundCard[]
  chineseCards: MatchingRoundCard[]
  targetCards: MatchingRoundCard[]
}

export type MatchAttemptResult = {
  isCorrect: boolean
  matchedIds: Set<string>
  scoreDelta: number
  isComplete: boolean
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const temp = next[index]
    next[index] = next[swapIndex]
    next[swapIndex] = temp
  }
  return next
}

function normalizeValue(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function createMatchingRound(
  cards: FlashCard[],
  mode: MatchingMode,
  maxPairs = 5,
  random: () => number = Math.random,
): MatchingRound {
  const shuffled = shuffle(cards, random)
  const selected: Array<{ id: string; chinese: string; target: string }> = []
  const usedChinese = new Set<string>()
  const usedTargets = new Set<string>()

  for (const card of shuffled) {
    const chinese = card.chinese?.trim()
    const targetRaw = mode === 'english' ? card.english : card.pinyin
    const target = targetRaw?.trim()

    if (!chinese || !target) {
      continue
    }

    const normalizedChinese = normalizeValue(chinese)
    const normalizedTarget = normalizeValue(target)

    if (usedChinese.has(normalizedChinese) || usedTargets.has(normalizedTarget)) {
      continue
    }

    usedChinese.add(normalizedChinese)
    usedTargets.add(normalizedTarget)
    selected.push({ id: card.id, chinese, target })

    if (selected.length === maxPairs) {
      break
    }
  }

  const chinesePairs = selected.map((pair) => ({ id: pair.id, text: pair.chinese }))
  const targetPairs = selected.map((pair) => ({ id: pair.id, text: pair.target }))

  return {
    pairs: chinesePairs,
    chineseCards: shuffle(chinesePairs, random),
    targetCards: shuffle(targetPairs, random),
  }
}

export function evaluateMatchAttempt(
  matchedIds: Set<string>,
  chineseId: string,
  targetId: string,
  totalPairs: number,
): MatchAttemptResult {
  const isCorrect = chineseId === targetId && !matchedIds.has(chineseId)
  if (!isCorrect) {
    return {
      isCorrect: false,
      matchedIds: new Set(matchedIds),
      scoreDelta: 0,
      isComplete: matchedIds.size >= totalPairs,
    }
  }

  const nextMatchedIds = new Set(matchedIds)
  nextMatchedIds.add(chineseId)

  return {
    isCorrect: true,
    matchedIds: nextMatchedIds,
    scoreDelta: 1,
    isComplete: nextMatchedIds.size >= totalPairs,
  }
}
