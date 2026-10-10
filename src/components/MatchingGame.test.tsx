import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MatchingGame } from './MatchingGame'
import { speakChinese } from '../utils/speech'

vi.mock('../utils/speech', () => ({
  speakChinese: vi.fn(() => Promise.resolve({ status: 'started', message: 'Speaking' })),
}))

const cards = [
  { id: '1', chinese: '一', pinyin: 'yī', english: 'one' },
  { id: '2', chinese: '二', pinyin: 'èr', english: 'two' },
]

describe('MatchingGame', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('selects a Chinese card and pronounces it immediately', () => {
    const { getByRole } = render(<MatchingGame cards={cards} onBack={vi.fn()} />)

    const chineseCard = getByRole('button', { name: '一' })
    fireEvent.click(chineseCard)

    expect(chineseCard).toHaveAttribute('aria-pressed', 'true')
    expect(speakChinese).toHaveBeenCalledTimes(1)
    expect(speakChinese).toHaveBeenCalledWith('一')
  })

  it('replays pronunciation when the same Chinese card is tapped again and does not speak for target cards', () => {
    const { getAllByRole, getByRole } = render(<MatchingGame cards={cards} onBack={vi.fn()} />)

    const chineseCards = getAllByRole('button', { name: '一' })
    const chineseCard = chineseCards[chineseCards.length - 1]
    fireEvent.click(chineseCard)
    fireEvent.click(chineseCard)

    expect(speakChinese).toHaveBeenCalledTimes(2)
    expect(speakChinese).toHaveBeenNthCalledWith(1, '一')
    expect(speakChinese).toHaveBeenNthCalledWith(2, '一')

    const targetCard = getByRole('button', { name: 'one' })
    fireEvent.click(targetCard)

    expect(speakChinese).toHaveBeenCalledTimes(2)
  })
})
