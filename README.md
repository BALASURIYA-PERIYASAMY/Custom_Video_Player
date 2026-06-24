# 🎬 Video Player

A custom, fully featured **YouTube Video Player** built with **React 19**, **Vite**, and **ReactPlayer**. Provides complete playback controls, a seek bar with fill animation, volume management, playback speed selection, and a fullscreen mode that automatically rotates to landscape on mobile devices — just like a native mobile video player.

---

## 🚀 Key Features

- **▶ Play / Pause** — click the centre button or tap anywhere on the video area
- **⏪⏩ Skip ±10 seconds** — forward and backward seek in 10-second steps
- **🔊 Volume control** — slider + mute/unmute toggle; volume icon reflects current level (🔇 / 🔉 / 🔊)
- **⏱ Seek bar** — draggable progress bar with a red fill that tracks playback position in real time; updates smoothly without interrupting drag
- **🕐 Time display** — `MM:SS` current time and total duration shown on both sides of the seek bar
- **⚡ Playback speed** — choose from `0.25×`, `0.5×`, `1×`, `1.5×`, `2×`
- **⛶ Fullscreen** — one-click fullscreen toggle:
  - Controls stay pinned to the bottom in a horizontal row
  - On mobile, automatically calls `screen.orientation.lock("landscape")` to rotate the screen — identical to native video app behaviour
  - `⛶ Full` / `⛶ Exit` label updates in real time via a `fullscreenchange` event listener
- **📱 Responsive design** — stacks controls vertically on narrow screens; full horizontal layout in landscape / fullscreen

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI Library | [React 19](https://react.dev/) |
| Build Tool | [Vite 8](https://vite.dev/) |
| Video Engine | [ReactPlayer v3](https://github.com/cookpete/react-player) |
| Styling | Vanilla CSS (custom seek-bar fill via CSS variables) |
| Linter | [Oxlint](https://oxc.rs/) |

---

## 📂 Project Structure

```text
Deployment/
├── public/                  # Static assets
├── src/
│   ├── App.css              # All player styles — layout, seek bar, controls, fullscreen
│   ├── App.jsx              # Video component — all state, handlers, and JSX
│   └── main.jsx             # React DOM mount point
├── index.html               # HTML entry document
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation (this file)
```

---

## 🐛 Bugs Fixed

| Bug | Root Cause | Fix Applied |
|---|---|---|
| Video never played | `src` prop used instead of `url` | Changed to `url` (ReactPlayer API) |
| Duration / progress always 0 | `onDurationChange` / `onTimeUpdate` are raw DOM events | Changed to `onDuration` / `onProgress` (ReactPlayer callbacks) |
| Seek bar did nothing | Progress updates overwrote dragged position | Added `seeking` state; updates paused on `mousedown`, committed on `mouseup` via `seekTo()` |
| Fullscreen button label never changed | No state tracking for fullscreen | Added `isFullscreen` state updated by `fullscreenchange` DOM event |
| Mobile stayed portrait in fullscreen | No orientation API call | Added `screen.orientation.lock('landscape')` on enter; `unlock()` on exit |
| Volume icon always 🔊 | Icon not linked to muted / volume state | Icon now reflects `isMuted` and `volume < 0.5` |

---

## ⚙️ Local Setup & Run

### Prerequisites
[Node.js](https://nodejs.org/) LTS (v18+).

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```

### 4. Lint the Code
```bash
npm run lint
```

---

## 📱 Mobile Fullscreen Behaviour

When **⛶ Full** is tapped on a mobile device:

1. `element.requestFullscreen()` puts the player container in fullscreen.
2. `screen.orientation.lock("landscape")` forces the screen to rotate to landscape — exactly like YouTube or Netflix mobile apps.
3. Controls switch from a stacked (portrait) layout to a single horizontal row.
4. Tapping **⛶ Exit** calls `document.exitFullscreen()` and `screen.orientation.unlock()` to restore portrait mode.

> **Note:** `screen.orientation.lock()` requires the page to be in fullscreen and may be blocked on desktop browsers or browsers that don't support the ScreenOrientation API — it fails silently in those cases.

---

## 📝 Credits & License
Open for learning and modification.
