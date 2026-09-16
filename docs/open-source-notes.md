# Open-source lineage notes

## anton-bregolas/nobs-fsrs-cards
- Pattern examined: small `src` modules (`hooks`, `utils`) with browser-local state utilities and separate TTS/SRS utilities.
- Reused: utility-first split for speech and storage boundaries (`src/utils/speech.ts`, `src/storage/progress.ts`).
- Adapted: kept only the boundary concept; replaced FSRS-specific logic with a simple "mark seen" state seam.
- Deliberately not used: FSRS scheduler, rating pipeline, cloud/API speech providers.
- Why: this slice must stop at YAML→reveal→speak→next with browser-native speech only.

## Yc-Chen/flashcards
- Pattern examined: mobile-first reveal flow plus browser `SpeechSynthesis` voice selection and graceful device fallback messaging.
- Reused: reveal-first card flow and in-browser speech with explicit language/voice preference.
- Adapted: defaulted to Traditional Chinese (`zh-TW`) voice preference and simplified controls to Reveal/Speak/Next.
- Deliberately not used: Google Sheets backend, Leitner scheduling, in-app editing/analytics modes.
- Why: durable source here is YAML and learner-state scheduling is intentionally out of scope.

## DavidMiserak/GoCard
- Pattern examined: separation between human-authored card content files and independently managed review state.
- Reused: keep durable knowledge in versioned files (`data/taiwan.yaml`) while runtime progress stays in browser storage.
- Adapted: used YAML instead of markdown-frontmatter files and a web UI instead of terminal UI.
- Deliberately not used: SM-2 scheduling and TUI/deck-management feature set.
- Why: this milestone only proves the vertical slice and preserves a clean future seam for SRS insertion.
