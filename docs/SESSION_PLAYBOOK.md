# Session Playbook: Focus & Flow

> The only document you follow linearly. Everything else is reference.
>
> PRD = /docs/PRD.md (full product spec, all 13 sections)
> No backend in V1. No Supabase. No auth. Local-first (IndexedDB).

**Estimated time:** 20–25 hours solo with Claude Code
**Platform:** Next.js 14+ PWA · Vercel · IndexedDB · No backend

---

## How to Use This Playbook

Each session has one goal. Do not start a session until the previous done-check is fully green. Red = fix before moving on. Discovering a broken foundation in Session 8 costs 3× what it costs in Session 2.

**Every Claude Code prompt should begin with:**
> "Read docs/PRD.md [Section X]. Then build..."

---

## Pre-Flight (Before Session 1)

**Allow 30 minutes.**

### Services Setup
- [ ] **Vercel** — account connected to GitHub. Project URL decided: `focus-and-flow.vercel.app`
- [ ] **PostHog** (optional for V1 analytics) — account created, keys noted
- [ ] **GitHub** — repo created, remote added

### Repository Setup

```bash
cd "C:\Users\malan\OneDrive\Desktop\Projects\Focus and Flow"
git init
git remote add origin {{your-github-repo-url}}

# Scaffold Next.js at project root
npx create-next-app@latest . --typescript --tailwind --app --src-dir --yes

# Install dependencies
npm install idb lucide-react
npm install -D @types/node
```

### Audio Files
OGG Vorbis format, 2–3 min seamless loops, ~2 MB each.
- [ ] `/public/audio/rain.ogg` — exists and decodes via Web Audio API
- [ ] `/public/audio/lofi.ogg` — exists and decodes via Web Audio API
- [ ] `/public/audio/brown-noise.ogg` — exists and decodes via Web Audio API
- [ ] `/public/audio/cafe.ogg` — exists and decodes via Web Audio API
- [ ] `/public/audio/forest.ogg` — exists and decodes via Web Audio API

### Pre-flight complete when:
- [ ] `npm run dev` starts without errors at localhost:3000
- [ ] CLAUDE.md is at project root
- [ ] All 5 audio files are in /public/audio/ and play in browser
- [ ] docs/ folder has PRD.md and SESSION_PLAYBOOK.md

---

## Session 1: Foundation — Design System + Data Layer

**Time: 60–75 min**

**Goal:** Design tokens are applied globally, fonts load, IndexedDB schema is defined and tested, progressive disclosure counter works.

**Read:** PRD → Section 11 (full design system), Section 12 (data model)

**Claude Code prompt:**
```
Read docs/PRD.md Section 11 (Design System) and Section 12 (Technical Decisions / Data Model).

1. Replace globals.css with the full design system: all CSS custom properties from Section 11 (colours, typography, spacing, border radius, animation tokens). Include dark mode overrides. Set --ff-bg as the body background. Never use hardcoded hex values in any component — always reference CSS variables.

2. Install and configure Google Fonts (Fraunces + DM Sans) via next/font/google in layout.tsx. Apply the font CSS variables globally.

3. Create src/lib/db.ts — IndexedDB wrapper using the idb library. Implement:
   - openDB() with two object stores: "sessions" (keyPath: "id") and "days" (keyPath: "date")
   - CRUD for Session: addSession, getSession, getAllSessions, updateSession
   - CRUD for Day: saveDay, getDay, getTodayDay
   - getGardenState() — computes { totalSessions, allThreeTaskDays, weeksWith1PlusSession, firstSessionDate } from session data
   Use exact types from PRD Section 12 (Session and Day interfaces).

4. Create src/lib/progressive.ts — reads/writes totalSessionsCompleted to localStorage. Exports:
   - getSessionCount(): number
   - incrementSessionCount(): number (returns new count)
   - hasUnlocked(milestone: number): boolean

Verify: db.ts compiles with no TypeScript errors. Add a simple test in a comment showing addSession + getSession round-trip.
```

**Done when:**
- [ ] `npm run dev` — page loads with correct background colour (#F4F8F7 light, #0B1E1C dark)
- [ ] Fraunces and DM Sans load (check Network tab — no FOUT)
- [ ] No TypeScript errors in db.ts or progressive.ts
- [ ] CSS variables visible in DevTools (--ff-ocean-600 etc.)

**Commit:**
```bash
git add . && git commit -m "feat: design system tokens, fonts, IndexedDB schema, progressive disclosure"
```

---

## Session 2: Opening Screen (Screen 0)

**Time: 45–60 min**

**Goal:** Full-screen opening message renders correctly, contextual message logic works, button appears after 300ms delay, routing to Today screen works.

**Read:** PRD → Section 4 (Screen 0)

**Claude Code prompt:**
```
Read docs/PRD.md Section 4, Screen 0 (Opening Message).

Build the opening screen at src/app/page.tsx.

1. Create src/lib/messages.ts — a static array of 30+ messages categorised by context type (first-open, returning, gap-return, monday, milestone-10). Implement getOpeningMessage() that selects the right message based on: first-ever open (no sessions in IDB), returning after 3+ day gap, Monday, 10+ total sessions, or regular returning user. Use session data from db.ts. No API calls — fully local.

2. Build the page component:
   - Full-screen soft gradient background (--ff-bg with a subtle radial gradient overlay)
   - Message text: Fraunces, 28px, weight 300, centred, max-width 340px, letter-spacing -0.02em
   - No logo, no app name — just the message
   - Button appears after 300ms delay (CSS animation using --ff-ease-fade)
   - Button label rotates softly: "Let's begin." / "I'm ready." / "Begin." (pick one per session deterministically from date)
   - Button: pill-shaped, full-width (max 280px), --ff-ocean-600 background, white text
   - On click: navigate to /today

3. The screen must feel unhurried. Message text renders before the button. Nothing snaps.

Use only CSS variables from globals.css. No hardcoded colours.
```

**Done when:**
- [ ] Screen loads with soft background and centred message
- [ ] Button appears ~300ms after page load (not instantly)
- [ ] Clicking "Let's begin." navigates to /today (even if /today doesn't exist yet — 404 is fine)
- [ ] Fraunces is rendering (check font in DevTools)
- [ ] Dark mode: background is #0B1E1C, text is #E8F4F2
- [ ] At 390px: message and button are comfortable, no overflow

**Commit:**
```bash
git add . && git commit -m "feat: opening screen, contextual messages, animated button entry"
```

---

## Session 3: Today's Tasks Screen (Screen 1)

**Time: 60–75 min**

**Goal:** User can enter up to 3 tasks, session dots render, pre-fill from yesterday works, task selection works, "Start Focusing" navigates to session screen.

**Read:** PRD → Section 4 (Screen 1), Section 5 (Progressive Disclosure)

**Claude Code prompt:**
```
Read docs/PRD.md Section 4 Screen 1 (Today's Tasks) and Section 5 (Progressive Disclosure milestones).

Build src/app/today/page.tsx.

1. Layout: date label (DM Sans, 11px, uppercase, --ff-ink-muted), three task card slots, "Start Focusing" button at bottom. Max-width 480px centred. Padding: --ff-padding-screen.

2. Task card: white surface, 0.5px border --ff-ocean-100, border-radius 12px. Contains: text input (task name, DM Sans 14px) + 4 session dots on the right. Dots: 7px circles. Empty = --ff-ocean-100. Filled = --ff-ocean-400.

3. Behaviour:
   - All 3 slots optional (empty is fine)
   - Pre-fill task names from yesterday's Day record (db.ts getDay(yesterday))
   - Session dots filled count = sessions completed for that task today (from today's Day record)
   - Tapping a card selects it (border becomes --ff-ocean-400, background --ff-ocean-50)
   - "Start Focusing" always visible and enabled. If no task selected, auto-selects first filled task.
   - "Start Focusing" navigates to /session/[taskId] (or /session/free if no task name entered)

4. Progressive disclosure: if totalSessionsCompleted >= 5, show a single soft line below the selected task input: "What would make finishing this feel good?" — DM Sans 11px, --ff-ink-muted, no asterisk, no label, no required state.

5. Small garden icon (bottom corner, --ff-ink-muted) that links to /garden. Soft, not prominent.
```

**Done when:**
- [ ] Three task cards render at correct spacing
- [ ] Task names are editable
- [ ] Session dots update based on today's completed sessions
- [ ] Yesterday's tasks pre-fill on return visit
- [ ] Selecting a card applies the active state visually
- [ ] "Start Focusing" always enabled
- [ ] Garden icon visible and links to /garden
- [ ] At 390px: everything fits without horizontal scroll

**Commit:**
```bash
git add . && git commit -m "feat: today screen, task cards, session dots, pre-fill, task selection"
```

---

## Session 4: Focus Session Screen (Screen 2)

**Time: 90–120 min — the hardest session**

**Goal:** Full-screen timer runs accurately in background via Web Worker, SVG arc fills as time passes, sound plays, focus integrity tracking works, session completion saves to IDB and triggers garden growth animation.

**Read:** PRD → Section 4 (Screen 2), Section 7 (Focus Integrity), Section 12 (Timer, Audio, Data Model)

**Claude Code prompt:**
```
Read docs/PRD.md Section 4 Screen 2 (Focus Session), Section 7 (Focus Integrity Tracking), and Section 12 (Technical Decisions — Timer, Audio, Focus Integrity).

Build src/app/session/[taskId]/page.tsx and the timer infrastructure.

1. Create src/workers/timer.worker.ts — a Web Worker that:
   - Receives { type: 'START', duration: number, startTime: number }
   - Sends { type: 'TICK', elapsed: number, remaining: number } every second using performance.now()
   - Receives { type: 'PAUSE' } and { type: 'RESUME' }
   - Sends { type: 'COMPLETE' } when remaining hits 0

2. Create src/lib/audio.ts — Web Audio API manager:
   - loadSound(name: string): loads /public/audio/[name].mp3 as an AudioBuffer
   - playLoop(name: string): plays the sound in a seamless loop
   - stopLoop(): stops current loop with 200ms fade out
   - preloadAll(): call on app start

3. Build the session page:
   - Full screen. Hide any navigation. Background --ff-bg.
   - Task name at top: DM Sans 14px, --ff-ink-soft, centred.
   - SVG circular arc (200px diameter): track circle (--ff-ocean-100, 5px stroke) + progress arc (--ff-ocean-600, 5px stroke, round cap). Arc fills as time passes (stroke-dashoffset animation). Timer text in centre: 32px, weight 300, --ff-ink.
   - Sound picker: 6 small pills at bottom. Selected = --ff-ocean-100 background, --ff-ocean-600 text. Options: Rain, Lo-fi, Brown noise, Café, Forest, Silence. Changing selection switches the audio immediately.
   - Pause button: small, DM Sans 14px, --ff-ink-muted. Tucked at bottom. Using it is not failure.
   - Session duration: 25 min default. Read query param ?light=1 for 15 min session.

4. Focus integrity (PRD Section 7):
   - Listen to document visibilitychange
   - Log { leftAt, returnedAt } interruption pairs to session state
   - On return: show soft overlay "You stepped away at [time]. Want to keep going or close this session?" — two options only.

5. On completion:
   - Arc completes with 600ms ease-out animation
   - Play session-complete sound (two ascending soft tones — use Web Audio API oscillator, no file needed)
   - Fill the corresponding session dot (update Day record in IDB)
   - Show brief garden growth animation (leaf unfurl, 1.5s, then auto-navigate to /break)
   - Save Session record to IDB with full data (actualFocusTime adjusted for interruptions)
   - Increment progressive disclosure counter

Use only CSS variables from globals.css. No hardcoded colours.
```

**Done when:**
- [ ] Timer counts down accurately (verify with real clock — 25 min = 25 min)
- [ ] Timer continues when tab is switched (Web Worker running)
- [ ] SVG arc fills smoothly as time passes (not a jump)
- [ ] Sound plays on selection. Switching sounds mid-session works.
- [ ] Pause button pauses timer and audio
- [ ] Focus integrity: switch tabs → return → soft prompt appears
- [ ] Session completion: arc fills, sound plays, session saved to IDB
- [ ] After completion: auto-navigates to /break within 2 seconds
- [ ] At 390px: timer arc and sound pills are comfortable

**Commit:**
```bash
git add . && git commit -m "feat: focus session, Web Worker timer, SVG arc, audio, focus integrity, IDB save"
```

---

## Session 5: Break Screen (Screen 3)

**Time: 30–45 min**

**Goal:** Break screen feels like a designed moment. Breathing animation runs, break timer counts up, user can return to focus or end the day.

**Read:** PRD → Section 4 (Screen 3)

**Claude Code prompt:**
```
Read docs/PRD.md Section 4 Screen 3 (Break Screen).

Build src/app/break/page.tsx.

1. "Session complete." — Fraunces 20px, centred, --ff-ink.

2. Breathing animation: a circle (60px) that slowly expands to 80px and contracts back. CSS animation, 4s cycle, ease-in-out, infinite. Use --ff-ocean-200 fill. This runs on its own. No interaction.

3. "Take a real break." — DM Sans 14px, --ff-ink-soft, centred, below animation.

4. Break suggestions: 6 soft pill labels in a 2×3 grid (Stretch, Walk, Water, Breathe, Step outside, Eyes closed). DM Sans 12px, --ff-stone-400 background, --ff-ink-muted text. Not checkboxes. No tracking. Just gentle visual options.

5. Break timer: counts UP from 0:00. DM Sans 32px weight 300. Shows how long they've rested. No pressure. Starts automatically.

6. "Your reset:" text field — one line, optional, completely skippable. Only show if totalSessionsCompleted >= 3 (progressive disclosure). DM Sans 12px, placeholder "a word or two..." in --ff-ink-muted.

7. Two buttons at bottom:
   - "Back to focus" (primary, --ff-ocean-600) → navigates back to /session with same task
   - "Done for now" (ghost, --ff-ink-muted border) → navigates to /today

Both buttons are pill-shaped per the design system.
```

**Done when:**
- [ ] Breathing animation runs smoothly on load
- [ ] Break timer counts up from 0
- [ ] "Your reset" field is absent with 0–2 sessions, present from session 3+
- [ ] "Back to focus" returns to session with same task
- [ ] "Done for now" returns to today screen
- [ ] At 390px: all elements comfortable, no overflow

**Commit:**
```bash
git add . && git commit -m "feat: break screen, breathing animation, break timer, progressive reset field"
```

---

## Session 6: End of Day Screen (Screen 4)

**Time: 30–45 min**

**Goal:** User can close their day with a gentle reflection. Summary is accurate. "Rest well." closing sequence works.

**Read:** PRD → Section 4 (Screen 4)

**Claude Code prompt:**
```
Read docs/PRD.md Section 4 Screen 4 (End of Day).

Build src/app/close/page.tsx.

1. Heading: "You showed up today." — Fraunces 20px, centred. Always this message if sessionCount >= 1. If 0 sessions: "Tomorrow is a fresh start." No count shown when 0.

2. Stats pill: "X sessions · Y tasks touched" — DM Sans 14px, --ff-ocean-50 background, --ff-ink-soft text, border-radius pill. Compute from today's Day record in IDB. Only show if sessionCount >= 1.

3. Two optional reflection prompts (both skippable):
   - "What worked well?" — multi-line textarea, soft border, DM Sans 14px
   - "One thing to carry forward:" — single line input
   Both: --ff-surface background, --ff-ocean-100 border, border-radius 12px, DM Sans 14px.

4. "Close the day" button — primary pill, --ff-ocean-600. On tap:
   - Save reflection text to today's Day record in IDB (closingReflection field)
   - Navigate to /close/done

5. /close/done — a final quiet screen. One line: "Rest well." — Fraunces 28px weight 300, centred, full screen. After 2.5s, fade to black and stay there (or offer a soft "return tomorrow" link at the bottom in tiny --ff-ink-muted text).

Add a "Close the day" entry point to the /today screen — a small, soft text link at the bottom, --ff-ink-muted, DM Sans 12px. Not prominent.
```

**Done when:**
- [ ] "You showed up today." shows for 1+ sessions
- [ ] "Tomorrow is a fresh start." shows for 0 sessions, no count visible
- [ ] Session count and tasks touched compute correctly from IDB
- [ ] Reflection text saves to IDB on close
- [ ] "Rest well." screen appears and fades gracefully
- [ ] "Close the day" link is accessible from /today

**Commit:**
```bash
git add . && git commit -m "feat: end of day screen, reflection save, rest well closing sequence"
```

---

## Session 7: Focus Garden (Screen 6)

**Time: 90–120 min**

**Goal:** The Focus Garden renders correctly based on session data. Plants accumulate with sessions. Ambient sway animation runs. Tapping a plant shows its label.

**Read:** PRD → Section 4 (Screen 6), Section 11.8 (Garden SVG technique)

**Claude Code prompt:**
```
Read docs/PRD.md Section 4 Screen 6 (Focus Garden) and Section 11.8 (Focus Garden SVG Watercolour Technique).

Build src/app/garden/page.tsx and src/lib/garden.ts.

1. src/lib/garden.ts:
   - getGardenState() from db.ts (already built in Session 1)
   - renderGardenSVG(state: GardenState): returns an SVG string or JSX
   - Plant generation is seeded from firstSessionDate so the garden layout is ALWAYS consistent for the same user (same garden every load, just more populated)
   - Growth tiers from PRD: 1st session = single sprout. Each session = growth. All-3-tasks day = flower. 7 days with sessions = young tree. 30 sessions = mature tree + second plant. 100 sessions = full lush garden.

2. SVG technique from Section 11.8:
   - Each plant = 3–5 layered blurred ellipses (feGaussianBlur stdDeviation 8–18)
   - Opacity 0.15–0.35 per layer
   - Garden palette (mist + ocean + stone ramps, low opacity) — all from CSS variables or the exact hex values in Section 11.8
   - Organic curves, not geometric shapes
   - Sky wash gradient at top of canvas

3. Ambient animation:
   - Plant groups have CSS class "garden-sway"
   - CSS keyframe: translateX from -2px to +2px, 8–12s cycle (vary per plant group), ease-in-out infinite
   - Very subtle — creates life without demanding attention

4. Interaction:
   - Tapping/clicking a plant shows a soft label: "Grown from X sessions on [day]" — DM Sans 11px, --ff-ink-muted, appears near the plant, fades after 3s
   - No other interaction

5. Page: full-screen garden SVG on mobile. On desktop: centred 480px container with generous whitespace. Back arrow (small, --ff-ink-muted) to return to /today.

The garden starts completely empty (bare soil) and grows. It never shows a sad or depleted state.
```

**Done when:**
- [ ] Garden renders with correct number of plants for test session data
- [ ] Same session data = same garden layout on reload (seed-based)
- [ ] Ambient sway is visible but subtle
- [ ] Tapping a plant shows a label briefly
- [ ] 0 sessions = empty garden, bare soil only
- [ ] 10 sessions = visible growth (multiple leaves/stems)
- [ ] Garden accessible from /today via the garden icon

**Commit:**
```bash
git add . && git commit -m "feat: focus garden, SVG watercolour plants, ambient sway, session-seeded layout"
```

---

## Session 8: Focus Rhythm (Screen 5)

**Time: 45–60 min**

**Goal:** 30-day heatmap renders accurately. Empty days are neutral. Session days glow warmly. Pattern insight appears after 2+ weeks of data.

**Read:** PRD → Section 4 (Screen 5)

**Claude Code prompt:**
```
Read docs/PRD.md Section 4 Screen 5 (Focus Rhythm).

Build src/app/rhythm/page.tsx.

1. 30-day heatmap:
   - 30 small squares (24px × 24px), border-radius 6px, 4px gap
   - 5 rows × 6 columns (or 7 columns for week alignment — pick what looks better)
   - Colour scale by session count:
     0 sessions → --ff-stone-200 (neutral grey, never labelled "missed")
     1 session → --ff-ocean-100
     2 sessions → --ff-ocean-200
     3+ sessions → --ff-ocean-400
   - No streak counter. No percentage. No "personal best." No labels at all — just the colour.

2. Pattern insight (only shows after data from 14+ distinct days):
   - "You tend to focus best on [day]." — DM Sans 14px, --ff-ink-soft, below the heatmap
   - Compute: which day-of-week has the highest average session count
   - If not enough data: show nothing (no placeholder text)

3. Page header: small back arrow to /today. Title: "Your focus rhythm" — DM Sans 14px weight 500, --ff-ink-soft (not prominent, not Fraunces).

4. The heatmap is the only thing on this page. Generous whitespace. Nothing else.

5. Access: Add a small "rhythm" link to /today (visible only after totalSessionsCompleted >= 10 — progressive disclosure). Show it as a soft line below the task cards: "Your focus rhythm is starting to show." — DM Sans 11px, --ff-ink-muted, tap to navigate to /rhythm.
```

**Done when:**
- [ ] 30 squares render with correct colours based on real IDB data
- [ ] 0-session days are neutral grey, never look like a failure state
- [ ] Rhythm insight only shows after 14+ days of data
- [ ] Link to /rhythm only shows after 10+ total sessions
- [ ] At 390px: heatmap is comfortable, no overflow

**Commit:**
```bash
git add . && git commit -m "feat: focus rhythm heatmap, pattern insight, progressive access"
```

---

## Session 9: Onboarding Flow

**Time: 45–60 min**

**Goal:** First-time users see a 3-step onboarding. It primes identity thinking. No account required. After step 3, user lands on Today screen with their first task pre-filled.

**Read:** PRD → Section 8 (Onboarding Flow)

**Claude Code prompt:**
```
Read docs/PRD.md Section 8 (Onboarding Flow).

Build src/app/onboarding/page.tsx — a 3-step single-page flow (no route changes between steps, just state transitions).

Step 1 — Identity:
- Full screen. Fraunces 24px: "What kind of person do you want to be at work?"
- Three tap-to-select cards (not a form):
  · "Someone who finishes what matters"
  · "Someone who works without burning out"
  · "Someone who stops putting things off"
- Selecting one highlights it (--ff-ocean-50 bg, --ff-ocean-400 border). Then "Continue" button appears.
- This selection is NOT stored anywhere. It's a psychological primer only.

Step 2 — Habit Stack:
- "When's your usual quiet moment?" — Fraunces 20px
- 5 option chips: Morning / After lunch / Afternoon / Evening / It varies
- Selecting one stores it to localStorage as preferredTime. Used to set a default notification time (V2). For now, just stored.
- "Continue" button.

Step 3 — First Task:
- "What's one thing you want to focus on today?" — Fraunces 20px
- Single text input, large, friendly.
- Button: "Start my first session." (not "Submit", not "Continue")
- On tap: save the task name to today's Day record, navigate to /today with the task pre-filled.

Onboarding gating: check localStorage for 'ff_onboarded'. If not set, redirect to /onboarding from the opening screen. After Step 3: set 'ff_onboarded' = '1'.

Transitions between steps: 320ms ease-in-out fade (--ff-ease-screen).
```

**Done when:**
- [ ] Fresh visit (no ff_onboarded) → redirected to /onboarding
- [ ] All 3 steps render and transition correctly
- [ ] Step 1 selection highlights correctly, does not save to storage
- [ ] Step 2 saves preferredTime to localStorage
- [ ] Step 3 saves task, sets ff_onboarded, navigates to /today with task pre-filled
- [ ] Returning user (ff_onboarded set) skips onboarding entirely
- [ ] At 390px: all steps comfortable

**Commit:**
```bash
git add . && git commit -m "feat: onboarding flow, identity primer, habit stack, first task, gating"
```

---

## Session 10: Sound System Polish + Focus Integrity UI

**Time: 45–60 min**

**Goal:** All 5 ambient sounds loop seamlessly. Sound preference persists across sessions. Focus integrity interruption summary appears at session end. Focus Rhythm shows interruption patterns.

**Read:** PRD → Section 6 (Sound Design), Section 7 (Focus Integrity)

**Claude Code prompt:**
```
Read docs/PRD.md Section 6 (Sound Design) and Section 7 (Focus Integrity Tracking).

1. Seamless audio looping:
   - In src/lib/audio.ts: use Web Audio API AudioBufferSourceNode (not HTML5 Audio) for gapless looping. Set loop = true on the source node. This eliminates the gap that HTML5 Audio has at loop points.
   - Fade out (200ms linear gain ramp) before stopping or switching sounds.
   - Persist last-used sound to localStorage as 'ff_last_sound'. Pre-select it on next session.

2. Focus integrity summary (add to session completion flow in Screen 2):
   - After completing a session with interruptions: show soft inline text below the arc: "22 of 25 minutes in focus." — DM Sans 12px, --ff-ink-muted. Only if there were interruptions.
   - If no interruptions: show nothing (no score, no "100% focused" — no performance framing).

3. Focus Rhythm secondary layer (add to /rhythm):
   - Below the heatmap, show one soft line if average interruptions > 1 per session: "You tend to focus longer in the [morning/afternoon/evening]." — DM Sans 12px, --ff-ink-muted.
   - Only show after 10+ sessions. Neutral language only — never "you were distracted."

PRD language rule: never use "distracted". Never use "score". Treat interruption data as neutral information.
```

**Done when:**
- [ ] All 5 sounds loop with no audible gap at the loop point
- [ ] Switching sounds mid-session fades out cleanly
- [ ] Last-used sound persists to next session
- [ ] "22 of 25 minutes in focus." appears only when there were interruptions
- [ ] No interruptions = no score shown
- [ ] Rhythm view shows time-of-day insight after 10+ sessions

**Commit:**
```bash
git add . && git commit -m "feat: gapless audio looping, sound persistence, focus integrity summary"
```

---

## Checkpoint B: Full Loop Test (30 min)

**Deploy to Vercel. Run the complete user journey on a real phone.**

- [ ] Fresh install: onboarding → opening → tasks → session → break → end of day
- [ ] Garden grows after session completion
- [ ] Timer continues when phone locks or switches apps
- [ ] All sounds play on mobile (iOS Safari, Android Chrome)
- [ ] Add to homescreen works (PWA manifest present)

**Fix any failures before continuing to Session 11.**

---

## Session 11: PWA Finalization

**Time: 30–45 min**

**Goal:** App installs as PWA on iOS and Android. Offline works for core flow. Service worker caches assets.

**Claude Code prompt:**
```
Read docs/PRD.md Section 12 (Technical Decisions — PWA).

1. Add next-pwa or configure next.config.js with a custom service worker. The service worker should:
   - Cache all static assets (JS, CSS, fonts)
   - Cache all audio files in /public/audio/
   - Cache the app shell (/, /today, /session, /break, /close, /garden, /rhythm)
   - Serve cached content when offline

2. Web App Manifest (public/manifest.json):
   - name: "Focus & Flow"
   - short_name: "Focus"
   - start_url: "/"
   - display: "standalone"
   - background_color: "#F4F8F7"
   - theme_color: "#2E7D8A" (--ff-ocean-600)
   - Icons: 192×192 and 512×512 (generate simple SVG-based icons using the ocean palette)

3. Offline banner: if navigator.onLine === false, show a soft, non-intrusive banner at top: "You're offline. Your sessions are saved locally." — DM Sans 12px, --ff-ocean-50 background.

4. Add <link rel="manifest"> and appropriate meta tags to layout.tsx.
```

**Done when:**
- [ ] "Add to Home Screen" prompt appears on mobile browsers
- [ ] App opens from home screen in standalone mode (no browser chrome)
- [ ] Core flow works offline after first load
- [ ] Offline banner appears when WiFi off
- [ ] Audio files cached (no network needed after first load)

**Commit:**
```bash
git add . && git commit -m "feat: PWA, service worker, offline caching, manifest, install support"
```

---

## Session 12: Dark Mode + Responsive Polish

**Time: 30–45 min**

**Goal:** Dark mode is seamless. Every screen looks intentional at 390px and 768px. No layout breaks.

**Claude Code prompt:**
```
Read docs/PRD.md Section 11.9 (Dark Mode) and Section 10 (Design Direction).

Audit every screen (Opening, Today, Session, Break, End of Day, Garden, Rhythm, Onboarding) for:

1. Dark mode: all colours use CSS variables, dark mode overrides from Section 11.9 apply correctly. Test by forcing prefers-color-scheme: dark in DevTools.

2. Typography: Fraunces is used only where specified (opening message, screen titles, garden screen, day close). DM Sans everywhere else. No system fonts anywhere.

3. Spacing: every screen uses --ff-padding-screen (24px 20px). Cards use --ff-padding-card (16px 20px). Gap between task cards: 8px.

4. Touch targets: all interactive elements are at minimum 44px tall. Check buttons, task cards, sound pills, onboarding options.

5. Animation: nothing "snaps" — every transition uses one of the --ff-ease-* tokens. The SVG arc fills "like water rising, not like a loading bar."

6. Focus Garden: on screens wider than 600px, the garden sits in a centred 480px container with whitespace around it — it does not stretch full width on desktop.

Fix every issue found. No new features.
```

**Done when:**
- [ ] Every screen correct in dark mode (no hardcoded whites or blacks)
- [ ] All touch targets ≥ 44px
- [ ] No layout breaks at 390px
- [ ] Garden centred with whitespace on desktop
- [ ] Transitions feel unhurried, nothing snaps

**Commit:**
```bash
git add . && git commit -m "fix: dark mode audit, touch targets, spacing consistency, transition polish"
```

---

## Session 13: Edge Cases + Delight Layer

**Time: 60 min**

**Goal:** All empty states are warm and intentional. Returning after absence feels welcoming. First session completion is a moment.

**Claude Code prompt:**
```
Read docs/PRD.md Section 4 (all screens) and Section 9 (Language & Copy Principles).

Audit all empty and edge states:

1. Empty states:
   - /today with no tasks filled: the 3 card slots show a very faint placeholder text — "What's the most important thing today?" in the first slot only, --ff-ink-muted, DM Sans 11px italic. Second and third: no placeholder.
   - /rhythm with < 3 days of data: show only the heatmap (with empty squares). No text. No prompt to "add more sessions."
   - /garden with 0 sessions: show bare soil + a single small stone. No text. The emptiness should feel peaceful, not abandoned.

2. Copy audit (PRD Section 9 — verify these strings are nowhere in the codebase):
   - "missed" · "failed" · "incomplete" · "streak" · "productivity" · "track your habits" · "complete your tasks" · exclamation marks
   Run a case-insensitive search. Fix any violations.

3. First session ever completion (special moment):
   - The garden growth animation is slightly longer (2s instead of 1.5s)
   - After navigating to /break, the break screen first shows: "Your garden just started growing." — Fraunces 16px, --ff-ink-soft, fades out after 2s then the normal break screen content appears.
   - This only fires once (check totalSessionsCompleted === 1).

4. Return after 3+ day gap:
   - The opening screen message uses the "gap-return" category from messages.ts
   - Verify this triggers correctly

5. All buttons pass the language rules: never "Submit", "Confirm", "Done". Check every button label.
```

**Done when:**
- [ ] No forbidden words in codebase (grep clean)
- [ ] Empty garden is peaceful, not sad
- [ ] First session completion has special moment on break screen
- [ ] Gap-return message triggers correctly after simulating a 3-day gap
- [ ] All button labels pass language rules

**Commit:**
```bash
git add . && git commit -m "feat: edge cases, empty states, first-session moment, copy audit"
```

---

## Session 14: Launch Prep

**Time: 30–45 min**

**Goal:** App is production-ready. Performance is clean. No console errors.

**Claude Code prompt:**
```
Pre-launch audit for Focus & Flow:

1. Performance:
   - Run Lighthouse on the deployed Vercel URL. Target: Performance > 90, Accessibility > 90.
   - Ensure Fraunces and DM Sans are loaded with display=swap and preconnect hints.
   - Audio files: verify all 5 are under 500kb. If any exceed, flag for re-encoding.
   - No unnecessary re-renders (check React DevTools Profiler on /session during timer tick).

2. Error handling:
   - IDB unavailable (private browsing): catch the openDB error and show a soft message: "Local storage isn't available in private browsing. Your sessions won't be saved." — DM Sans 12px, --ff-ink-muted, dismissible.
   - Audio file load failure: fail silently. Session continues without sound. No error toast.
   - Web Worker not supported: fall back to setInterval with a warning logged (not shown to user).

3. Metadata (layout.tsx):
   - <title>Focus & Flow</title>
   - <meta name="description" content="A calm daily focus ritual. Three tasks. One session at a time.">
   - Open Graph tags (og:title, og:description, og:image placeholder)
   - <meta name="theme-color" content="#2E7D8A">

4. Clean up:
   - Remove any console.log statements
   - Remove any TODO comments that weren't resolved
   - Verify no hardcoded hex values in any component (all should use CSS variables)

5. Deploy final build to Vercel. Confirm live URL works end to end on mobile.
```

**Done when:**
- [ ] Lighthouse Performance > 90 on mobile
- [ ] Zero console errors on any screen
- [ ] IDB failure handled gracefully
- [ ] No console.log in production build
- [ ] All 5 audio files under 500kb
- [ ] Live Vercel URL: full loop works on real phone

**Commit:**
```bash
git add . && git commit -m "feat: launch prep, Lighthouse audit, error handling, metadata, console cleanup"
```

---

## Appendix: Common Failure Modes

**Timer drifts over long sessions:** Use `performance.now()` in the Web Worker, not `Date.now()`. Drift with `setInterval` + `Date.now()` over 25 min can be 5–10s.

**Audio gap on loop:** HTML5 Audio always has a gap. Must use Web Audio API AudioBufferSourceNode with `loop = true`.

**Garden layout shifts on reload:** Garden plant positions must be seeded from `firstSessionDate`. If using `Math.random()` without a seed, positions change every render.

**IDB fails silently in private browsing:** Always wrap `openDB()` in try/catch. IndexedDB throws in private mode in some browsers.

**PWA not installable:** Manifest must have icons at 192px and 512px. Without them, Chrome won't show the install prompt.

**Web Worker not loading in Next.js:** Use `new Worker(new URL('../workers/timer.worker.ts', import.meta.url))`. The `import.meta.url` pattern is required for Next.js to bundle the worker correctly.

**Fonts not loading on Vercel:** Ensure `next/font/google` is used (not a `<link>` tag). The `<link>` tag approach causes FOUT in production.
