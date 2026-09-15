# yaml-flashcards

Minimal mobile-first YAML flashcards vertical slice:

**YAML → load card → display Chinese → reveal pinyin/English → speak Chinese → next card**

## Purpose
This repository proves a local-first learning loop with browser-native speech and a durable, human-authored YAML knowledge source. It intentionally stops before spaced repetition and account/cloud features.

## Stack
- React + TypeScript + Vite
- Browser `SpeechSynthesis` API (no external TTS service)
- YAML source parsed at runtime

## Architecture
- `data/taiwan.yaml`: durable knowledge source
- `src/data/loadCards.ts`: YAML parsing + normalization boundary
- `src/components/FlashCard.tsx`: mobile-first reveal/speak/next UI
- `src/utils/speech.ts`: browser-native speech with `zh-TW` preference
- `src/storage/progress.ts`: learner-state seam in browser storage (future FSRS insertion point)

Knowledge content is separate from learner state. Progress is never written back to YAML.

## Data model
Each card requires:
- `chinese`
- `pinyin`
- `english`

Optional fields are supported (not required):
- `scientific`, `clue`, `seen`, `photo`, `location`, `source`, `parts`, `category`

## Local development
```bash
npm install
npm run dev
```

Run tests:
```bash
npm test
```

Build production assets:
```bash
npm run build
```

## Speech support limitations
- Speech depends on browser/device voice availability.
- The app prefers a `zh-TW` voice when installed; otherwise falls back to another `zh-*` voice.
- Some browsers only populate voices after user interaction or platform voice installation.
- No external TTS API is used in this vertical slice.

## Open-source lineage
Concise implementation lineage notes are in `docs/open-source-notes.md`.
