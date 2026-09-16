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

`parts` is structured data when present:
```yaml
parts:
  - zh: 蝦
    en: shrimp
```

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

Browser-native speech depends on voices exposed through the browser. On Windows testing, Chrome provided a Chinese voice while Firefox and Brave did not; behavior may vary by OS/browser.

### Silent-speech follow-up note
The original silent behavior was likely caused by `speechSynthesis.getVoices()` being empty when the first Speak tap occurred, plus optimistic success handling that treated queued speech as successful before playback events fired.  
The speech utility now waits more robustly for voice availability, selects Chinese voices in a stricter order (`zh-TW` → `cmn-TW` → Taiwan Traditional Chinese matches → other `zh-*`), and returns explicit outcomes from `onstart`/`onend`/`onerror` so the UI can show actionable failure feedback.

For debugging available voices during development, call `logSpeechVoiceDiagnostics(window.speechSynthesis.getVoices())` from the browser console.

## Open-source lineage
Concise implementation lineage notes are in `docs/open-source-notes.md`.

## GitHub Pages
The app is deployed at: **https://newman5.github.io/yaml-flashcards/**
