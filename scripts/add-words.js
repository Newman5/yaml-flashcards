#!/usr/bin/env node
// add-words.js — Batch-append words to data/taiwan.yaml
// Usage: node scripts/add-words.js <input-file.txt>
//
// Input format (pipe-delimited, UTF-8):
//   english | chinese | pinyin | category | practice
// Lines starting with # or blank lines are ignored.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TAIWAN_YAML = path.resolve(__dirname, '..', 'data', 'taiwan.yaml');

function slugify(english) {
  return english
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseInputFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const entries = [];
  const errors = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (line.trim() === '' || line.trim().startsWith('#')) continue;

    const parts = line.split('|').map(p => p.trim());
    const [english, chinese, pinyin, category, practiceRaw] = parts;

    if (!english) {
      errors.push(`Line ${lineNum}: missing English field`);
      continue;
    }
    if (!chinese) {
      errors.push(`Line ${lineNum}: missing Chinese field (english: "${english}")`);
      continue;
    }
    if (!pinyin) {
      errors.push(`Line ${lineNum}: missing pinyin field (english: "${english}")`);
      continue;
    }

    const card = {
      id: slugify(english),
      chinese,
      pinyin,
      english,
    };

    if (category) card.category = category;

    if (practiceRaw) {
      card.practice = practiceRaw.split(',').map(p => p.trim()).filter(Boolean);
    }

    entries.push({ card, lineNum });
  }

  return { entries, errors };
}

function main() {
  const [, , inputFile] = process.argv;

  if (!inputFile) {
    console.error('Usage: node scripts/add-words.js <input-file.txt>');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: input file not found: ${inputFile}`);
    process.exit(1);
  }

  // Load existing YAML
  const yamlContent = fs.readFileSync(TAIWAN_YAML, 'utf8');
  const doc = yaml.load(yamlContent);

  if (!doc || !Array.isArray(doc.cards)) {
    console.error('Error: data/taiwan.yaml does not have a top-level "cards:" array');
    process.exit(1);
  }

  const existingIds = new Set(doc.cards.map(c => c.id));

  // Parse input file
  const { entries, errors: parseErrors } = parseInputFile(inputFile);

  if (parseErrors.length > 0) {
    console.error('Validation errors in input file:');
    parseErrors.forEach(e => console.error(`  ${e}`));
    process.exit(1);
  }

  if (entries.length === 0) {
    console.log('No entries found in input file.');
    process.exit(0);
  }

  // Check for duplicates within the input file
  const seenIds = new Map(); // id -> lineNum of first occurrence
  const duplicateErrors = [];
  for (const { card, lineNum } of entries) {
    if (seenIds.has(card.id)) {
      duplicateErrors.push(
        `Line ${lineNum}: ID "${card.id}" (english: "${card.english}") duplicates line ${seenIds.get(card.id)} within input file`
      );
    } else {
      seenIds.set(card.id, lineNum);
    }
  }

  // Check for duplicates against existing YAML
  for (const { card, lineNum } of entries) {
    if (existingIds.has(card.id)) {
      duplicateErrors.push(`Line ${lineNum}: ID "${card.id}" (english: "${card.english}") already exists in taiwan.yaml`);
    }
  }

  if (duplicateErrors.length > 0) {
    console.error('Duplicate ID errors:');
    duplicateErrors.forEach(e => console.error(`  ${e}`));
    process.exit(1);
  }

  // Append cards — dump only the new cards as a YAML sequence and append
  // to the existing file, preserving all original comments and formatting.
  for (const { card } of entries) {
    const cardYaml = yaml.dump([card], {
      allowUnicode: true,
      lineWidth: -1,
      noRefs: true,
    });
    // yaml.dump of a sequence starts with "- id: ...\n"; indent each line
    // by 2 spaces to nest under the top-level "cards:" key, then append.
    const indented = cardYaml
      .split('\n')
      .map(line => (line ? `  ${line}` : ''))
      .join('\n')
      .trimEnd();
    fs.appendFileSync(TAIWAN_YAML, `\n${indented}\n`, 'utf8');
  }

  console.log(`Added ${entries.length} card(s) to data/taiwan.yaml:`);
  for (const { card } of entries) {
    console.log(`  + ${card.id} (${card.english})`);
  }
}

main();
