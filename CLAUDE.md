# Focus & Flow — Claude Code Context

## Project Overview

Focus & Flow is a calm productivity PWA for people who know what they need to do and still can't make themselves start. The core loop: name up to 3 tasks, run Pomodoro-style Focus Sessions (called exactly that — never "Pomodoro"), complete the day with a brief reflection. A secondary mechanic — the Focus Garden — is a living SVG visual record of every session ever completed. It never dies, never punishes absence. Everything in this app — language, layout, sound, colour, animation — is tuned to reduce anxiety, not add pressure.

Built on: Atomic Habits (James Clear) — identity language, Never Miss Twice, systems over goals. See docs/PRD.md Section 2 for the full philosophical foundation.

## Architecture

Local-first PWA. No backend for V1. All session/day data stored in IndexedDB. No auth, no Supabase, no API routes until V2.

```
src/
  app/
    page.tsx                  → Opening Screen (Screen 0) — contextual message + CTA
    today/page.tsx            → Today's Tasks (Screen 1) — 3 task cards + start button
    session/[taskId]/page.tsx → Focus Session (Screen 2) — full-screen timer
    break/page.tsx            → Break Screen (Screen 3) — breathing animation, break timer
    close/page.tsx            → End of Day (Screen 4) — summary + reflection
    close/done/page.tsx       → "Rest well." closing screen
    rhythm/page.tsx           → Focus Rhythm (Screen 5) — 30-day heatmap
    garden/page.tsx           → Focus Garden (Screen 6) — SVG watercolour garden
    onboarding/page.tsx       → 3-step onboarding (first-time only)
  components/                 → Shared UI components
  lib/
    db.ts                     → IndexedDB wrapper (Session + Day CRUD, getGardenState)
    audio.ts                  → Web Audio API manager (gapless looping, fade out)
    garden.ts                 → Garden state calculator + SVG renderer
    messages.ts               → Opening screen message logic (30+ contextual messages)
    progressive.ts            → Progressive disclosure tracker (localStorage counter)
  workers/
    timer.worker.ts           → Web Worker — keeps timer running when tab is backgrounded
public/
  audio/
    rain.ogg                  → Soft rain, no thunder, 2-3 min seamless loop
    lofi.ogg                  → Gentle instrumental, no lyrics, 2-3 min loop
    brown-noise.ogg           → Deep warm noise, 2-3 min loop
    cafe.ogg                  → Quiet café murmur, 2-3 min loop
    forest.ogg                → Birdsong and light wind, 2-3 min loop
  manifest.json               → PWA manifest
docs/
  PRD.md                      → Full product spec (13 sections — read before every session)
  SESSION_PLAYBOOK.md         → Build sessions in order — the only doc you follow linearly
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + CSS custom properties (design tokens) |
| Data | IndexedDB via `idb` library |
| Audio | Web Audio API (AudioBufferSourceNode — gapless loops) |
| Timer | Web Worker (`timer.worker.ts`) |
| Animations | CSS keyframes + SVG animation |
| Deployment | Vercel |
| Auth / Backend | None in V1 |

## Design Tokens

All design tokens live in `src/app/globals.css` as CSS custom properties. **Never use hardcoded hex values in any component.** Always reference the variable.

Key tokens:
- `--ff-bg`: #F4F8F7 (light) / #0B1E1C (dark) — always the app background
- `--ff-surface`: #FFFFFF (light) / #132220 (dark) — card backgrounds
- `--ff-ocean-600`: #2E7D8A — primary buttons, timer arc, links
- `--ff-ocean-400`: #5BAAB4 — filled session dots, active states
- `--ff-ocean-100`: #D6ECEF — borders, empty dots, timer track
- `--ff-ink`: #1A2E2A — primary text
- `--ff-ink-soft`: #3D5452 — secondary text
- `--ff-ink-muted`: #6B8280 — placeholders, labels, hints
- `--ff-font-display`: 'Fraunces' — headings, opening message, emotional moments
- `--ff-font-body`: 'DM Sans' — all UI copy, labels, buttons, task names, timer

## Key Constraints

- **Mobile-first.** Design at 390px. Max-width 480px centred for content. Garden: 480px on desktop.
- **Dark mode is first-class.** Use CSS variables for ALL colours. Dark mode overrides are in globals.css.
- **Design tokens only.** Never hardcode hex, px sizes that conflict with the scale, or font-family strings in components.
- **Local-first.** IndexedDB for Session and Day data. localStorage ONLY for: progressive disclosure counter, onboarding flag, last-used sound, preferred time.
- **Timer must survive tab switches.** Use the Web Worker. `setInterval` in the main thread will throttle when backgrounded.
- **Audio is gapless.** Use `AudioBufferSourceNode` with `loop = true`. HTML5 Audio has loop gaps.
- **Audio files are local.** Never reference external audio URLs.
- **Language rules (PRD Section 9):** Never use: "missed", "failed", "incomplete", "streak broken", "productivity", "track your habits", "complete your tasks", exclamation marks.
- **Progressive disclosure.** Every feature unlock is silent. Never announce a new feature. It is discovered.
- **Buttons:** Never "Submit", "Confirm", "Done". Use: "Begin.", "I'm ready.", "Start my first session.", "Close the day.", "Back to focus.", "Done for now."

## Fonts

Loaded via `next/font/google` in `layout.tsx` (not a `<link>` tag — causes FOUT in production):
- **Fraunces** (display, headings): Opening message, screen titles, garden screen, day close summary
- **DM Sans** (body, UI): Task names, timer, labels, buttons, all UI copy

**Never use system UI fonts anywhere in the app.**

## Audio Files

Located in `/public/audio/`. OGG Vorbis format. 2–3 minute seamless loops, ~2 MB per file. Looped via `AudioBufferSourceNode` with `loop = true` (Web Audio API decodes to PCM — OGG works in all browsers including Safari via this path).
- `rain.ogg` — soft rain, no thunder
- `lofi.ogg` — gentle instrumental, no lyrics
- `brown-noise.ogg` — deep warm noise
- `cafe.ogg` — quiet café murmur, distant voices
- `forest.ogg` — birdsong, light wind, leaves

## Progressive Disclosure Milestones

Tracked via `src/lib/progressive.ts` (localStorage: `ff_session_count`):

| Count | Unlock |
|---|---|
| 1 | Garden icon appears on /today. First sprout in garden. |
| 3 | "Your reset:" field on break screen. |
| 5 | "What would make finishing this feel good?" prompt on selected task. |
| 10 | "Your focus rhythm is starting to show." link to /rhythm on /today. |
| 20 | Pattern insight in /rhythm ("You tend to focus best on..."). |

**Nothing is ever announced.** All unlocks appear silently and are discovered.

## Screen Map

| Route | Screen | Notes |
|---|---|---|
| `/` | Opening Screen (0) | Contextual message, 300ms button delay |
| `/today` | Today's Tasks (1) | 3 task cards, session dots, start button |
| `/session/[taskId]` | Focus Session (2) | Full-screen, timer, sounds, focus integrity |
| `/break` | Break Screen (3) | Breathing animation, counts-up timer |
| `/close` | End of Day (4) | Summary, reflection prompts |
| `/close/done` | Rest Well | Final quiet screen, "Rest well." |
| `/rhythm` | Focus Rhythm (5) | 30-day heatmap, pattern insight |
| `/garden` | Focus Garden (6) | SVG watercolour garden |
| `/onboarding` | Onboarding | First-time only, gated by `ff_onboarded` |

## Do Not

- Do not add a backend, API routes, or Supabase in V1.
- Do not use any UI component library (no shadcn, no Ant Design, no Radix primitives). Tailwind + custom components only.
- Do not use React class components.
- Do not add console.log to production code.
- Do not hardcode any hex colour values in components. Use CSS variables.
- Do not use gamification patterns: points, levels, badges, streaks, leaderboards, XP.
- Do not show failure states: broken streaks, red indicators, missed-day counts, completion percentages.
- Do not use Forest's loss-aversion mechanic. The garden accumulates, never depletes.
- Do not add a 4th task slot. The 3-task constraint is intentional and must never be worked around.
- Do not use `Math.random()` for garden plant positioning — seed from `firstSessionDate` so the layout is consistent across reloads.
- Do not put secrets in `NEXT_PUBLIC_` env vars. There are no secrets in V1 — keep it that way.

## Reference Documents

- `docs/PRD.md` — Full product spec. Read the relevant section before every Claude Code prompt.
- `docs/SESSION_PLAYBOOK.md` — Build sessions in order. Do not skip done-checks.
