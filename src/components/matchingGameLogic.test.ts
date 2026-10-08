import { describe, expect, it } from 'vitest'
import type { FlashCard } from '../types/card'
import { createMatchingRound, evaluateMatchAttempt } from './matchingGameLogic'

function createRandomSequence(values: number[]): () => number {
  let index = 0
  return () => {
    const value = values[index % values.length]
    index += 1
    return value
  }
}

const cards: FlashCard[] = [
  { id: '1', chinese: '一', pinyin: 'yī', english: 'one' },
  { id: '2', chinese: '二', pinyin: 'èr', english: 'two' },
  { id: '3', chinese: '三', pinyin: 'sān', english: 'three' },
  { id: '4', chinese: '四', pinyin: 'sì', english: 'four' },
  { id: '5', chinese: '五', pinyin: 'wǔ', english: 'five' },
  { id: '6', chinese: '六', pinyin: 'liù', english: 'six' },
]

describe('createMatchingRound', () => {
  it('creates up to five unique pairs for selected mode', () => {
    const random = createRandomSequence([0.9, 0.1, 0.6, 0.2, 0.8, 0.4])
    const round = createMatchingRound(
      [
        ...cards,
        { id: '7', chinese: '七', pinyin: 'qī', english: 'one' },
        { id: '8', chinese: '七', pinyin: 'qī', english: 'seven' },
      ],
      'english',
      5,
      random,
    )

    expect(round.pairs).toHaveLength(5)
    expect(new Set(round.pairs.map((pair) => pair.text)).size).toBe(5)
    expect(new Set(round.targetCards.map((pair) => pair.text)).size).toBe(5)
  })

  it('handles fewer than five eligible cards', () => {
    const round = createMatchingRound(
      [
        { id: '1', chinese: '一', pinyin: 'yī', english: 'one' },
        { id: '2', chinese: '二', pinyin: '', english: 'two' },
        { id: '3', chinese: '三', pinyin: '', english: 'three' },
      ],
      'pinyin',
      5,
      createRandomSequence([0.2]),
    )

    expect(round.pairs).toHaveLength(1)
    expect(round.chineseCards).toHaveLength(1)
    expect(round.targetCards).toHaveLength(1)
  })

  it('shuffles chinese and target columns independently', () => {
    const random = createRandomSequence([0.3, 0.6, 0.1, 0.9, 0.2, 0.7, 0.4, 0.8])
    const round = createMatchingRound(cards, 'english', 5, random)

    const chineseIds = round.chineseCards.map((card) => card.id).join(',')
    const targetIds = round.targetCards.map((card) => card.id).join(',')
    expect(chineseIds).not.toBe(targetIds)
  })
})

describe('evaluateMatchAttempt', () => {
  it('scores only correct new matches and reports completion', () => {
    const start = new Set<string>()
    const wrong = evaluateMatchAttempt(start, '1', '2', 2)
    expect(wrong.isCorrect).toBe(false)
    expect(wrong.scoreDelta).toBe(0)
    expect(wrong.isComplete).toBe(false)

    const first = evaluateMatchAttempt(start, '1', '1', 2)
    expect(first.isCorrect).toBe(true)
    expect(first.scoreDelta).toBe(1)
    expect(first.isComplete).toBe(false)

    const duplicate = evaluateMatchAttempt(first.matchedIds, '1', '1', 2)
    expect(duplicate.isCorrect).toBe(false)
    expect(duplicate.scoreDelta).toBe(0)

    const second = evaluateMatchAttempt(first.matchedIds, '2', '2', 2)
    expect(second.isCorrect).toBe(true)
    expect(second.scoreDelta).toBe(1)
    expect(second.isComplete).toBe(true)
  })
})
