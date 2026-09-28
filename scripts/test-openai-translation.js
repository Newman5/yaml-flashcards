#!/usr/bin/env node

import {
  DEFAULT_OPENAI_MODEL,
  translateEnglishToTaiwanChinese,
} from './words-workflow.js';

const TEST_TERMS = ['night market', 'scallion pancake', 'foot massage'];

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set.');
    process.exit(1);
  }

  try {
    const translations = await translateEnglishToTaiwanChinese(TEST_TERMS, {
      model: DEFAULT_OPENAI_MODEL,
    });

    console.log(`Model: ${DEFAULT_OPENAI_MODEL}`);
    console.log('Translations:');
    for (const row of translations) {
      console.log(`${row.english} | ${row.chinese}`);
    }
  } catch (error) {
    console.error(`OpenAI translation test failed: ${error.message}`);
    process.exit(1);
  }
}

await main();
