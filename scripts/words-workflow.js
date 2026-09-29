import fs from 'fs';
import OpenAI from 'openai';
import { pinyin } from 'pinyin-pro';

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

const TRANSLATIONS_SCHEMA = {
  name: 'taiwan_translations',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      translations: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            english: { type: 'string' },
            chinese: { type: 'string' },
          },
          required: ['english', 'chinese'],
        },
      },
    },
    required: ['translations'],
  },
};

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required but was not found in the environment.');
  }
  return new OpenAI({ apiKey });
}

function normalizeAndValidateTranslations(translations, englishTerms) {
  if (!Array.isArray(translations)) {
    throw new Error('OpenAI response did not include a translations array.');
  }

  if (translations.length !== englishTerms.length) {
    throw new Error(
      `OpenAI returned ${translations.length} translations for ${englishTerms.length} English terms.`
    );
  }

  const expectedSet = new Set(englishTerms);
  const normalized = translations.map((item, idx) => {
    if (!item || typeof item !== 'object') {
      throw new Error(`Translation at index ${idx} is not an object.`);
    }

    const english = typeof item.english === 'string' ? item.english.trim() : '';
    const chinese = typeof item.chinese === 'string' ? item.chinese.trim() : '';

    if (!english) {
      throw new Error(`Translation at index ${idx} is missing english text.`);
    }

    if (!chinese) {
      throw new Error(`Translation for "${english}" is missing Chinese text.`);
    }

    if (!expectedSet.has(english)) {
      throw new Error(`OpenAI returned unexpected english term: "${english}".`);
    }

    return { english, chinese };
  });

  const seen = new Set();
  for (const { english } of normalized) {
    if (seen.has(english)) {
      throw new Error(`OpenAI returned duplicate translation rows for "${english}".`);
    }
    seen.add(english);
  }

  return englishTerms.map((english) => {
    const found = normalized.find((item) => item.english === english);
    if (!found) {
      throw new Error(`OpenAI response is missing translation for "${english}".`);
    }
    return found;
  });
}

export function parseEnglishInput(inputText) {
  if (typeof inputText !== 'string') {
    throw new Error('Input content must be a string.');
  }

  const entries = [];
  const seen = new Map();
  const duplicates = [];

  inputText.split(/\r?\n/).forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return;
    }

    const key = trimmed.toLowerCase();
    if (seen.has(key)) {
      duplicates.push(`Line ${index + 1} duplicates line ${seen.get(key)}: "${trimmed}"`);
      return;
    }

    seen.set(key, index + 1);
    entries.push(trimmed);
  });

  if (duplicates.length > 0) {
    throw new Error(`Duplicate English lines found:\n${duplicates.join('\n')}`);
  }

  if (entries.length === 0) {
    throw new Error('No English entries found after filtering comments and blank lines.');
  }

  return entries;
}

export function parseEnglishInputFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return parseEnglishInput(content);
}

export function generatePinyin(chineseText) {
  if (typeof chineseText !== 'string' || !chineseText.trim()) {
    throw new Error('Chinese text is required to generate pinyin.');
  }

  const raw = pinyin(chineseText.trim(), {
    toneType: 'symbol',
    type: 'string',
    nonZh: 'spaced',
    v: false,
  });

  return raw
    .replace(/\s+/g, ' ')
    .replace(/\s+([，。！？；：,.!?])/g, '$1')
    .trim()
    .toLowerCase();
}

export function formatGeneratedWords(rows) {
  if (!Array.isArray(rows)) {
    throw new Error('Rows must be an array.');
  }

  if (rows.length === 0) {
    throw new Error('No translated rows to format.');
  }

  const lines = rows.map((row, index) => {
    if (!row || typeof row !== 'object') {
      throw new Error(`Row ${index + 1} is not an object.`);
    }

    const english = typeof row.english === 'string' ? row.english.trim() : '';
    const chinese = typeof row.chinese === 'string' ? row.chinese.trim() : '';
    const pinyinText = typeof row.pinyin === 'string' ? row.pinyin.trim() : '';

    if (!english || !chinese || !pinyinText) {
      throw new Error(`Row ${index + 1} is missing english, chinese, or pinyin.`);
    }

    return `${english} | ${chinese} | ${pinyinText}`;
  });

  return `${lines.join('\n')}\n`;
}

export async function translateEnglishToTaiwanChinese(englishTerms, options = {}) {
  if (!Array.isArray(englishTerms) || englishTerms.length === 0) {
    throw new Error('englishTerms must be a non-empty array.');
  }

  const cleanedTerms = englishTerms.map((term, index) => {
    if (typeof term !== 'string' || !term.trim()) {
      throw new Error(`englishTerms[${index}] must be a non-empty string.`);
    }
    return term.trim();
  });

  const model = options.model ?? DEFAULT_OPENAI_MODEL;
  const client = options.client ?? createOpenAIClient();

  const completion = await client.chat.completions.create({
    model,
    temperature: 0,
    response_format: {
      type: 'json_schema',
      json_schema: TRANSLATIONS_SCHEMA,
    },
    messages: [
      {
        role: 'system',
        content:
          'You translate traveler vocabulary from English into natural Traditional Chinese used in Taiwan. Preserve each original English term exactly as given. Return exactly one preferred Taiwan Mandarin translation per item. Use wording a traveler would encounter on menus, signs, shops, markets, transportation, and everyday conversation. Avoid Mainland-preferred terminology when Taiwan usage differs.',
      },
      {
        role: 'user',
        content: `Translate these English entries into Traditional Chinese (Taiwan):\n${cleanedTerms
          .map((entry, idx) => `${idx + 1}. ${entry}`)
          .join('\n')}`,
      },
    ],
  });

  const content = completion.choices?.[0]?.message?.content;
  const refusal = completion.choices?.[0]?.message?.refusal;

  if (refusal) {
    throw new Error(`OpenAI refused the translation request: ${refusal}`);
  }

  if (!content) {
    throw new Error('OpenAI returned an empty response body.');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('OpenAI response was not valid JSON.');
  }

  return normalizeAndValidateTranslations(parsed.translations, cleanedTerms);
}
