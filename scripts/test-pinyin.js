#!/usr/bin/env node

import { generatePinyin } from './words-workflow.js';

const TEST_WORDS = ['夜市', '蔥油餅', '腳底按摩'];

for (const chinese of TEST_WORDS) {
  console.log(`${chinese} → ${generatePinyin(chinese)}`);
}
