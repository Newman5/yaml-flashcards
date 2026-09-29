import { describe, expect, it, vi } from 'vitest';
import {
  formatGeneratedWords,
  generatePinyin,
  parseEnglishInput,
  translateEnglishToTaiwanChinese,
} from './words-workflow.js';

describe('parseEnglishInput', () => {
  it('parses lines and ignores comments/blank lines', () => {
    const content = '# comment\n\nnight market\n  scallion pancake  \n# ignored\n';
    expect(parseEnglishInput(content)).toEqual(['night market', 'scallion pancake']);
  });

  it('rejects duplicate entries case-insensitively', () => {
    const content = 'Night Market\nnight market\n';
    expect(() => parseEnglishInput(content)).toThrow(/Duplicate English lines found/);
  });

  it('rejects empty parsed input', () => {
    const content = '# only comments\n\n';
    expect(() => parseEnglishInput(content)).toThrow(/No English entries found/);
  });
});

describe('generatePinyin', () => {
  it('generates lowercase pinyin with tone marks', () => {
    expect(generatePinyin('夜市')).toBe('yè shì');
    expect(generatePinyin('蔥油餅')).toBe('cōng yóu bǐng');
  });

  it('requires non-empty Chinese text', () => {
    expect(() => generatePinyin('')).toThrow(/Chinese text is required/);
  });
});

describe('formatGeneratedWords', () => {
  it('formats rows as pipe-delimited lines', () => {
    const output = formatGeneratedWords([
      { english: 'night market', chinese: '夜市', pinyin: 'yè shì' },
      { english: 'foot massage', chinese: '腳底按摩', pinyin: 'jiǎo dǐ àn mó' },
    ]);

    expect(output).toBe(
      'night market | 夜市 | yè shì\nfoot massage | 腳底按摩 | jiǎo dǐ àn mó\n'
    );
  });

  it('rejects malformed rows', () => {
    expect(() => formatGeneratedWords([{ english: 'night market' }])).toThrow(
      /missing english, chinese, or pinyin/
    );
  });
});

describe('translateEnglishToTaiwanChinese', () => {
  it('uses structured JSON and returns ordered translations', async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              translations: [
                { english: 'night market', chinese: '夜市' },
                { english: 'foot massage', chinese: '腳底按摩' },
              ],
            }),
          },
        },
      ],
    });

    const client = { chat: { completions: { create } } };

    const result = await translateEnglishToTaiwanChinese(
      ['night market', 'foot massage'],
      { client, model: 'gpt-4o-mini' }
    );

    expect(create).toHaveBeenCalledOnce();
    const callArgs = create.mock.calls[0][0];
    expect(callArgs.response_format.type).toBe('json_schema');
    expect(result).toEqual([
      { english: 'night market', chinese: '夜市' },
      { english: 'foot massage', chinese: '腳底按摩' },
    ]);
  });

  it('fails on invalid model JSON payload', async () => {
    const client = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: '{"bad": true}' } }],
          }),
        },
      },
    };

    await expect(
      translateEnglishToTaiwanChinese(['night market'], { client })
    ).rejects.toThrow(/translations array/);
  });
});
