# Focus & Flow — Product Specification Document
**Version 1.1 | Pre-Build Brief for Claude Code**

---

## 1. What This App Is

Focus & Flow is a calm productivity app built for people who know exactly what they need to do — and still can't make themselves start.

It is not a task manager. It is not a habit tracker. It is not a Pomodoro timer.

It is a **daily focus ritual** — a structured, emotionally safe space that makes beginning feel low-cost, progress feel visible, and showing up feel like enough.

The core mechanic: the user names up to three tasks, links each one to a Pomodoro-style focus session (called a **Focus Session**), and works through them one session at a time. The app tracks sessions against tasks automatically. The day closes with a brief, gentle reflection.

Everything about the design — language, layout, sound, colour, transitions — is tuned to reduce anxiety, not add pressure.

A secondary mechanic — the **Focus Garden** — gives users a living, visual record of every session they complete. It grows quietly over time. It never dies. It never punishes absence. It is the visible proof that they are becoming the person they want to be.

---

## 2. Philosophical Foundation

### 2.1 Atomic Habits (James Clear) — The Core Framework

Every product decision in this app is filtered through four questions drawn from Clear's Four Laws of Behaviour Change:

| Law | Question | How the app answers it |
|---|---|---|
| Make it obvious | Is the cue impossible to miss? | Opening the app = the cue. One screen. One prompt. |
| Make it attractive | Does starting feel appealing? | The focus screen feels like closing the door on noise. Sound, design, language all work together. |
| Make it easy | Is friction near zero? | Tasks pre-fill from yesterday. One tap to start. No configuration required. |
| Make it satisfying | Is there immediate reward? | Session completion animation. Focus Garden grows. Calm summary. Visual rhythm. Identity language throughout. |

**The master principle:** Every action the user takes in this app is a vote for the identity "I am a focused person." The app's job is to make casting that vote feel almost effortless — and deeply meaningful.

**Other Atomic Habits principles embedded in the product:**

- **Two-Minute Rule:** The minimum viable action is pressing Start — not completing a task, not finishing a session. Showing up is the win.
- **Never Miss Twice:** The app never references missed days. No streak counters. No guilt language. Return after a week away and the app greets you the same way it always does.
- **Systems over Goals:** No deadlines, no targets, no completion percentages. The app builds a focus system. Output is the byproduct.
- **Progressive Disclosure:** The app earns the right to ask more by first delivering value with almost nothing asked. Depth unlocks after the habit is established (see Feature Progression, section 5).
- **Identity Language:** Every copy string speaks to who the user is becoming. Never what they failed to do.
- **1% Compounding:** Progress is shown as rhythm, not performance. Warmth accumulates. No charts, no percentages.
- **Habit Stacking:** During onboarding, the app anchors itself to an existing daily routine the user already has.
- **Goldilocks Rule:** Default session is 25 minutes. A 15-minute "light session" is offered on low-energy days — framed as intelligent, not lesser.

### 2.2 Atom App (Reference Inspiration)

Atom is a meditation app that gets several things right that productivity apps consistently miss:

- **No ads. No mandatory sign-up.** The user experiences value before being asked for anything.
- **Tiny entry points.** The smallest possible version of the habit is the default.
- **Invisible behaviour science.** The framework is never named. The user just feels it working.
- **Sound and voice as design elements.** Not notifications. Not beeps. Calming, intentional audio.
- **Non-punitive progress.** Missing days doesn't destroy the visual record.

Focus & Flow applies all five of these to the productivity context.

### 2.3 The Original Journal (Your Starting Point)

The emotional core of your offline journal carries forward intact:

- 3 tasks only — never more
- Pomodoro rhythm with soft language ("Focus Sessions," never "Pomodoro")
- Pause reminders built into the break screen
- End-of-day clarity as a closing ritual
- Language of presence, not pressure
- Spacious, non-judgmental design

---

## 3. Target Group

### 3.1 The One-Sentence Definition

People who know exactly what they need to do — and still can't make themselves start. Not lazy. Not disorganised. Overwhelmed, anxious about beginning, and exhausted by productivity culture telling them to do more.

### 3.2 Three Personas

**Persona 1 — The Overwhelmed Professional**
Age 25–35. Knowledge worker. Remote or hybrid. Busy all day, productive for nothing. Has 47 tabs open and hasn't done the one important thing. Confuses activity with output. Wants to protect 2 hours of real work inside a chaotic day.
Core quote: *"I've been in meetings all day and done nothing that actually matters."*

**Persona 2 — The Anxious Creative**
Age 22–32. Freelancer, designer, writer, founder. Works best under pressure — but creates the pressure by procrastinating. Perfectionism masquerading as high standards. The blank canvas is the enemy.
Core quote: *"I work best under pressure, but I create the pressure by procrastinating."*

**Persona 3 — The Burnt-Out Achiever**
Age 28–40. Used to be high-performing. Now coasting and feeling guilty about it. Every productivity app feels like a reminder of how much they're falling short. Needs a gentle re-entry, not a challenge.
Core quote: *"I used to be so disciplined. I don't know what happened."*

### 3.3 What All Three Share

- Knows what to do. Can't make themselves start. (Task-onset anxiety, not laziness.)
- Has tried multiple apps. Abandoned all of them.
- Responds emotionally to design — calm UI produces a calmer brain.
- Chronic productivity guilt.
- Wants to feel like a focused person, not perform focus for an app.

### 3.4 Who This Is NOT For

- The hyper-optimiser (wants time-blocking, OKRs, deep metrics → use Sunsama or Motion)
- The GTD practitioner (needs capture, projects, contexts, tags → use Things or Todoist)
- Students (different rhythm, different emotional triggers)
- People in fully meeting-structured days with no autonomous time blocks

---

## 4. App Architecture — Screens and Flow

### Screen 0: Opening Message (Splash/Entry)
**Every time the app opens.**

A full-screen, minimal screen. Soft background. One line of text drawn from the Atomic Habits philosophy. Then a single button: **"Let's begin."**

The message is contextual, not random:

| Context | Message tone | Example |
|---|---|---|
| First ever open | Identity-setting | *"You don't need to do more. You just need to start."* |
| Returning after 3+ day gap | Forgiving re-entry | *"You're back. That's the only thing that matters right now."* |
| Regular returning user | Rotating principle | 20–30 messages drawn from Atomic Habits themes |
| Monday | Weekly intention | *"One focused week begins with one focused session."* |
| After 10+ sessions total | Deepening | *"Small sessions, consistently. That's how focus compounds."* |

**Design notes:**
- No logo. No app name. Just the message and the button.
- Typography: large, generous, unhurried.
- Background: soft gradient or subtle texture — never white flat.
- The button label is never "Get Started" or "Continue." It rotates softly: "Let's begin." / "I'm ready." / "Begin."
- Message stays on screen for a breath before the button appears (300ms delay). Creates presence.

---

### Screen 1: Today's Tasks
**The heart of the app. Shown after every opening message.**

Three task input slots. Nothing else. Clean, spacious.

**Layout:**
```
Today                           [date, soft]

  ┌─────────────────────────────────┐
  │  Task 1                    ○○○○ │  ← session dots (empty)
  └─────────────────────────────────┘
  ┌─────────────────────────────────┐
  │  Task 2                    ○○○○ │
  └─────────────────────────────────┘
  ┌─────────────────────────────────┐
  │  Task 3                    ○○○○ │
  └─────────────────────────────────┘

        [  Start Focusing  ]
```

**Behaviour rules:**

- Maximum 3 tasks. No add button for a 4th. The constraint is the feature.
- All 3 slots are optional. User can start with just 1 task filled in.
- Tasks pre-fill from yesterday for returning users. Editable, clearable.
- The 4 session dots next to each task are empty circles on load. They fill as sessions are completed against that task.
- Tapping a task selects it (subtle highlight). Selected task = the one the session will run against.
- If no task is selected when user taps "Start Focusing," the first filled task is auto-selected.
- "Start Focusing" button is always visible. Never greyed out. Even if no tasks are filled, user can start a free-form session.

**Progressive disclosure (unlocks at session 5):**
A soft optional prompt appears below the selected task: *"What would make finishing this feel good?"* — one line, no asterisk, completely skippable. Introduced gently, never forced. See section 5.

---

### Screen 2: Focus Session (Timer Screen)
**The sanctuary. Full screen. Minimal.**

This screen should feel like closing the door to a quiet room.

**Layout:**
```
[task name — soft, top center]

        [circular progress arc]
             25:00
        counting down gently

   ○  Rain        ○  Lo-fi
   ○  Brown noise  ○  Silence
   ●  Café murmur               ← selected sound

        [  Pause  ]
```

**Behaviour rules:**

- Full screen. Navigation bar hidden. No other UI.
- Task name visible at top but soft — present, not demanding.
- Circular arc progress indicator. Fills as time passes. Never depletes — framed as accumulating, not counting down.
- Timer shows minutes and seconds.
- Sound selection shown as small soft pills at the bottom. User can change during session.
- Sounds play inside the app. No external links. No YouTube.
- "Pause" is the only action. Tucked, not prominent. Using it is not failure.
- If user leaves the app (switches to another app): session continues running, a log note is created ("focus interrupted at 14:22"), and when they return, the app shows them softly: "You stepped away. Want to keep going or close this session?"

**On session completion:**
- The circular arc completes with a quiet animation — gentle, satisfying. Not confetti. Not a loud chime.
- A soft sound plays (a single, calm tone).
- The task's session dot fills in on the task list.
- A small, subtle garden growth animation plays briefly — a new leaf unfurling, a stem extending. Lasts 1.5 seconds. Quiet. Then the app transitions to Break Screen.
- Transition to Break Screen automatically.

---

### Screen 3: Break Screen
**Appears automatically after every completed session.**

This screen is a product moment in itself. Not a gap between sessions. A designed experience.

**Layout:**
```
        Session complete.

   [breathing animation — gentle expanding/contracting circle]

   Take a real break.

   ○  Stretch      ○  Walk
   ○  Water        ○  Breathe
   ○  Step outside ○  Eyes closed

   Your reset:  _______________     [optional, skippable]

   [  5:00  — break timer, counting up ]

         [  Back to focus  ]    [  Done for now  ]
```

**Behaviour rules:**

- Break timer counts UP (how long you've rested), not down (pressure to return).
- "Back to focus" returns to timer for another session on the same task.
- "Done for now" returns to Today screen.
- The breathing animation runs on its own. Soft, looping, calming.
- Break suggestions are not checkboxes. Just gentle options. No tracking of whether they did them.
- The "your reset" line is a tiny optional text field for a personal note. Appears after session 3 total (progressive disclosure).

---

### Screen 4: End of Day (Close the Day)
**Triggered by user, or offered via gentle notification in the evening.**

**Layout:**
```
        You showed up today.

   ┌─────────────────────────────────┐
   │  3 sessions  ·  2 tasks touched │
   └─────────────────────────────────┘

   What worked well?
   _________________________________

   One thing to carry forward:
   _________________________________

        [  Close the day  ]
```

**Behaviour rules:**

- Session count and tasks touched are the only metrics shown. No percentages. No completion rates.
- Language is always affirmative: "You showed up today." Even if they did 1 session.
- If they did 0 sessions: "Tomorrow is a fresh start." No shame. No count shown.
- The two reflection prompts are optional. User can close without filling them.
- After closing: a final quiet screen. One line. *"Rest well."* Then the app goes dark.

---

### Screen 5: Focus Rhythm (History View)
**Accessible from Today screen. Not prominent. A quiet corner.**

A 30-day heatmap. Each day is a small square. Days with at least one session glow warmly — the more sessions, the warmer the colour. Empty days are neutral grey. Never labelled "missed." Never counted.

Below the heatmap, one soft insight: *"You tend to focus best on Tuesday mornings."* (Generated from patterns after 2+ weeks of data.)

**No streaks. No percentage completion. No "personal bests."**

---

---

### Screen 6: Focus Garden
**A living visual record of every session ever completed. Accessible from the Today screen. Never pushed at the user.**

This is the emotional reward layer of the app. Inspired by Forest but fundamentally different in one way: **nothing here ever dies or disappears.** Absence means the garden grows more slowly. It never punishes.

**The visual concept:**

The garden is a minimal, hand-drawn-style illustration that evolves over time. Think ink on paper — calm, organic, unhurried. Not pixel art. Not gamified icons. Something that looks like it belongs in a quiet sketchbook.

The garden starts completely empty. Bare soil. A single small stone. Over time it accumulates:

| Trigger | What appears |
|---|---|
| 1st session ever completed | A single small sprout. One leaf. |
| Each subsequent session | The sprout grows. New leaves. New stems. Slowly. |
| All 3 tasks touched in one day | A small flower blooms somewhere in the garden. |
| 7 days with at least one session | A tree appears in the background, small and young. |
| 30 sessions total | The tree has grown noticeably. A second plant appears. |
| 100 sessions total | The garden is full, lush, and clearly inhabited. |

**What the garden is NOT:**

- Not a streak counter wearing botanical clothing. Sessions from any day contribute, regardless of gaps.
- Not a collection mechanic with rarities, levels, or unlockable species.
- Not something that decays, wilts, or looks sad when the user hasn't shown up.
- Not the primary screen. It lives quietly and is discovered, not demanded.

**Interaction:**

The garden screen is largely non-interactive. The user can look at it. They can tap a plant to see a soft label: *"Grown from 3 sessions on Tuesday mornings."* That's the only interaction. No buttons. No actions. Just presence.

**The critical difference from Forest:**

Forest uses loss aversion — leave the app and your tree dies. That mechanic works but creates anxiety. Focus & Flow uses **accumulation and permanence** instead. Every session you've ever done is in this garden. Come back after two weeks away and the garden is exactly as you left it, waiting patiently. That is the Never Miss Twice principle made visual.

**Access:**

A small garden icon on the Today screen. No badge count. No notification. Just a soft icon that says: something is growing in here. Tap when you want to see it.

**Design notes for Claude Code:**

- Render as SVG — plants are procedurally generated from session data so they're always slightly unique.
- Each plant element is a simple SVG path — organic curves, not geometric shapes.
- Colour palette matches the app: soft greens, warm sage, muted earth tones. Never bright or saturated.
- The garden scene has subtle ambient animation — leaves move very slightly, as if in a gentle breeze. CSS animation, very slow (8–12 second cycle), low opacity shift. Creates life without demanding attention.
- On mobile: the garden fills the screen. On desktop: it sits in a centred container with generous whitespace around it.
- Garden state is derived entirely from the Session data model — no separate garden data model needed. On load, calculate total sessions, sessions per day, all-3-tasks days, and render the corresponding garden state.

---

## 5. Feature Progression (Progressive Disclosure)

The app earns the right to ask more. This is the core UX philosophy.

| Milestone | What unlocks | How it's introduced |
|---|---|---|
| Session 1 | Core experience only. First sprout appears in Focus Garden. | Garden icon appears softly on Today screen after first completion. |
| Session 3 | Break screen personal note field | Appears softly, skippable |
| Session 5 | "What would make this feel good?" prompt on task | One line, no asterisk, never forced |
| Session 7 | First flower blooms in garden (if 3 tasks touched in one day) | No announcement. User discovers it. |
| Session 10 | Focus Rhythm (history view) becomes accessible | A soft mention: "Your focus rhythm is starting to show." |
| Session 20 | Pattern insight in Focus Rhythm | "You tend to focus best on [day/time]" |
| Day 30 | Monthly reflection prompt | Offered once, not recurring unless user wants it |

**Rule:** Nothing new is introduced as a notification or alert. Everything unlocks silently and is discovered by the user. The app never announces its own features.

---

## 6. Sound Design

Sounds are built into the app. No external links. No YouTube.

**Focus session ambient sounds (choose one per session):**

| Sound | Description |
|---|---|
| Rain | Soft, steady rain. No thunder. |
| Lo-fi | Gentle instrumental loop. No lyrics. |
| Brown noise | Deep, warm noise. Excellent for deep focus. |
| Café | Quiet café murmur. Distant voices, no words. |
| Forest | Birdsong, light wind, leaves. |
| Silence | Nothing. Clean quiet. |

**UI sounds (minimal, intentional):**

| Moment | Sound |
|---|---|
| Session start | Single soft tone. Like a bowl being struck. |
| Session complete | Two tones, ascending. Warm, not sharp. |
| Break end (if user set a break target) | One gentle chime. |
| Day close | Soft fade. Almost inaudible. |

**Rule:** All sounds can be turned off globally in settings. The app never makes sound without the user's awareness.

---

## 7. Focus Integrity Tracking (Distraction Awareness)

When the user is in a Focus Session and switches to another app:

- The session timer continues running in the background.
- The moment is logged as a "focus interruption" with a timestamp.
- When the user returns: a soft, non-judgmental prompt appears: *"You stepped away at 14:22. Want to keep going or close this session?"*
- At the end of the session, the summary shows: *"22 of 25 minutes in focus."*
- Over time, this appears in the Focus Rhythm view as a secondary layer of insight — not as a score, but as a pattern.

**Platform notes for Claude Code:**

- **Web (PWA):** Use the `visibilitychange` and `blur`/`focus` events on `document` to detect tab/window switches. Most reliable on desktop browsers.
- **iOS:** Apps cannot monitor other apps. Focus integrity is limited to detecting when the app goes to background using `visibilitychange`.
- **Android:** `UsageStatsManager` API allows detecting app switches if the user grants permission. Request this permission with a clear, honest explanation during onboarding.

**Language rule:** The word "distracted" never appears in the app. The word "interrupted" is used once, then retired. The app treats focus integrity data as neutral information, not performance scoring.

---

## 8. Onboarding Flow

First-time users see a minimal, 3-step onboarding. No account required to start.

**Step 1 — Identity**
Full screen. Soft background. One question:
*"What kind of person do you want to be at work?"*
Three soft options to tap (not type):
- Someone who finishes what matters
- Someone who works without burning out
- Someone who stops putting things off

This is not stored as a data point. It's a psychological primer — it activates identity-based thinking before the user ever touches the app. (Atomic Habits: identity first.)

**Step 2 — Habit Stack**
*"When's your usual quiet moment in the day?"*
Options: Morning / After lunch / Afternoon / Evening / It varies
The app uses this to set a default notification time. Not mandatory.

**Step 3 — First Task**
*"What's one thing you want to focus on today?"*
One text field. No pressure. They type one task and tap "Start my first session."

No account creation. No email. No password. The app works immediately.
Account creation (optional, for sync) is offered after session 3.

---

## 9. Language & Copy Principles

Every string in the app is written against these rules:

**Never use:**
- "You missed..." / "You failed..." / "Incomplete"
- "Streak broken" / "Start over"
- "Productivity" (ironic but intentional — the word itself creates pressure)
- "Track your habits"
- "Complete your tasks"
- Exclamation marks (they create urgency and anxiety)

**Always use:**
- Present tense, gentle: *"You're building something."*
- Identity language: *"Focused people show up, even briefly."*
- Sufficiency language: *"One session is enough."*
- Return language: *"Welcome back."* (Never "You're back!" — no exclamation.)

**Button labels:**
- Never "Submit" / "Confirm" / "Done" (transactional, cold)
- Use: "Begin." / "I'm ready." / "Close the day." / "That's enough for now."

---

## 10. Design Direction

This is not a specification — it is a direction. The visual implementation should interpret these principles.

**Feeling:** A quiet Saturday morning. A clean desk. A warm drink. No urgency.

**Colour:** Soft neutrals as the base. One warm accent colour (a muted teal or warm sage — not blue, not purple, not the standard productivity palette). Dark mode is first-class, not an afterthought.

**Typography:** Not Inter. Not system UI. A characterful but calm typeface. Something with warmth and intention. Consider: DM Serif Display for headings (creates presence), DM Sans for body (clean, warm).

**Layout:** Generous whitespace. Never crowded. Each screen has one primary action. Secondary actions are visually subordinate.

**Animations:** Slow and intentional. Nothing snaps. Everything breathes. The circular session arc fills like water rising, not like a loading bar.

**No:** Dark patterns. Notification badges. Red indicators. Aggressive upsell. Comparison to other users.

---

## 11. Design System — Exact Values for Claude Code

This section contains every visual token needed to build the app. Use these values directly. Do not substitute generic defaults.

### 11.1 Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;1,9..144,300&family=DM+Sans:wght@400;500&display=swap');

--ff-font-display: 'Fraunces', Georgia, serif;   /* headings, opening message */
--ff-font-body:    'DM Sans', sans-serif;         /* all body, labels, buttons */
```

Usage rules:
- Fraunces for: opening message, screen titles, day close summary, garden screen
- DM Sans for: task names, timer, labels, buttons, all UI copy
- Never use system UI font anywhere in the app

### 11.2 Colour Palette

```css
/* Ocean — Primary */
--ff-ocean-50:  #F0F7F8;   /* backgrounds, hover states */
--ff-ocean-100: #D6ECEF;   /* borders, empty dots, timer track */
--ff-ocean-200: #A8D5DB;   /* subtle fills */
--ff-ocean-400: #5BAAB4;   /* filled session dots, active states */
--ff-ocean-600: #2E7D8A;   /* primary buttons, timer arc, links */
--ff-ocean-800: #164550;   /* dark text on light ocean fills */
--ff-ocean-900: #0B2830;   /* deep dark mode surfaces */

/* Mist — Secondary (Garden, accents) */
--ff-mist-50:  #F4F8F6;
--ff-mist-100: #DCF0EA;
--ff-mist-200: #B0D9CC;
--ff-mist-400: #6BB8A6;
--ff-mist-600: #3A8B7A;
--ff-mist-800: #1C4F47;

/* Stone — Neutral */
--ff-stone-50:  #F7F8F6;
--ff-stone-100: #EAECE8;
--ff-stone-200: #D2D7CE;
--ff-stone-400: #9BA59A;
--ff-stone-600: #6B8280;
--ff-stone-800: #3D5452;

/* Ink — Text */
--ff-ink:       #1A2E2A;   /* primary text */
--ff-ink-soft:  #3D5452;   /* secondary text */
--ff-ink-muted: #6B8280;   /* placeholders, labels, hints */

/* System */
--ff-surface:   #FFFFFF;   /* card backgrounds */
--ff-bg:        #F4F8F7;   /* app background — the "ocean air" base */
--ff-white:     #FFFFFF;
```

### 11.3 Typography Scale

```css
/* Display — opening message, emotional moments */
font-family: var(--ff-font-display);
font-size: 28px; font-weight: 300; letter-spacing: -0.02em; line-height: 1.45;

/* Heading — screen titles */
font-family: var(--ff-font-display);
font-size: 20px; font-weight: 400; letter-spacing: -0.01em; line-height: 1.4;

/* Body — task names, descriptions */
font-family: var(--ff-font-body);
font-size: 14px; font-weight: 400; line-height: 1.65;

/* Label — dates, section headers, metadata */
font-family: var(--ff-font-body);
font-size: 11px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase;

/* Button */
font-family: var(--ff-font-body);
font-size: 14px; font-weight: 500; letter-spacing: 0.01em;

/* Timer */
font-family: var(--ff-font-body);
font-size: 32px; font-weight: 300; letter-spacing: -0.03em;
```

### 11.4 Spacing Scale (Base 4px grid)

```css
--ff-space-1:  4px;
--ff-space-2:  8px;
--ff-space-3:  12px;
--ff-space-4:  16px;
--ff-space-6:  24px;
--ff-space-8:  32px;
--ff-space-12: 48px;
--ff-space-16: 64px;

/* Component-specific */
--ff-padding-card:   16px 20px;
--ff-padding-screen: 24px 20px;
--ff-gap-tasks:      8px;
--ff-gap-sections:   32px;
```

### 11.5 Border Radius

```css
--ff-radius-sm: 8px;    /* chips, sound pills, small elements */
--ff-radius-md: 12px;   /* task cards, input fields */
--ff-radius-lg: 18px;   /* main cards, containers */
--ff-radius-xl: 24px;   /* phone-style outer container */
--ff-radius-pill: 50px; /* buttons always pill-shaped */
```

### 11.6 Animation Tokens

```css
--ff-ease-micro:    180ms ease;                    /* hover, tap */
--ff-ease-screen:   320ms ease-in-out;             /* page transitions */
--ff-ease-complete: 600ms ease-out;                /* session arc fill */
--ff-ease-garden:   1500ms ease-in-out;            /* leaf unfurl reward */
--ff-ease-sway:     8000ms ease-in-out infinite;   /* garden ambient */
--ff-ease-fade:     400ms ease; /* with 300ms delay for opening btn */
```

### 11.7 Key Component Specs

**Primary button (all CTAs):**
```css
background: var(--ff-ocean-600);
color: #ffffff;
border: none;
border-radius: var(--ff-radius-pill);
padding: 13px 0;
width: 100%;
font-family: var(--ff-font-body);
font-size: 14px; font-weight: 500;
```

**Task card:**
```css
background: var(--ff-surface);
border: 0.5px solid var(--ff-ocean-100);
border-radius: var(--ff-radius-md);
padding: 12px 16px;
/* Active/selected state: */
border: 1px solid var(--ff-ocean-400);
background: var(--ff-ocean-50);
```

**Session dot (empty):** `7px × 7px circle, background: var(--ff-ocean-100)`
**Session dot (filled):** `7px × 7px circle, background: var(--ff-ocean-400)`

**Timer arc (SVG circle):**
```
Track circle:    stroke: var(--ff-ocean-100), stroke-width: 5, fill: none
Progress circle: stroke: var(--ff-ocean-600), stroke-width: 5, fill: none
                 stroke-linecap: round, transform: rotate(-90deg) from center
                 stroke-dasharray: circumference, stroke-dashoffset: animated
```

**App background:** `background: var(--ff-bg)` — #F4F8F7, always. Never white at the page level.

### 11.8 Focus Garden — SVG Watercolour Technique

```css
/* Each plant = 3–5 layered blurred ellipses */
/* Use feGaussianBlur stdDeviation 8–18 for wash effect */
/* Opacity range: 0.15 to 0.35 per layer */

Garden palette:
  Foliage:  #B0D9CC, #6BB8A6, #DCF0EA  (mist ramp, low opacity)
  Accents:  #A8D5DB, #D6ECEF            (ocean ramp, low opacity)
  Soil/ground: #D2D7CE, #EAECE8         (stone ramp)
  Sky wash: #F0F7F8 → #D6ECEF gradient  (very subtle, top of canvas)

/* Never: bright, saturated, or hard-edged elements in the garden */
/* Always: soft, overlapping, organic forms */
/* Ambient sway: CSS animation on plant groups, translateX ±2px, 8s cycle */
```

### 11.9 Dark Mode

The app supports dark mode. Key overrides:

```css
@media (prefers-color-scheme: dark) {
  --ff-bg:      #0B1E1C;   /* deep ocean night */
  --ff-surface: #132220;   /* card surface */
  --ff-ink:     #E8F4F2;   /* primary text */
  --ff-ink-soft: #9FC4BE;  /* secondary text */
  --ff-ink-muted: #6B9E98; /* muted text */
  --ff-ocean-100: #1A3A40; /* borders, empty dots */
  --ff-ocean-400: #5BAAB4; /* same — still readable */
  --ff-ocean-600: #4A9BA6; /* slightly lighter for dark bg */
}
```

---

## 12. Technical Decisions for Claude Code

**Platform:** Web app (PWA) first. Works on desktop and mobile browser. Add to homescreen supported.

**Auth:** Optional. Local-first by default. All data stored in browser (IndexedDB). Optional account for cross-device sync — offered post-session 3.

**Audio:** Web Audio API (`AudioBufferSourceNode`) with local files. No external audio sources. Files are OGG Vorbis format, 2–3 minute seamless loops, ~2 MB per file. Looped via `AudioBufferSourceNode` with `loop = true`.

**Timer:** `setInterval` with `performance.now()` for accuracy. Web Worker to keep timer running if tab is backgrounded. Background timer is important — do not lose session progress when user tabs away.

**Focus integrity:** `document.addEventListener('visibilitychange')` — log timestamp when `document.hidden === true`. Resume timestamp when it returns. Show delta to user.

**Data model (local):**
```
Session {
  id: uuid
  taskName: string
  taskId: string
  startTime: timestamp
  endTime: timestamp
  plannedDuration: number (minutes)
  actualFocusTime: number (minutes, adjusted for interruptions)
  interruptions: [ { leftAt: timestamp, returnedAt: timestamp } ]
  soundUsed: string
  completed: boolean
}

Day {
  date: string (YYYY-MM-DD)
  tasks: [ { id, name, sessionCount } ]
  closingReflection: { whatWorked: string, carryForward: string }
  sessionCount: number
}
```

**Progressive disclosure trigger:** Track `totalSessionsCompleted` in local storage. Each unlock threshold is checked on app load.

**Focus Garden rendering:** The garden state is derived entirely from the existing Session data — no separate data model needed. On garden screen load, compute:
```
GardenState {
  totalSessions: number         // drives overall garden density
  allThreeTaskDays: number      // drives flower count
  weeksWith1PlusSession: number // drives tree growth
  firstSessionDate: date        // garden "age" — affects background tone
}
```
Pass GardenState to the SVG renderer. All plant positions are seeded from `firstSessionDate` so the garden layout is consistent across loads (same user always sees the same garden, just more populated over time).

**Opening message:** A static array of 30+ messages categorised by context type (first-open, returning, gap-return, monday, etc.). Select by context logic, not random. No API call needed for this — keep it local and fast.

---

## 12. What This App Is Not Allowed to Become

These are guardrails. Any feature request that pushes toward these should be rejected:

- A full task manager with subtasks, due dates, priorities
- A social or comparison tool ("you focus more than 73% of users")
- A gamification system with points, levels, badges, or rare collectibles (the Focus Garden is allowed because it accumulates and never punishes — leaderboards, XP systems, and unlockable species are not)
- A calendar or scheduling tool
- A place that stores sensitive personal journal entries without encryption
- An aggressive notification system
- An app that shows failure states (broken streaks, red indicators, missed goals)

---

## 13. Success Metrics (Internal, Not User-Facing)

The app is working if:
- Users return on day 2 (the hardest retention point for productivity apps)
- Average session completion rate is above 70%
- Users describe the app as "calm" or "not stressful" in reviews
- Users do at least one session on 3+ days per week after week 2

The app is failing if:
- Users report feeling guilty when they open it
- Drop-off happens at the task input screen (too much friction)
- Session abandonment rate is above 40%
- Users say it feels like "another productivity app"

---

*End of product specification. Version 1.2.*
*Built on: Focus & Flow journal concept + Atomic Habits (James Clear) + Atom app design philosophy.*
*v1.1 adds: Focus Garden (section 4 Screen 6), garden growth on session completion, garden data model, progressive disclosure update.*
*v1.2 adds: Full design system (section 11) — colour tokens, typography, spacing, animation, component specs, garden SVG technique, dark mode.*
