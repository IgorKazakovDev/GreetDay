# Birthday Tracker — MVP Feature Specification for Design

**Audience:** Designer agent producing Penpot mockups
**Design tool:** Penpot (all deliverables live in one Penpot file, with the component library shared from it)
**Version:** 1.5 · 23 Oct 2026 (§2.2 sign-in components added in E10-S3) · 1.4 · 23 Oct 2026 (§2.1 tokens added in E10-S2) · 1.3 · 22 Oct 2026 (§2.1 tokens added in E10-S1; `dark` mirrors `light`) · 1.2 · 20 Oct 2026 (§9 and §10 updated with the product owner's answers) · 1.1 · 17 Oct 2026 (switched design tool from Figma to Penpot)
**Owner:** Igor Kazakov

---

## 0. How to use this document

This brief describes **what** each MVP screen must contain and **how it behaves**. It does not prescribe visual styling beyond the constraints in §2. For every screen listed in the Screen Inventory (§4), produce the default state plus every state listed under "States". Use the sample data in §7 so all screens tell one consistent story.

---

## 1. Product context

**What it is:** A mobile app that helps people never miss a friend's birthday. The user keeps a list of friends with their birthdays and some personal context, gets reminded before each birthday, writes a greeting in the app, and sends it through Telegram. Every greeting is saved so the user can look back at what they wrote to whom.

**Who it's for:** Adults with a wide social circle who use Telegram as their main messenger and want greetings to feel personal rather than a generic "HBD!".

**Core value in one line:** _Know whose birthday is coming, remember what matters about them, and send a personal greeting in under a minute._

**Product principles for the design**

1. **Upcoming first.** The home screen answers "whose birthday is next and have I greeted them?"
2. **Fast path to greeting.** From a reminder or the home list, the user should reach a ready-to-send greeting in 1–2 taps.
3. **Personal context at hand.** When writing, the friend's interests and past greetings are visible so greetings stay personal and non-repetitive.
4. **Calm and warm, not childish.** Celebratory accents are fine; avoid balloon/confetti overload.

**Future phase (do NOT design, but don't block):** AI-generated greetings will later appear in the Compose screen. Leave the Compose layout flexible enough that a "Generate" action can be added near the text field without a redesign.

---

## 2. Design constraints

| Area              | Requirement                                                                                                                                                                                                                                                 |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platforms         | iOS and Android, phone only. **One custom cross-platform design** (no separate HIG / Material variants).                                                                                                                                                    |
| Board size        | Each screen is a Penpot **board** of **393 × 852** (iPhone 15/16). Check the Upcoming and Compose screens also fit **375 × 667** (iPhone SE) without clipping critical actions.                                                                             |
| Theme             | **Light theme only** in mocks. All colors must be applied via **semantic design tokens** (Penpot tokens, see §2.1) organized so a Dark theme can be added later by filling a second token set, with no screen changes.                                      |
| Language          | **English only.** Leave ~30% slack in buttons and labels for future localization.                                                                                                                                                                           |
| Tech feasibility  | Built with React Native + Expo. Stick to patterns that map to standard RN components: bottom tabs, stack navigation, bottom sheets, native date/time pickers, native share sheet, toasts. Avoid custom gestures beyond swipe-to-delete and pull-to-refresh. |
| Accessibility     | WCAG AA contrast for text, minimum tap target 44 × 44 pt, never rely on color alone for status (pair with icon or text), layouts tolerate larger system font sizes.                                                                                         |
| Telegram branding | Use a generic "send" or "paper plane" icon with the text label "Telegram". Do not use Telegram's blue as the app's brand color.                                                                                                                             |

### 2.1 Design tokens (deliver as Penpot design tokens)

**Token structure in Penpot**

- **Token sets:**
  - `core` — raw palette values (e.g., `palette.coral.500`) plus spacing, radius and other non-color scales.
  - `light` — semantic color tokens that reference `core` values (e.g., `accent.default` → `{palette.coral.500}`).
  - `dark` — same token names as `light`, **left empty** for now (or mirroring light), ready to be filled later.
- **Themes:** a theme group `mode` with two themes: **Light** (`core` + `light` active) and **Dark** (`core` + `dark` active). All mocks use the Light theme.
- **Apply tokens to layers**, not raw hex values or loose numbers, so switching the theme recolors every screen.
- **Export** the tokens as JSON (Penpot's design tokens export, W3C DTCG format) and save it next to the Penpot file. Engineering will convert it into the React Native theme.
- If a token type below isn't supported in the Penpot version in use (for example typography or shadows), define it as a shared library asset (**Typographies** / **Colors** in the Assets panel) with the same name, and note this on the Tokens page.

**Token names** (Penpot uses dot-separated names; groups appear as folders)

- **Color (semantic):** `bg.default`, `bg.subtle`, `surface.default`, `surface.raised`, `text.primary`, `text.secondary`, `text.disabled`, `text.on-accent`, `accent.default`, `accent.pressed`, `accent.subtle`, `border.default`, `status.success`, `status.warning`, `status.danger`, `celebration` (today's-birthday highlight). Values filled in `light`; `dark` mirrors `light` for now.
- **Color (added in E10-S1):** `border.strong` (outlines of inputs, toggles and segmented controls, ≥ 3:1), `status.success-subtle`, `status.warning-subtle`, `status.danger-subtle` (badge and banner backgrounds), and avatar pairs `avatar.1.bg` / `avatar.1.fg` … `avatar.6.bg` / `avatar.6.fg` (A17).
- **Color (added in E10-S2):** `status.danger-pressed` (pressed destructive button), `skeleton` (loading placeholders), `focus.ring` (focused fields, distinct from the error red), `overlay.scrim` (behind dialogs and sheets; a literal `palette.neutral.900` at 40% because a reference can't carry alpha, so update it by hand if the palette changes).
- **Size (added in E10-S2):** `size.avatar.s`, `size.avatar.m`, `size.avatar.l`, `size.touch-target`, `size.icon.sm`, `size.icon.md`, `size.icon.xl`.
- **Border width (added in E10-S2):** `border.width.thin`, `border.width.thick`.
- **Typography:** `type.display`, `type.title-l`, `type.title-m`, `type.body`, `type.body-strong`, `type.caption`, `type.label`.
- **Spacing:** `space.4`, `space.8`, `space.12`, `space.16`, `space.24`, `space.32`, `space.48` (4-pt scale).
- **Radius:** `radius.sm`, `radius.md`, `radius.lg`, `radius.full`.
- **Elevation:** `elevation.none`, `elevation.card`, `elevation.sheet` (as shadow tokens, or as library shadow styles if shadow tokens aren't available).

### 2.2 Shared components (deliver on a Components page, as a shared library)

Avatar (initials, deterministic background color from name; sizes S/M/L) · Birthday row (list item) · Section header · Primary / secondary / destructive / text buttons · Text field (default, focused, error, disabled) · Multiline text area · Chip (interest tag, removable) · Segmented control · Toggle row · Empty state block · Toast · Confirmation dialog · Bottom sheet · Bottom tab bar · Badge ("Today", "Greeted").

**Added in E10-S3:** Sign-in button (`provider=apple|google` × `state=default|loading|disabled`), with the Apple and Google logos as nested components · Text link (44 pt tap target, underlined). The sign-in buttons use literal values instead of tokens: Apple black `#000000`; Google outline `#747775`, label `#1F1F1F` in Roboto; 38% opacity when disabled. Apple and Google set these, so they must not follow the app theme. The logos in the mocks are redrawn; the app ships the providers' official logo files.

### 2.3 Penpot conventions

- **Components:** build each item in §2.2 as a Penpot main component and publish the file as a **shared library**. Model states and sizes as **component variants** (e.g., `Button` with properties `type=primary|secondary|destructive|text` and `state=default|pressed|disabled|loading`). If variants aren't available in the Penpot version in use, use slash-named components instead (`Button / Primary / Disabled`), which Penpot groups automatically in the Assets panel.
- **Screens use copies:** every button, row, field, etc. on a screen must be a component copy, not a detached shape.
- **Layout:** use **Flex layout** for lists, stacks, rows and buttons, and **Grid layout** for the calendar month grid, so content reflows when text grows and the code Inspect panel produces usable values.
- **Naming:** boards named `S-XX / State` (e.g., `S-03 / Empty`); layers named meaningfully (no "Rectangle 12").
- **Icons:** one consistent open-source icon set (e.g., Lucide or Phosphor), imported as components, 24 × 24 base size.
- **Fonts:** use a font available in Penpot's built-in Google Fonts list (or upload it to the team) so engineers see the same rendering.

---

## 3. Navigation model

**Bottom tab bar (5 tabs):**

1. **Upcoming** (home, default after login)
2. **Calendar**
3. **Friends**
4. **History**
5. **Settings**

**Global "Add friend" action:** a "+" button in the header of Upcoming, Calendar and Friends opens the Add Friend screen.

Stack screens pushed over tabs: Friend Profile, Add/Edit Friend, Compose Greeting, Greeting Detail, Reminder Settings.

---

## 4. Screen inventory

| ID   | Screen                                   | Feature |
| ---- | ---------------------------------------- | ------- |
| S-01 | Sign In                                  | F1      |
| S-02 | Notification permission priming          | F1 / F8 |
| S-03 | Upcoming (home)                          | F2      |
| S-04 | Calendar                                 | F3      |
| S-05 | Friends list                             | F4      |
| S-06 | Add / Edit Friend                        | F4      |
| S-07 | Friend Profile                           | F4      |
| S-08 | Compose Greeting                         | F5      |
| S-09 | Telegram unavailable sheet               | F5      |
| S-10 | History (all greetings)                  | F6      |
| S-11 | Greeting Detail                          | F6      |
| S-12 | Friend's greetings (full list)           | F6      |
| S-13 | Settings                                 | F7      |
| S-14 | Reminder Settings                        | F8      |
| S-15 | Push notification examples (lock screen) | F8      |

---

## 5. Features

### F1 — Authentication & first run

**Goal:** Get the user into the app with one tap and set up reminders.

**User stories**

- As a new user, I sign in with Apple or Google so I don't need a password.
- As a new user, I'm asked to allow notifications with a clear reason, so I understand why.

**S-01 Sign In**

- App logo/name, one-line value proposition (e.g., "Never miss a birthday. Send greetings that feel personal.").
- Light illustration or celebratory visual (optional, keep subtle).
- **"Continue with Apple"** and **"Continue with Google"** buttons, equal size and prominence, stacked. Follow each provider's official button guidelines.
- Footer: "By continuing you agree to our Terms and Privacy Policy" with both as links.
- **States:** default · loading (tapped button shows spinner, both buttons disabled) · error (inline message under buttons: "Sign-in failed. Please try again.") · cancelled by user (return to default silently).

**S-02 Notification permission priming** (shown once, after first sign-in, before the OS dialog)

- Illustration, title "Never miss a birthday", text explaining reminders ("We'll remind you on the day and a few days before.").
- Primary **"Turn on reminders"** → triggers the OS permission dialog.
- Secondary **"Not now"** → skips to Upcoming. Reminders can be enabled later in Settings.

**First-run result:** user lands on Upcoming in its **empty state** (see F2).

**Acceptance (for mocks):** S-01 in all 4 states; S-02 single state; a flow arrow S-01 → S-02 → S-03 (empty).

---

### F2 — Upcoming (home)

**Goal:** Show whose birthday is next and whether the user has already greeted them.

**User stories**

- As a user, I open the app and immediately see today's and upcoming birthdays.
- As a user, I can start a greeting directly from the list.
- As a user, I can see which friends I've already greeted this year.

**S-03 Upcoming**

- **Header:** title "Upcoming", "+" add-friend button.
- **Today block** (only when there are birthdays today): visually highlighted card(s) using the `celebration` token. Each card: avatar (L), name, "Turns 30 today" (or "Birthday today" if year unknown), primary button **"Write greeting"**. If already greeted: replace the button with a "Greeted ✓" badge and a text button "Write another".
- **Sections below:** "This week", "This month", "Later" (next 12 months). Sections with no items are hidden.
- **Birthday row:** avatar (M), name, date ("Mon, Oct 20"), age if year known ("turns 31"), relative time on the right ("in 3 days"). Tapping the row opens Friend Profile. Row shows a "Greeted" badge when a greeting has already been saved for this year's birthday.
- Pull-to-refresh.

**States**

- **Empty (no friends):** illustration, "No birthdays yet", text "Add friends to start tracking their birthdays.", primary button "Add friend".
- **No birthdays today:** no Today block; list starts with "This week".
- **Loading:** skeleton rows.
- **Error:** inline message with "Try again".

**Business rules**

- Birthdays without a year never show an age.
- Feb 29 birthdays appear on Feb 28 in non-leap years.
- "Greeted" = a greeting was saved for this friend from 7 days before this year's birthday onward.

---

### F3 — Calendar

**Goal:** Browse birthdays by month.

**S-04 Calendar**

- Month grid with weekday header; today's date clearly marked.
- Days with birthdays show a dot (or count badge when 2+).
- Month navigation via arrows in the header and horizontal swipe; "Today" text button returns to the current month.
- Below the grid: list of birthdays for the **selected day** (default: today) using the standard Birthday row. If the selected day has none: "No birthdays on this day".
- "+" add-friend button in the header.

**States:** month with birthdays · selected day with multiple birthdays · selected day empty · whole app empty (grid shown, list area shows the F2 empty state message).

---

### F4 — Friends & friend profiles

**Goal:** Let the user store friends with birthdays and personal context.

**User stories**

- As a user, I add a friend with name and birthday; the year is optional.
- As a user, I optionally note how I know them, their interests, how close we are, and their Telegram contact.
- As a user, I can find, edit and delete friends.

#### Data fields

| Field                  | Required | Input                                                       | Rules                                                                                                                     |
| ---------------------- | -------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Name                   | Yes      | Text                                                        | 1–60 chars                                                                                                                |
| Birthday – day & month | Yes      | Date picker (month + day)                                   | Invalid dates impossible (no Feb 30)                                                                                      |
| Birthday – year        | No       | "Include year" toggle reveals a year picker                 | Not in the future; shows age when set                                                                                     |
| How we know each other | No       | Single-line text                                            | Max 120 chars, e.g., "University roommate"                                                                                |
| Interests              | No       | Chips; type and press Enter/"Add"                           | Up to 10 chips, 30 chars each                                                                                             |
| Closeness              | No       | Segmented control: **Close friend / Friend / Acquaintance** | Can be cleared                                                                                                            |
| Telegram contact       | No       | Segmented control **Username / Phone** + text field         | Username: 5–32 chars, letters, digits, underscore; "@" added automatically. Phone: international format with country code |

Avatars are initials only in the MVP (no photo upload).

**S-05 Friends list**

- Header: title "Friends", "+" add button, search field below the title.
- Alphabetical list with A–Z section headers. Row: avatar (M), name, birthday ("Mar 14"), small closeness label if set.
- Swipe left on a row → "Delete" (opens confirmation dialog).
- **States:** default · searching with results · search with no results ("No friends match "xyz"") · empty (same pattern as F2 empty).

**S-06 Add / Edit Friend** (same screen, two titles: "New friend" / "Edit friend")

- Header: "Cancel" (left), title, "Save" (right, disabled until required fields are valid).
- Form grouped into sections: **Basics** (name, birthday, include year) · **About** (how we know each other, interests, closeness) · **Telegram** (type + value, helper text "Used to open their chat directly when you send a greeting").
- Edit mode only: destructive **"Delete friend"** button at the bottom.
- **States:** empty form · filled form · validation errors (invalid Telegram username, missing name) · duplicate warning (non-blocking banner: "You already have Anna Petrova with the same birthday. Save anyway?") · saving (Save shows spinner).
- **Dialogs:** "Discard changes?" when cancelling with edits · "Delete Anna Petrova? Their greeting history will also be deleted." with destructive confirm.

**S-07 Friend Profile**

- **Header area:** avatar (L), name, birthday ("October 17" + "· turns 30" if year known), "Birthday in 23 days" / "Birthday today", "Edit" in the nav bar.
- **Primary CTA:** "Write greeting".
- **About section:** how we know each other, interests as chips, closeness. Fields that are empty are hidden; if all are empty show a prompt "Add details to make greetings more personal" → opens Edit.
- **Telegram section:** "@anna_petrova" or "+995 …" with a Telegram icon; if not linked: "Not linked" + "Add" text button.
- **Greetings section:** last 3 greetings (date + 2-line preview); "See all (n)" → S-12. Empty: "No greetings yet".
- **States:** full profile · minimal profile (only name + birthday) · birthday today (header uses celebration styling).

---

### F5 — Compose & send greeting via Telegram

**Goal:** Write a greeting with the friend's context in view and hand it off to Telegram.

**How sending works (important for UX copy):** The app cannot send messages itself. It opens Telegram with the greeting text pre-filled, and the user taps Send inside Telegram. **The greeting is saved to History the moment the user taps the Telegram button** (the app cannot verify that it was actually sent). The user can delete a history entry later if they didn't send it.

**Entry points:** "Write greeting" on Upcoming (Today card), Friend Profile, a birthday push notification, "Send again" from Greeting Detail.

**S-08 Compose Greeting**

- **Header:** "Cancel", title "Greeting for Anna".
- **Recipient strip:** avatar (S), name, birthday info ("Turns 30 today"), Telegram contact or "No Telegram linked".
- **Context panel** (collapsible, expanded by default when data exists): interests chips, how we know each other, and **"Last greeting"** — date + 2-line preview of the most recent greeting to this friend, tap to expand. Purpose: avoid repeating yourself. Hidden if no context and no history.
- **Text area:** large, auto-growing, placeholder "Write something personal…", character counter (soft limit 4,096, Telegram's message limit; counter turns `status.warning` above 3,500).
- _(Reserve space near the text area for a future "Generate with AI" action. Do not draw it.)_
- **Actions (bottom, above keyboard):**
  - Primary: **"Open in Telegram"** when a Telegram contact is linked; **"Share via Telegram"** when not (opens Telegram's chat picker with the text pre-filled, user chooses the chat).
  - Secondary: **"Copy text"** (copies to clipboard, shows toast "Copied"; does **not** save to History).
  - Inline hint when no contact is linked: "Link their Telegram to open the chat directly" → opens Edit Friend.
  - Primary is disabled while the text area is empty.
- **After tapping the primary button:** greeting saved → Telegram opens. When the user returns to the app: Compose is closed and the user is back on the previous screen with toast "Greeting saved to history".
- **States:** empty · typing (keyboard open) · with context panel · no context/no history · near character limit · no Telegram linked.
- **Dialog:** "Discard greeting?" on Cancel when text is not empty.

**S-09 Telegram unavailable sheet** (bottom sheet, if Telegram isn't installed or can't be opened)

- Title "Telegram isn't available", text "Install Telegram or copy your greeting to send it another way."
- Buttons: "Copy text", "Get Telegram" (store link), "Cancel".
- Note: in this case the greeting is **not** saved.

> **Assumption to verify (engineering):** whether Telegram supports pre-filling text when opening a specific user's chat by username or phone. The UI above works either way: if direct pre-fill isn't supported, "Open in Telegram" will copy the text and open the chat, and the toast on return will read "Greeting copied — paste it in Telegram". Designer: please also mock this toast variant.

---

### F6 — Greeting history

**Goal:** Let the user look back at what they sent, overall and per friend.

**User stories**

- As a user, I browse all greetings I've sent, newest first.
- As a user, I see everything I've sent to one friend.
- As a user, I reuse or delete a past greeting.

**S-10 History**

- Header: title "History", search field (searches friend names and greeting text).
- Optional filter chip row: "All" + friend filter (opens a friend picker bottom sheet).
- List grouped by month ("October 2026"). Row: avatar (S), friend name, date sent, 2-line text preview, small "via Telegram" label.
- Swipe left → "Delete".
- **States:** default · filtered by one friend · search no results · empty ("No greetings yet. Greetings you send will appear here.").

**S-11 Greeting Detail**

- Friend name + avatar (tap → Friend Profile), date and time sent, channel ("Telegram" / "Telegram share").
- Full greeting text (selectable).
- Actions: **"Copy text"**, **"Send again"** (opens Compose pre-filled with this text), destructive **"Delete"** (confirmation: "Delete this greeting from history?").

**S-12 Friend's greetings**

- Same list pattern as S-10, scoped to one friend, grouped by year ("2026", "2025"). Header shows the friend's name.

---

### F7 — Settings & account

**S-13 Settings**

- **Account:** avatar, display name, email, sign-in provider ("Signed in with Google").
- **Reminders:** row showing current summary ("On the day & 3 days before · 9:00") → S-14.
- **About:** Privacy Policy, Terms of Service, app version.
- **Sign out** (text button, confirmation dialog).
- **Delete account** (destructive; required by App Store rules). Confirmation dialog: "Delete your account? All friends and greetings will be permanently deleted. This can't be undone." with destructive "Delete account".
- **States:** default · deleting (blocking loader).

---

### F8 — Birthday reminders (push notifications)

**Goal:** Remind the user before and on the birthday, with one global setting.

**User stories**

- As a user, I get a notification on the birthday and a few days before.
- As a user, I choose how many days in advance and at what time.
- As a user, tapping a notification takes me straight to the right place.

**S-14 Reminder Settings** (global only, no per-friend overrides)

- **Master toggle:** "Birthday reminders".
- **"On the day"** toggle (default on).
- **"In advance"** single-select: None / 1 day / 3 days (default) / 1 week.
- **"Notification time"** row → native time picker (default 9:00, user's local time).
- Helper text: "Reminders use your phone's time zone."
- **Permission-denied state:** banner at top: "Notifications are turned off for this app." + button "Open phone settings". Controls shown disabled.
- When the master toggle is off, the other controls are disabled.

**S-15 Notification content** (mock as lock-screen notifications)

| Case                          | Title                               | Body                                        | Tap opens               |
| ----------------------------- | ----------------------------------- | ------------------------------------------- | ----------------------- |
| Birthday today (one)          | 🎂 Anna Petrova's birthday is today | She turns 30. Tap to write a greeting.      | Compose (S-08) for Anna |
| Birthday today (year unknown) | 🎂 Mark Davis's birthday is today   | Tap to write a greeting.                    | Compose for Mark        |
| Several today                 | 🎂 3 birthdays today                | Anna, Mark and Sofia.                       | Upcoming (S-03)         |
| In advance                    | Upcoming birthday                   | Sofia Lee's birthday is in 3 days (Oct 20). | Friend Profile (S-07)   |

Use gender-neutral body copy where the friend's gender is unknown (the app doesn't store gender): e.g., "Turning 30. Tap to write a greeting."

---

## 6. Key user flows (build as Penpot prototype flows)

Create each flow below as a named **Flow** in Penpot's Prototype mode (starting board = first screen in the flow), linking boards with **On click → Navigate to** interactions. Use "Open overlay" for bottom sheets, dialogs and toasts. Telegram and the OS permission dialog are outside the app: represent them with a simple placeholder board labeled "Telegram (external)" / "OS permission dialog".

1. **First run:** S-01 → S-02 → S-03 (empty) → S-06 (new friend) → S-03 (with one friend).
2. **Greet from notification:** S-15 (today) → S-08 → Telegram (out of app) → back to S-03 with toast, row shows "Greeted".
3. **Greet without linked Telegram:** S-07 → S-08 (no contact) → "Share via Telegram" → back with toast.
4. **Enrich a friend:** S-05 → S-07 (minimal) → Edit → S-06 → S-07 (full).
5. **Reuse an old greeting:** S-10 → S-11 → "Send again" → S-08 pre-filled.
6. **Set up reminders later:** S-13 → S-14 (permission denied) → "Open phone settings".

---

## 7. Sample data for mocks

Treat "today" as **Saturday, October 17, 2026**.

| Name           | Birthday | Year            | Closeness    | How we know               | Interests                      | Telegram          |
| -------------- | -------- | --------------- | ------------ | ------------------------- | ------------------------------ | ----------------- |
| Anna Petrova   | Oct 17   | 1996 (turns 30) | Close friend | University roommate       | Hiking, specialty coffee, jazz | @anna_petrova     |
| Mark Davis     | Oct 17   | —               | Friend       | Former colleague at Godel | Cycling, board games           | @markd            |
| Sofia Lee      | Oct 20   | 1993 (turns 33) | Close friend | Met on a trip to Tbilisi  | Photography, wine              | +995 555 12 34 56 |
| Daniel Brooks  | Oct 29   | 1990 (turns 36) | Acquaintance | Neighbor                  | —                              | — (not linked)    |
| Elena Morozova | Nov 8    | 1988            | Friend       | Yoga class                | Yoga, travel                   | @elena_m          |
| Tom Becker     | Dec 2    | —               | —            | —                         | —                              | —                 |
| Laura Kim      | Feb 29   | 2000            | Friend       | Conference in Berlin      | Running                        | @laurakim         |

**Sample greeting history for Anna:**

- Oct 17, 2025 — "Happy birthday, Anna! Hope this year brings you as many mountain trails as cups of good coffee…"
- Oct 17, 2024 — "Anna! Another year of being the best roommate I ever had…"

Show Mark as already greeted today on at least one Upcoming variant.

---

## 8. Out of scope for MVP mocks

- .ics / calendar import
- AI greeting generation (only reserve space)
- Dark mode screens (tokens only)
- Tablet, web, landscape
- Photo avatars and contact-book import
- Localization beyond English
- Any messengers other than Telegram

---

## 9. Assumptions & open points

| #   | Item                                        | Current assumption                                                                                                                                                                                                                                                                                                                                                          |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | Telegram pre-fill to a specific chat        | Unverified; UI supports both "pre-filled" and "copied, paste in Telegram" variants (§F5).                                                                                                                                                                                                                                                                                   |
| A2  | When a greeting counts as "sent"            | Saved to History on tap of the Telegram button; user can delete it. "Copy text" alone doesn't save.                                                                                                                                                                                                                                                                         |
| A3  | "Greeted" badge window                      | From 7 days before the birthday through the end of the birthday; the next day the friend rolls to next year's birthday (ba-brief D13).                                                                                                                                                                                                                                      |
| A4  | Feb 29 birthdays                            | Printed as "Feb 29"; countdown, Upcoming position, Calendar day and reminders use Feb 28 in non-leap years (ba-brief D16).                                                                                                                                                                                                                                                  |
| A5  | Closeness levels                            | Three: Close friend / Friend / Acquaintance.                                                                                                                                                                                                                                                                                                                                |
| A6  | Settings placement                          | Separate 5th tab.                                                                                                                                                                                                                                                                                                                                                           |
| A7  | Avatars                                     | Initials only.                                                                                                                                                                                                                                                                                                                                                              |
| A8  | Upcoming sections (S-03)                    | Calendar periods, weeks Monday–Sunday: This week = today through Sunday (today's birthdays are in the Today block); This month = rest of the calendar month after this week; Later = beyond. Days of next month that fall in this week stay in This week (ba-brief D14). With the §7 data on Sat Oct 17, "This week" is empty and Sofia (Tue Oct 20) is under "This month". |
| A9  | Relative day copy                           | "Today" (0 days), "Tomorrow" (1 day), "in N days" otherwise (ba-brief D17). Show "Tomorrow" on at least one mock.                                                                                                                                                                                                                                                           |
| A10 | Sign in with Apple (S-01)                   | iOS only; on Android S-01 shows only "Continue with Google" (ba-brief D20).                                                                                                                                                                                                                                                                                                 |
| A11 | Apple account with hidden name/email (S-13) | Show the name if available, otherwise the private-relay email, plus "Signed in with Apple" (ba-brief D20).                                                                                                                                                                                                                                                                  |
| A12 | Reminders summary when off (S-13)           | "Off" (ba-brief D19).                                                                                                                                                                                                                                                                                                                                                       |
| A13 | Greeting length (S-08)                      | 4,096 characters is a hard cap: the text area stops accepting input (ba-brief D22).                                                                                                                                                                                                                                                                                         |
| A14 | Save fails on the Telegram tap (S-08)       | Telegram doesn't open; show an error with retry (ba-brief D22).                                                                                                                                                                                                                                                                                                             |
| A15 | History swipe-to-delete (S-10)              | Confirms with the S-11 dialog "Delete this greeting from history?" (ba-brief D23).                                                                                                                                                                                                                                                                                          |
| A16 | Offline states                              | Not specified in §5; the designer decides the pattern (banner, read-only actions, or both) and mocks it (§10 item 8).                                                                                                                                                                                                                                                       |
| A17 | Avatar colors                               | A small set of avatar background color tokens in the `light` set, each passing WCAG AA with the initials (§10 item 7).                                                                                                                                                                                                                                                      |
| A18 | App icon and splash                         | Designed in Penpot together with the screens (§10 item 9).                                                                                                                                                                                                                                                                                                                  |

---

## 10. Expected design deliverables

All in one Penpot file, organized into these pages:

1. **Tokens page** — visual overview of the token sets and themes from §2.1 (color swatches, type scale, spacing, radius, elevation), Light theme filled, Dark set mirroring Light. Plus the exported **tokens JSON** file.
2. **Components page** — all components in §2.2 as main components with variants and states, published as a shared library.
3. **Screens page(s)** — every screen in §4 with every listed state, one board each, named `S-XX / State`.
4. **Flows page** — the six Penpot prototype flows from §6, each named after its flow (e.g., "1 · First run").
5. **Small-screen check** — S-03 and S-08 boards at 375 × 667.
6. **Handoff** — a shareable Penpot view-mode link with the flows, so screens can be clicked through and inspected (code / measurements) without edit access.
7. **Avatar color tokens** — a small set of avatar background colors in the `light` set (names also in `dark`), shown on the Tokens page (A17).
8. **Offline states** — the offline pattern on the Components page, `Offline` boards for the main read screens, and boards for actions that fail offline (A16).
9. **App icon and splash** — iOS icon (1024 × 1024), Android adaptive icon (foreground and background color) and splash artwork, exported for engineering (A18).
