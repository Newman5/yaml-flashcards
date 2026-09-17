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


## Travel-Language Field Notebook Roadmap

The core of this project is a simple YAML dataset created from things encountered while traveling.

The flashcard interface is the first way to use that data, but it does not have to be the last.

The long-term loop is:

**Explore → Capture → Review → Learn → Recognize**

The goal is to let actual travel experiences generate the learning curriculum.

## Phase 1 — Working Flashcards & Basic Review

**Goal:** Make the existing flashcard app genuinely useful.

The basic flashcard application is already working on GitHub Pages and mobile.

### Features

- Load cards from YAML
- Show Chinese
- Reveal pinyin and English
- Speak Chinese
- Next / previous card
- Randomize / shuffle cards
- Mark cards as:
  - New
  - Learning
  - Familiar
- Filter or quiz by familiarity
- Basic category filtering

This phase should remain intentionally simple. We do not need a full spaced-repetition system yet.

---

## Phase 2 — Field Capture Workflow

**Goal:** Make adding something encountered during the day take seconds rather than becoming a coding task.

Examples might include:

- A word on a restaurant menu
- A station sign
- A restaurant name
- A tree or plant
- Something interesting seen while exploring

### Features

- Quick capture workflow
- Add Card / YAML generator
- Paste or enter Chinese
- Add pinyin
- Add English meaning
- Optional metadata:
  - Category
  - Place
  - Date
  - Source
  - Photo
- Generate valid YAML without manually editing it
- Establish a practical daytime capture → evening review workflow

The YAML file remains the durable source of truth. A database is not necessary at this stage.

---

## Phase 3 — Travel Notebook & Review

**Goal:** Use the context around cards as part of learning.

Once enough real-world encounters have accumulated, the notebook itself becomes useful.

### Features

Filter and review cards by things such as:

- Food
- Nature
- Transportation
- Place
- Date / recent
- Trip location
- Cards with photos

Possible review modes:

- Things I encountered today
- Things I encountered in Hsinchu
- Food I've seen
- Plants I've encountered
- Recent additions

Photos, locations, dates, and sources become learning context rather than simply metadata.

---

## Phase 4 — Learning Activities & Games

**Goal:** Let one YAML dataset generate many different learning activities.

The flashcard is only Activity #1.

### Activity ideas

#### Look → Reveal

The existing flashcard:

**Chinese → reveal pinyin + English**

#### Recognition

- Chinese → English
- English → Chinese
- Chinese → pinyin
- Pinyin → Chinese
- Hear Chinese → choose the meaning

#### Matching Game

Display a collection of:

- Chinese characters
- Words
- Pinyin
- English meanings

Match corresponding items.

#### Compound Recognition

Use `parts` from the YAML to learn how words are constructed.

For example:

`蝦肉水餃`

- `蝦` → shrimp
- `肉` → meat
- `水餃` → boiled dumplings

The learner does not necessarily need to understand every character to extract useful meaning.

#### Find It in the Real World

Display an actual menu, sign, or photograph and ask the learner to:

- Find every instance of a character
- Find a particular word
- Identify a word after hearing it
- See pinyin and select the corresponding Chinese from the image
- Recognize known characters inside an unfamiliar phrase

This connects the quiz directly back to the original travel experience.

---

## Phase 5 — Travel-Language Field Notebook

**Goal:** Turn the experiment into a coherent, releasable application.

Polish the complete loop:

**Explore → Capture → Review → Learn → Recognize**

### Possible release work

- Settle the YAML schema based on actual usage
- Make capture and review understandable to a new user
- Package the most useful learning activities
- Improve mobile use
- Document the workflow
- Provide example travel datasets
- Release the project as a **travel-language field notebook**, rather than simply a flashcard application

The central idea:

> Your travels generate your curriculum.

---

## Later — Only If Usage Demands It

Avoid building these until actual usage demonstrates a need:

- OCR / automatic text extraction from photos
- Automatic flashcard generation
- AI tagging or translation
- Full spaced repetition
- Accounts
- Backend services
- Cloud synchronization
- Collaborative decks

The project should remain small and local-first for as long as that works.

---

## Development Approach

A useful distinction for organizing the project:

> **Roadmap:** Where are we going?  
> **Phase:** What capability are we trying to reach?  
> **Milestone:** The GitHub bucket representing that deliverable or release.  
> **Issue:** One concrete piece of work we can finish.

Future ideas do not need to become issues immediately.

Keep them at the roadmap or phase level until they are close enough to implementation that we understand the concrete work involved.