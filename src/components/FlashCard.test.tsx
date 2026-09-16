import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { FlashCard } from './FlashCard'

const card = {
  id: '1',
  chinese: '蝦肉水餃',
  pinyin: 'xiāròu shuǐjiǎo',
  english: 'shrimp dumplings',
}

describe('FlashCard', () => {
  it('reveals pinyin and english only after tapping Reveal', () => {
    const onReveal = vi.fn()
    render(
      <FlashCard card={card} isRevealed={false} onReveal={onReveal} onSpeak={vi.fn()} onNext={vi.fn()} />,
    )

    expect(screen.getByText('蝦肉水餃')).toBeInTheDocument()
    expect(screen.queryByText('xiāròu shuǐjiǎo')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reveal' }))
    expect(onReveal).toHaveBeenCalledTimes(1)
  })

  it('shows speak and next controls in revealed state', () => {
    render(
      <FlashCard card={card} isRevealed onReveal={vi.fn()} onSpeak={vi.fn()} onNext={vi.fn()} />,
    )

    expect(screen.getByText('xiāròu shuǐjiǎo')).toBeInTheDocument()
    expect(screen.getByText('shrimp dumplings')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Speak' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('shows speech feedback message when provided', () => {
    render(
      <FlashCard
        card={card}
        isRevealed
        speechMessage="No Chinese speech voice is available on this device."
        onReveal={vi.fn()}
        onSpeak={vi.fn()}
        onNext={vi.fn()}
      />,
    )

    expect(screen.getByText('No Chinese speech voice is available on this device.')).toBeInTheDocument()
  })
})
