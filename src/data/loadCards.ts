import { load } from 'js-yaml'
import taiwanYaml from '../../data/taiwan.yaml?raw'
import type { CardPart, DurableCard, FlashCard } from '../types/card'

type CardContainer = { cards?: unknown }

function asCardParts(value: unknown): CardPart[] | undefined {
  if (!Array.isArray(value)) {
    return undefined
  }

  const parts = value.filter(
    (item): item is CardPart =>
      !!item &&
      typeof item === 'object' &&
      'zh' in item &&
      'en' in item &&
      typeof item.zh === 'string' &&
      typeof item.en === 'string',
  )

  return parts.length > 0 ? parts : undefined
}

function normalizeCard(raw: unknown, index: number): FlashCard | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const card = raw as DurableCard
  if (!card.chinese || !card.pinyin || !card.english) {
    return null
  }

  return {
    id: card.id ?? `card-${index + 1}`,
    chinese: card.chinese,
    pinyin: card.pinyin,
    english: card.english,
    scientific: card.scientific,
    clue: card.clue,
    seen: card.seen,
    photo: card.photo,
    location: card.location,
    source: card.source,
    category: card.category,
    parts: asCardParts(card.parts),
  }
}

export function parseTaiwanCards(yamlText: string): FlashCard[] {
  const parsed = load(yamlText) as CardContainer | unknown[] | undefined
  const cardList = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray(parsed.cards)
      ? parsed.cards
      : []

  return cardList
    .map((entry, index) => normalizeCard(entry, index))
    .filter((entry): entry is FlashCard => entry !== null)
}

export function loadTaiwanCards(): FlashCard[] {
  return parseTaiwanCards(taiwanYaml)
}
