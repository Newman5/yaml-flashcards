export type CardPart = {
  zh: string
  en: string
}

export type DurableCard = {
  id?: string
  chinese: string
  pinyin: string
  english: string
  scientific?: string
  clue?: string
  seen?: string
  photo?: string
  location?: string
  source?: string
  parts?: CardPart[]
  category?: string
}

export type FlashCard = DurableCard & {
  id: string
}
