import { describe, expect, it } from 'vitest'
import { parseTaiwanCards } from './loadCards'

describe('parseTaiwanCards', () => {
  it('parses valid cards and keeps optional fields optional', () => {
    const yaml = `
cards:
  - chinese: 蝦肉水餃
    pinyin: xiāròu shuǐjiǎo
    english: shrimp dumplings
    category: food
  - chinese: 榕樹
    pinyin: róngshù
    english: banyan tree
`

    const cards = parseTaiwanCards(yaml)

    expect(cards).toHaveLength(2)
    expect(cards[0]).toMatchObject({
      chinese: '蝦肉水餃',
      pinyin: 'xiāròu shuǐjiǎo',
      english: 'shrimp dumplings',
      category: 'food',
    })
    expect(cards[1].category).toBeUndefined()
  })

  it('skips cards missing required language fields', () => {
    const yaml = `
cards:
  - chinese: 雷陣雨
    pinyin: léizhènyǔ
  - chinese: 榕樹
    pinyin: róngshù
    english: banyan tree
`

    const cards = parseTaiwanCards(yaml)

    expect(cards).toHaveLength(1)
    expect(cards[0].english).toBe('banyan tree')
  })
})
