# 0003. Offline pattern: banner, actions stay enabled, one error-with-retry path

- **Status:** Accepted
- **Date:** 2026-10-27
- **Deciders:** Igor Kazakov (drafted by Claude Code)
- **Related:** issues #34, #35, #36 (E10-S9); design brief A16 and §2.2; ba-brief §6 Offline behavior

## Context

The design brief left offline states open (A16): the designer picks the pattern. ba-brief §6 sets
the floor: the last loaded data stays visible, and actions that need the server show a clear error
with retry. The MVP has no offline writes or sync queue, so the pattern must never promise to "sync
later".

The app can't know reliably whether a request will work. The phone's network status (React Native
NetInfo, like `navigator.onLine` on the web) can say "offline" on a slow or captive network, and the
server can fail while the phone is online. Whatever we pick has to cover both cases.

## Options considered

### Option A: Offline banner, every action enabled, one error-with-retry path

- Pros: users see at once that data may be old and changes need a connection; nothing is hidden or
  dimmed; no extra taps when the network is fine; the same error path covers server failures while
  online; NetInfo only decides whether the banner shows, so a wrong reading never blocks an action.
- Cons: users can start an action that will fail; every server action needs a failure state.

### Option B: Offline banner plus actions disabled in advance

- Pros: users can't start an action that will fail.
- Cons: a wrong NetInfo reading blocks actions that would succeed; disabled controls are low
  contrast and need an explanation everywhere; server failures while online still need
  error-with-retry, so there are two patterns to build.

### Option C: Toast only, when an action fails

- Pros: smallest change; nothing on screen while things work.
- Cons: no warning before someone writes a greeting or fills in a form; nothing says the data on
  screen may be old.

## Decision

We choose **Option A**. The banner (`Banner kind=offline`) shows under the header of every
signed-in screen while the device reports no connection, plus a "Couldn't refresh" variant with
"Try again" when a load fails while online. Any action that needs the server and fails, offline or
not, uses one path: an inline danger Banner with "Try again" on forms (S-06, S-08) where the input
stays, otherwise an error Toast with "Try again" and the change reverted. That includes sign out: it
fails offline and the user stays signed in. Error Toasts don't time out. Nothing is saved, queued or
cleared locally while offline. The full rule, copy and screen-reader behaviour are on
`Components / Offline pattern` in Penpot.

## Consequences

- Positive: one error-handling path for mobile to build once (E0-S3) and reuse in every screen
  story; matches what the device can actually detect.
- Negative / accepted trade-offs: a user offline can tap Save or Delete and only then learn it
  failed; sign out needs a connection.
- Follow-ups: E0-S3 builds the banner hook (NetInfo), the error Toast and the inline error Banner;
  every screen story adds its `Offline` and failure states; the proposed copy is approved at
  handoff (E10-S11-T3).
