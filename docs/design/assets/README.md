# Design assets (app icon and splash)

These PNGs are exported from the Penpot file "GreetDay", page **Brand**. The full spec is on the
`Note / Icon` board there. For the requirements, see [design brief](../../product/design-brief.md)
§2 (Telegram branding, one cross-platform design), A18 and §10 item 9.

E9-S4 copies these files into `apps/mobile/assets` and wires them up in `app.json`. Don't edit the
PNGs by hand: change the Penpot board and export it again.

## App icon (#38)

| File                               | Penpot board                           | Pixels      | Transparency           | Expo field (`app.json`)                |
| ---------------------------------- | -------------------------------------- | ----------- | ---------------------- | -------------------------------------- |
| `icon-ios-1024.png`                | `Icon / iOS`                           | 1024 × 1024 | No (RGB, opaque)       | `icon` / `ios.icon`                    |
| `icon-android-foreground-1024.png` | `Icon / Android adaptive / Foreground` | 1024 × 1024 | Yes (RGBA)             | `android.adaptiveIcon.foregroundImage` |
| `icon-android-monochrome-1024.png` | `Icon / Android adaptive / Monochrome` | 1024 × 1024 | Yes (RGBA, alpha only) | `android.adaptiveIcon.monochromeImage` |
| `icon-preview.png`                 | `Icon / Preview (small sizes)`         | 1060 × 601  | No                     | none (review only)                     |

- **Android background color:** `#A93A22`, token `accent.default` (→ `palette.coral.600`). Use it as
  `android.adaptiveIcon.backgroundColor`. No background image is needed.
- **iOS:** square, with no rounded corners and no text. iOS applies its own mask.
- **Android foreground and monochrome:** the mark stays inside the central safe zone (66 of 108 dp,
  626 px circle). Android 13+ themed icons use only the monochrome layer's alpha.
- **Logo mark:** Penpot component `Logo / Mark`, white (`text.on-accent`). The splash reuses it.

## Splash (#39)

_To be added in the next task: splash artwork file(s), pixel size, background color hex and token._
