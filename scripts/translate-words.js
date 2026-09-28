#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  formatGeneratedWords,
  generatePinyin,
  parseEnglishInputFile,
  translateEnglishToTaiwanChinese,
} from './words-workflow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUTPUT = path.resolve(__dirname, '..', 'output', 'generated-words.txt');

async function main() {
  const [, , inputFile, outputFile = DEFAULT_OUTPUT] = process.argv;

  if (!inputFile) {
    console.error('Usage: node scripts/translate-words.js <english-input.txt> [output-file.txt]');
    process.exit(1);
  }

  try {
    const englishEntries = parseEnglishInputFile(inputFile);
    const translated = await translateEnglishToTaiwanChinese(englishEntries);

    const rows = translated.map(({ english, chinese }) => ({
      english,
      chinese,
      pinyin: generatePinyin(chinese),
    }));

    const formatted = formatGeneratedWords(rows);

    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, formatted, 'utf8');

    console.log(`Generated ${rows.length} rows: ${outputFile}`);
  } catch (error) {
    console.error(`translate-words failed: ${error.message}`);
    process.exit(1);
  }
}

await main();
