import { useRef, useState, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import './App.css';

/* ─────────────────────────────────────────────────
   Helper: format seconds → MM:SS or HH:MM:SS
───────────────────────────────────────────────── */
function fmt(secs) {
  if (!secs || isNaN(secs) || secs < 0) return '0:00';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ─────────────────────────────────────────────────
   Volume icon based on level
───────────────────────────────────────────────── */
function volIcon(muted, vol) {
  if (muted || vol === 0) return '🔇';
  if (vol < 0.4) return '🔈';
  if (vol < 0.7) return '🔉';
  return '🔊';
}

/* ─────────────────────────────────────────────────
   Main Video Player Component
───────────────────────────────────────────────── */
export default function Video() {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  /* ── State ── */
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [played, setPlayed] = useState(0);       // 0–1
  const [playedSecs, setPlayedSecs] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isFS, setIsFS] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [showCtrls, setShowCtrls] = useState(true);
  const hideTimer = useRef(null);

  /* ── Auto-hide controls after 3 s of inactivity ── */
  const resetHideTimer = useCallback(() => {
    setShowCtrls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowCtrls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    window.addEventListener('mousemove', resetHideTimer);
    window.addEventListener('touchstart', resetHideTimer);
    return () => {
      window.removeEventListener('mousemove', resetHideTimer);
      window.removeEventListener('touchstart', resetHideTimer);
      clearTimeout(hideTimer.current);
    };
  }, [resetHideTimer]);

  /* Show controls whenever paused */
  useEffect(() => {
    if (!playing) setShowCtrls(true);
  }, [playing]);

  /* ── Fullscreen change listener ── */
  useEffect(() => {
    const handler = () => setIsFS(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  /* ── Handlers ── */
  const togglePlay = () => setPlaying(p => !p);
  const toggleMute = () => setMuted(m => !m);

  /* ReactPlayer onProgress — fires ~4× per second while playing */
  const handleProgress = ({ played: p, playedSeconds: ps }) => {
    if (!seeking) {
      setPlayed(p);
      setPlayedSecs(ps);
    }
  };

  /* ReactPlayer onDuration — fires once the media metadata loads */
  const handleDuration = (d) => setDuration(d);

  /* Seek: pause updates while dragging, commit on release */
  const onSeekDown = () => setSeeking(true);
  const onSeekMove = (e) => setPlayed(parseFloat(e.target.value));
  const onSeekUp = (e) => {
    setSeeking(false);
    playerRef.current?.seekTo(parseFloat(e.target.value));
  };

  /* ±10 s skip */
  const skip = (delta) => {
    const next = Math.min(Math.max(playedSecs + delta, 0), duration);
    playerRef.current?.seekTo(next, 'seconds');
  };

  /* Fullscreen + landscape lock on mobile */
  const toggleFS = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        try { await screen?.orientation?.lock?.('landscape'); } catch { /* desktop ok */ }
      } else {
        await document.exitFullscreen();
        screen?.orientation?.unlock?.();
      }
    } catch (e) { console.warn(e); }
  };

  const pct = `${(played * 100).toFixed(2)}%`;

  return (
    <div
      className={`vp-root${isFS ? ' vp-fullscreen' : ''}`}
      ref={containerRef}
    >

      {/* ── Spatial background rings (decorative) ── */}
      <div className="vp-bg-rings" aria-hidden="true">
        <div className="ring r1" />
        <div className="ring r2" />
        <div className="ring r3" />
      </div>

      {/* ── Player card ── */}
      <div className="vp-card">

        {/* ── Video screen ── */}
        <div className="vp-screen" onClick={togglePlay}>
          <ReactPlayer
            ref={playerRef}
            src="https://www.youtube.com/watch?v=JzTNs0gY_ZU"
            playing={playing}
            muted={muted}
            volume={volume}
            playbackRate={speed}
            onProgress={handleProgress}
            onDuration={handleDuration}
            onEnded={() => { setPlaying(false); setPlayed(0); setPlayedSecs(0); }}
            progressInterval={300}
            controls={false}
            width="100%"
            height="100%"
            config={{
              youtube: {
                playerVars: { rel: 0, modestbranding: 1, disablekb: 1 },
              },
            }}
          />

          {/* Tap overlay icon */}
          <div className={`vp-tap-icon${playing ? '' : ' vp-tap-icon--visible'}`}>
            <div className="vp-tap-circle">
              <span>{playing ? '⏸' : '▶'}</span>
            </div>
          </div>
        </div>

        {/* ── Controls panel ── */}
        <div className={`vp-controls${showCtrls ? '' : ' vp-controls--hidden'}`}>

          {/* ── Seek / progress bar ── */}
          <div className="vp-seek-wrap">
            <input
              className="vp-seek"
              type="range"
              min={0}
              max={1}
              step={0.0001}
              value={played}
              onMouseDown={onSeekDown}
              onTouchStart={onSeekDown}
              onChange={onSeekMove}
              onMouseUp={onSeekUp}
              onTouchEnd={onSeekUp}
              style={{ '--pct': pct }}
              aria-label="Seek"
            />
          </div>

          {/* ── Button row ── */}
          <div className="vp-btn-row">

            {/* Left — mute + volume */}
            <div className="vp-group vp-left">
              <button className="vp-btn" onClick={toggleMute} title="Toggle mute">
                {volIcon(muted, volume)}
              </button>
              <input
                className="vp-vol-range"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (v > 0) setMuted(false);
                }}
                aria-label="Volume"
              />
            </div>

            {/* Centre — skip + play/pause */}
            <div className="vp-group vp-center">
              <button className="vp-btn vp-skip-btn" onClick={() => skip(-10)} title="Rewind 10s">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M6 6h2v12H6zm.5 6 8.5 6V6z" />
                </svg>
                <span className="vp-skip-label">10</span>
              </button>

              <button className="vp-btn vp-play-btn" onClick={togglePlay} title={playing ? 'Pause' : 'Play'}>
                {playing
                  ? <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><path d="M8 5v14l11-7z" /></svg>
                }
              </button>

              <button className="vp-btn vp-skip-btn" onClick={() => skip(10)} title="Forward 10s">
                <span className="vp-skip-label">10</span>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M6 18l8.5-6L6 6v12zm2-8.14 5.02 2.15L8 14.14V9.86zM15.5 6h2v12h-2z" />
                </svg>
              </button>
            </div>

            {/* Right — time, speed, fullscreen */}
            <div className="vp-group vp-right">
              <span className="vp-time">
                {fmt(playedSecs)} <span className="vp-time-sep">/</span> {fmt(duration)}
              </span>

              <select
                className="vp-speed"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                title="Playback speed"
              >
                <option value={0.25}>0.25×</option>
                <option value={0.5}>0.5×</option>
                <option value={1}>1×</option>
                <option value={1.5}>1.5×</option>
                <option value={2}>2×</option>
              </select>

              <button className="vp-btn vp-fs-btn" onClick={toggleFS} title="Fullscreen">
                {isFS
                  ? <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
