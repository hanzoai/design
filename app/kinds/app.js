// @generated
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Interactive visual & audio applications (`app` kind): a complete, self-contained
 * HTML5 / Canvas / WebAudio / SVG experience rendered live in a sandboxed iframe tab.
 *
 * When a person uploads a music or audio file (or creates music in a tab) and asks
 * to "make a full-blown music app with it", or asks for an interactive visualizer,
 * synth pad, micro-site, or interactive visual experience, `make_app` embeds any
 * referenced audio (`window.__STUDIO_AUDIO__`) and image (`window.__STUDIO_IMAGE__`)
 * as live data: URLs and generates a studio-grade interactive application.
 */
import { SizableText, XStack, YStack } from '@hanzo/gui';
import { Sparkles } from '@hanzogui/lucide-icons-2';
import { useEffect, useState } from 'react';
import { current, filename } from '../made.js';
import { data } from '../raster.js';
import { Row, Text1, TextN } from '../ui.js';
import { read, structured } from '../wire.js';
import { num, str } from './kind.js';
import { PRESETS, settle } from './type/system.js';
const PRESET_LIST = ['music-app', 'visualizer', 'interactive-visual', 'synth-studio'];
function parseSpec(v) {
    const s = v;
    return {
        preset: PRESET_LIST.includes(s.preset ?? '') ? s.preset : 'music-app',
        title: str(s.title, 'Sonic Studio'),
        subtitle: str(s.subtitle, 'Interactive Audio & Visual Experience'),
        artist: str(s.artist, 'Hanzo Studio'),
        prompt: str(s.prompt, ''),
        accent: str(s.accent, '#f43f5e'),
        secondary: str(s.secondary, '#a1a1aa'),
        audio: str(s.audio, ''),
        audioName: str(s.audioName, 'Featured Track'),
        image: str(s.image, ''),
        tracks: Array.isArray(s.tracks) && s.tracks.length
            ? s.tracks.map((t) => ({
                title: str(t?.title, 'Track 01'),
                duration: str(t?.duration, '3:24'),
                bpm: num(t?.bpm, 124, 60, 200),
                key: str(t?.key, 'A minor'),
            }))
            : [
                { title: str(s.audioName, 'Main Mix'), duration: '3:24', bpm: 124, key: 'A minor' },
                { title: 'Midnight Stem (Bass + Drums)', duration: '2:48', bpm: 124, key: 'A minor' },
                { title: 'Atmospheric Pad (Ambient)', duration: '4:12', bpm: 96, key: 'C major' },
            ],
        customHtml: typeof s.customHtml === 'string' && s.customHtml.trim() ? s.customHtml : undefined,
        system: settle((s.system ?? {}), PRESETS[0]),
    };
}
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
/**
 * Build the self-contained HTML5 application with embedded audio/image data URLs.
 * Supports:
 * - Real uploaded audio playback via HTML5 `<audio>` + WebAudio `AudioContext` + `AnalyserNode`
 * - Built-in procedural WebAudio polyphonic synth + drum engine when no external audio file is playing
 * - 3-Band EQ (Low / Mid / High BiquadFilterNodes)
 * - Playback speed / pitch control (0.5x – 1.5x)
 * - Real-time 60fps Canvas visualizer (4 modes: Spectrum Bars, Radial Orb, Oscilloscope Wave, Particle Nebula)
 * - Interactive waveform scrubber + playlist + downloadable audio/HTML
 */
export function buildAppHtml(s, audioUrl, imageUrl) {
    const safeSpec = JSON.stringify({
        preset: s.preset,
        title: s.title,
        subtitle: s.subtitle,
        artist: s.artist,
        prompt: s.prompt,
        accent: s.accent,
        secondary: s.secondary,
        audioName: s.audioName,
        tracks: s.tracks,
    }).replace(/</g, '\\u003c');
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(s.title)} — ${esc(s.artist)}</title>
<style>
  :root {
    --accent: ${esc(s.accent)};
    --secondary: ${esc(s.secondary)};
    --bg: #07070b;
    --panel: rgba(18, 18, 26, 0.78);
    --border: rgba(255, 255, 255, 0.1);
    --text: #f8fafc;
    --muted: #94a3b8;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%; height: 100%; overflow: hidden;
    background: var(--bg); color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    user-select: none;
  }
  #stage {
    position: fixed; inset: 0; width: 100%; height: 100%;
    z-index: 0; cursor: crosshair;
  }
  .shell {
    position: relative; z-index: 1;
    display: grid;
    grid-template-columns: 320px 1fr 300px;
    grid-template-rows: auto 1fr auto;
    height: 100vh; gap: 14px; padding: 16px;
    pointer-events: none;
  }
  @media (max-width: 980px) {
    .shell { grid-template-columns: 1fr; grid-template-rows: auto 1fr auto; overflow-y: auto; }
    .side-right { display: none; }
  }
  .card {
    background: var(--panel);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 16px;
    pointer-events: auto;
    box-shadow: 0 20px 50px rgba(0,0,0,0.45);
  }
  .top-bar {
    grid-column: 1 / -1;
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 12px 18px;
  }
  .brand { display: flex; align-items: center; gap: 12px; }
  .pulse-dot {
    width: 10px; height: 10px; border-radius: 999px;
    background: var(--accent);
    box-shadow: 0 0 14px var(--accent);
  }
  .title-main { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; }
  .subtitle-main { font-size: 12px; color: var(--muted); }
  .mode-pills { display: flex; gap: 6px; flex-wrap: wrap; }
  .pill {
    background: rgba(255,255,255,0.06); color: var(--muted);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 500;
    cursor: pointer; transition: all 0.15s ease;
  }
  .pill:hover { color: var(--text); background: rgba(255,255,255,0.12); }
  .pill.active {
    background: var(--accent); color: #fff; border-color: var(--accent);
    box-shadow: 0 0 18px rgba(244, 63, 94, 0.4);
  }
  .side-left { display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
  .side-right { display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }
  .center-space { display: flex; align-items: flex-end; justify-content: center; pointer-events: none; }
  .cover-box {
    width: 100%; aspect-ratio: 1 / 1; border-radius: 12px; overflow: hidden;
    position: relative; background: linear-gradient(135deg, var(--accent), var(--secondary));
    display: flex; align-items: center; justify-content: center;
    border: 1px solid rgba(255,255,255,0.12);
  }
  .cover-box img { width: 100%; height: 100%; object-fit: cover; }
  .cover-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(7,7,11,0.9) 0%, transparent 65%);
    display: flex; flex-direction: column; justify-content: flex-end; padding: 14px;
  }
  .section-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--muted); margin-bottom: 8px;
  }
  .track-list { display: flex; flex-direction: column; gap: 6px; }
  .track-item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 9px 11px; border-radius: 10px; cursor: pointer;
    background: rgba(255,255,255,0.03); border: 1px solid transparent;
    transition: all 0.15s ease;
  }
  .track-item:hover { background: rgba(255,255,255,0.08); }
  .track-item.active {
    background: rgba(244,63,94,0.14); border-color: var(--accent);
  }
  .track-name { font-size: 13px; font-weight: 600; }
  .track-meta { font-size: 11px; color: var(--muted); }
  .bottom-bar {
    grid-column: 1 / -1;
    display: flex; flex-direction: column; gap: 10px;
  }
  .scrubber-wrap {
    display: flex; align-items: center; gap: 12px;
  }
  .time-readout { font-size: 11px; font-variant-numeric: tabular-nums; color: var(--muted); width: 42px; }
  #waveCanvas {
    flex: 1; height: 42px; border-radius: 8px;
    background: rgba(255,255,255,0.04); cursor: pointer;
  }
  .transport {
    display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  }
  .transport-buttons { display: flex; align-items: center; gap: 10px; }
  .btn-play {
    width: 44px; height: 44px; border-radius: 999px; border: none;
    background: var(--accent); color: #fff; font-size: 16px; font-weight: 700;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 24px rgba(244,63,94,0.45);
    transition: transform 0.12s ease;
  }
  .btn-play:hover { transform: scale(1.06); }
  .btn-icon {
    height: 34px; padding: 0 12px; border-radius: 8px;
    border: 1px solid var(--border); background: rgba(255,255,255,0.05);
    color: var(--text); font-size: 12px; cursor: pointer;
  }
  .btn-icon:hover { background: rgba(255,255,255,0.12); }
  .slider-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
  .slider-head { display: flex; justify-content: space-between; font-size: 11px; color: var(--muted); }
  input[type=range] {
    width: 100%; accent-color: var(--accent); cursor: pointer;
  }
  .pad-grid {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
  }
  .synth-pad {
    padding: 12px 8px; border-radius: 10px; border: 1px solid var(--border);
    background: rgba(255,255,255,0.04); color: var(--text);
    font-size: 12px; font-weight: 600; text-align: center; cursor: pointer;
    transition: all 0.1s ease;
  }
  .synth-pad:active, .synth-pad.hit {
    background: var(--accent); color: #fff; border-color: var(--accent);
    transform: scale(0.96);
  }
  .file-drop {
    border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px;
    padding: 10px; text-align: center; font-size: 11px; color: var(--muted);
    cursor: pointer;
  }
  .file-drop:hover { border-color: var(--accent); color: var(--text); }
</style>
</head>
<body>
<canvas id="stage"></canvas>

<div class="shell">
  <div class="card top-bar">
    <div class="brand">
      <div class="pulse-dot" id="liveDot"></div>
      <div>
        <div class="title-main" id="appTitle">${esc(s.title)}</div>
        <div class="subtitle-main" id="appSub">${esc(s.artist)} · ${esc(s.subtitle)}</div>
      </div>
    </div>
    <div class="mode-pills" id="modeBar">
      <button class="pill active" data-mode="bars">Spectrum</button>
      <button class="pill" data-mode="orb">Radial Orb</button>
      <button class="pill" data-mode="wave">Oscilloscope</button>
      <button class="pill" data-mode="particles">Nebula</button>
    </div>
  </div>

  <div class="side-left">
    <div class="card">
      <div class="cover-box" id="coverBox">
        ${imageUrl ? `<img id="coverImg" src="${imageUrl}" alt="Cover" />` : `<div style="font-size:48px;font-weight:800;opacity:0.35">♫</div>`}
        <div class="cover-overlay">
          <div style="font-size:15px;font-weight:700" id="nowTitle">${esc(s.tracks[0]?.title ?? s.audioName)}</div>
          <div style="font-size:12px;color:var(--muted)" id="nowMeta">${esc(s.artist)} · ${s.tracks[0]?.bpm ?? 124} BPM · ${esc(s.tracks[0]?.key ?? 'A minor')}</div>
        </div>
      </div>
    </div>

    <div class="card" style="flex:1">
      <div class="section-label">Tracks & Stems</div>
      <div class="track-list" id="trackList"></div>
      <label class="file-drop" style="margin-top:12px;display:block">
        + Load another audio file (.mp3, .wav, .ogg)
        <input type="file" id="audioInput" accept="audio/*" style="display:none" />
      </label>
    </div>
  </div>

  <div class="center-space"></div>

  <div class="side-right">
    <div class="card">
      <div class="section-label">3-Band Mastering EQ & Speed</div>
      <div class="slider-row">
        <div class="slider-head"><span>Sub / Bass (100 Hz)</span><span id="eqLowVal">0 dB</span></div>
        <input type="range" id="eqLow" min="-12" max="12" step="0.5" value="0" />
      </div>
      <div class="slider-row">
        <div class="slider-head"><span>Presence / Mid (1 kHz)</span><span id="eqMidVal">0 dB</span></div>
        <input type="range" id="eqMid" min="-12" max="12" step="0.5" value="0" />
      </div>
      <div class="slider-row">
        <div class="slider-head"><span>Air / High (8 kHz)</span><span id="eqHighVal">0 dB</span></div>
        <input type="range" id="eqHigh" min="-12" max="12" step="0.5" value="0" />
      </div>
      <div class="slider-row">
        <div class="slider-head"><span>Tempo / Rate</span><span id="rateVal">1.00×</span></div>
        <input type="range" id="rateSlider" min="0.5" max="1.5" step="0.02" value="1" />
      </div>
    </div>

    <div class="card" style="flex:1">
      <div class="section-label">Live Synth & FX Pads (Keys 1–6)</div>
      <div class="pad-grid" id="padGrid">
        <button class="synth-pad" data-note="220" data-type="chord">Am9 Chord</button>
        <button class="synth-pad" data-note="174.61" data-type="chord">Fmaj7 Pad</button>
        <button class="synth-pad" data-note="261.63" data-type="chord">Cmaj9 Swell</button>
        <button class="synth-pad" data-note="196.00" data-type="chord">G6 Arp</button>
        <button class="synth-pad" data-note="55" data-type="sub">808 Sub Drop</button>
        <button class="synth-pad" data-note="880" data-type="riser">Shimmer Bell</button>
      </div>
    </div>
  </div>

  <div class="card bottom-bar">
    <div class="scrubber-wrap">
      <span class="time-readout" id="curTime">0:00</span>
      <canvas id="waveCanvas" width="900" height="42"></canvas>
      <span class="time-readout" id="durTime">3:24</span>
    </div>
    <div class="transport">
      <div class="transport-buttons">
        <button class="btn-icon" id="prevBtn">⏮</button>
        <button class="btn-play" id="playBtn" aria-label="Play or Pause">▶</button>
        <button class="btn-icon" id="nextBtn">⏭</button>
        <button class="btn-icon" id="synthToggle">Synth Groove: Auto</button>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:12px;color:var(--muted)">Volume</span>
        <input type="range" id="volSlider" min="0" max="1" step="0.01" value="0.88" style="width:110px" />
      </div>
    </div>
  </div>
</div>

<audio id="audioEl" crossorigin="anonymous" preload="auto"></audio>

<script>
(function() {
  const SPEC = ${safeSpec};
  const INITIAL_AUDIO = ${JSON.stringify(audioUrl || '')};
  const audioEl = document.getElementById('audioEl');
  const playBtn = document.getElementById('playBtn');
  const stage = document.getElementById('stage');
  const ctx2d = stage.getContext('2d');
  const waveCanvas = document.getElementById('waveCanvas');
  const waveCtx = waveCanvas.getContext('2d');
  const curTimeEl = document.getElementById('curTime');
  const durTimeEl = document.getElementById('durTime');

  let mode = 'bars';
  let activeTrack = 0;
  let hasExternalAudio = Boolean(INITIAL_AUDIO);
  if (INITIAL_AUDIO) {
    audioEl.src = INITIAL_AUDIO;
  }

  let actx = null;
  let analyser = null;
  let gainNode = null;
  let lowEq = null, midEq = null, highEq = null;
  let mediaSource = null;
  let isPlaying = false;
  let synthTimer = null;
  let synthClock = 0;
  let synthElapsed = 0;

  function ensureAudio() {
    if (actx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    actx = new AC();
    analyser = actx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.82;

    lowEq = actx.createBiquadFilter();
    lowEq.type = 'lowshelf';
    lowEq.frequency.value = 100;

    midEq = actx.createBiquadFilter();
    midEq.type = 'peaking';
    midEq.frequency.value = 1000;
    midEq.Q.value = 1;

    highEq = actx.createBiquadFilter();
    highEq.type = 'highshelf';
    highEq.frequency.value = 8000;

    gainNode = actx.createGain();
    gainNode.gain.value = 0.88;

    lowEq.connect(midEq);
    midEq.connect(highEq);
    highEq.connect(gainNode);
    gainNode.connect(analyser);
    analyser.connect(actx.destination);

    try {
      mediaSource = actx.createMediaElementSource(audioEl);
      mediaSource.connect(lowEq);
    } catch (e) {}
  }

  function triggerPad(freq, type) {
    ensureAudio();
    if (actx.state === 'suspended') actx.resume();
    const now = actx.currentTime;
    const ratios = type === 'chord' ? [1, 1.2, 1.5, 1.8] : type === 'sub' ? [1, 0.5] : [1, 1.5, 2];
    ratios.forEach((r, idx) => {
      const osc = actx.createOscillator();
      const g = actx.createGain();
      osc.type = type === 'sub' ? 'sine' : idx % 2 === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq * r, now);
      if (type === 'sub') osc.frequency.exponentialRampToValueAtTime(32, now + 0.55);
      g.gain.setValueAtTime(0.001, now);
      g.gain.exponentialRampToValueAtTime(type === 'sub' ? 0.35 : 0.12, now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0008, now + (type === 'chord' ? 1.4 : 0.65));
      osc.connect(g);
      g.connect(lowEq);
      osc.start(now);
      osc.stop(now + 1.5);
    });
  }

  function startProceduralGroove() {
    stopProceduralGroove();
    const bpm = (SPEC.tracks[activeTrack] && SPEC.tracks[activeTrack].bpm) || 124;
    const stepMs = (60 / bpm / 2) * 1000;
    const roots = [220, 174.61, 261.63, 196.0];
    synthTimer = setInterval(() => {
      if (!isPlaying || hasExternalAudio) return;
      ensureAudio();
      const step = synthClock % 16;
      const bar = Math.floor(synthClock / 16) % roots.length;
      const root = roots[bar];
      if (step === 0 || step === 6 || step === 10) triggerPad(root * 0.5, 'sub');
      if (step === 0 || step === 8) triggerPad(root, 'chord');
      if (step % 2 === 0) triggerPad(root * (step % 4 === 0 ? 2 : 1.5), 'riser');
      synthClock++;
      synthElapsed += stepMs / 1000;
    }, stepMs);
  }

  function stopProceduralGroove() {
    if (synthTimer) {
      clearInterval(synthTimer);
      synthTimer = null;
    }
  }

  function togglePlay() {
    ensureAudio();
    if (actx.state === 'suspended') actx.resume();
    if (isPlaying) {
      isPlaying = false;
      audioEl.pause();
      stopProceduralGroove();
      playBtn.textContent = '▶';
    } else {
      isPlaying = true;
      playBtn.textContent = '⏸';
      if (hasExternalAudio) {
        audioEl.play().catch(() => {
          hasExternalAudio = false;
          startProceduralGroove();
        });
      } else {
        startProceduralGroove();
      }
    }
  }

  playBtn.addEventListener('click', togglePlay);

  function renderTracks() {
    const list = document.getElementById('trackList');
    list.innerHTML = '';
    SPEC.tracks.forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 'track-item' + (i === activeTrack ? ' active' : '');
      row.innerHTML = '<div><div class="track-name">' + t.title + '</div><div class="track-meta">' + t.bpm + ' BPM · ' + t.key + '</div></div><div class="track-meta">' + t.duration + '</div>';
      row.addEventListener('click', () => {
        activeTrack = i;
        document.getElementById('nowTitle').textContent = t.title;
        document.getElementById('nowMeta').textContent = SPEC.artist + ' · ' + t.bpm + ' BPM · ' + t.key;
        renderTracks();
        if (!isPlaying) togglePlay();
        else if (!hasExternalAudio) startProceduralGroove();
      });
      list.appendChild(row);
    });
  }
  renderTracks();

  document.getElementById('prevBtn').addEventListener('click', () => {
    activeTrack = (activeTrack - 1 + SPEC.tracks.length) % SPEC.tracks.length;
    renderTracks();
  });
  document.getElementById('nextBtn').addEventListener('click', () => {
    activeTrack = (activeTrack + 1) % SPEC.tracks.length;
    renderTracks();
  });
  document.getElementById('synthToggle').addEventListener('click', (e) => {
    hasExternalAudio = !hasExternalAudio && Boolean(audioEl.src);
    e.currentTarget.textContent = hasExternalAudio ? 'Source: Uploaded Audio' : 'Source: Live WebAudio Synth';
    if (isPlaying) {
      if (hasExternalAudio) { stopProceduralGroove(); audioEl.play(); }
      else { audioEl.pause(); startProceduralGroove(); }
    }
  });

  document.getElementById('audioInput').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const u = URL.createObjectURL(file);
    audioEl.src = u;
    hasExternalAudio = true;
    const cleanName = file.name.replace(/\\.[a-z0-9]+$/i, '');
    SPEC.tracks.unshift({ title: cleanName, duration: 'Live', bpm: 124, key: 'Custom' });
    activeTrack = 0;
    document.getElementById('nowTitle').textContent = cleanName;
    renderTracks();
    if (!isPlaying) togglePlay();
    else { stopProceduralGroove(); audioEl.play(); }
  });

  document.querySelectorAll('#modeBar .pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#modeBar .pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      mode = btn.getAttribute('data-mode') || 'bars';
    });
  });

  document.querySelectorAll('.synth-pad').forEach((pad) => {
    pad.addEventListener('click', () => {
      pad.classList.add('hit');
      setTimeout(() => pad.classList.remove('hit'), 160);
      triggerPad(Number(pad.getAttribute('data-note') || 220), pad.getAttribute('data-type') || 'chord');
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement === document.body) {
      e.preventDefault();
      togglePlay();
    }
    const idx = ['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6'].indexOf(e.code);
    if (idx >= 0) {
      const pads = document.querySelectorAll('.synth-pad');
      if (pads[idx]) pads[idx].click();
    }
  });

  const bindEq = (id, valId, getNode, unit) => {
    const el = document.getElementById(id);
    const vEl = document.getElementById(valId);
    el.addEventListener('input', () => {
      ensureAudio();
      const v = Number(el.value);
      vEl.textContent = (v > 0 ? '+' : '') + v + unit;
      const n = getNode();
      if (n) n.gain.value = v;
    });
  };
  bindEq('eqLow', 'eqLowVal', () => lowEq, ' dB');
  bindEq('eqMid', 'eqMidVal', () => midEq, ' dB');
  bindEq('eqHigh', 'eqHighVal', () => highEq, ' dB');

  document.getElementById('rateSlider').addEventListener('input', (e) => {
    const r = Number(e.target.value);
    document.getElementById('rateVal').textContent = r.toFixed(2) + '×';
    audioEl.playbackRate = r;
  });
  document.getElementById('volSlider').addEventListener('input', (e) => {
    ensureAudio();
    if (gainNode) gainNode.gain.value = Number(e.target.value);
  });

  waveCanvas.addEventListener('click', (e) => {
    const rect = waveCanvas.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (hasExternalAudio && Number.isFinite(audioEl.duration) && audioEl.duration > 0) {
      audioEl.currentTime = ratio * audioEl.duration;
    } else {
      synthElapsed = ratio * 204;
    }
  });

  function fmt(sec) {
    if (!Number.isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function resize() {
    stage.width = window.innerWidth * window.devicePixelRatio;
    stage.height = window.innerHeight * window.devicePixelRatio;
  }
  window.addEventListener('resize', resize);
  resize();

  const freqData = new Uint8Array(256);
  const timeData = new Uint8Array(256);
  const particles = Array.from({ length: 90 }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 1.5 + Math.random() * 3.5,
    vx: (Math.random() - 0.5) * 0.0012,
    vy: (Math.random() - 0.5) * 0.0012,
    hue: i % 2 === 0 ? SPEC.accent : SPEC.secondary
  }));

  let pointer = { x: 0.5, y: 0.5 };
  stage.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX / window.innerWidth;
    pointer.y = e.clientY / window.innerHeight;
  });
  stage.addEventListener('pointerdown', (e) => {
    const freq = 110 + (1 - e.clientY / window.innerHeight) * 550;
    triggerPad(freq, 'chord');
  });

  function drawFrame(ts) {
    const w = stage.width;
    const h = stage.height;
    ctx2d.fillStyle = 'rgba(7, 7, 11, 0.24)';
    ctx2d.fillRect(0, 0, w, h);

    if (analyser && isPlaying) {
      analyser.getByteFrequencyData(freqData);
      analyser.getByteTimeDomainData(timeData);
    } else {
      for (let i = 0; i < 256; i++) {
        freqData[i] = isPlaying ? Math.floor(80 + 60 * Math.sin(ts * 0.006 + i * 0.15)) : Math.floor(14 + 8 * Math.sin(ts * 0.002 + i * 0.1));
        timeData[i] = 128 + Math.floor(24 * Math.sin(ts * 0.004 + i * 0.08));
      }
    }

    let bass = 0;
    for (let i = 0; i < 16; i++) bass += freqData[i];
    bass = bass / (16 * 255);

    const grad = ctx2d.createRadialGradient(w * pointer.x, h * pointer.y, 10, w * 0.5, h * 0.5, Math.max(w, h) * 0.65);
    grad.addColorStop(0, SPEC.accent + '33');
    grad.addColorStop(0.5, SPEC.secondary + '18');
    grad.addColorStop(1, 'transparent');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, w, h);

    if (mode === 'bars') {
      const count = 72;
      const bw = (w * 0.52) / count;
      const startX = w * 0.24;
      const baseY = h * 0.72;
      for (let i = 0; i < count; i++) {
        const v = freqData[i * 2] / 255;
        const bh = Math.max(8, v * h * 0.42);
        ctx2d.fillStyle = i % 2 === 0 ? SPEC.accent : SPEC.secondary;
        ctx2d.beginPath();
        ctx2d.roundRect(startX + i * bw, baseY - bh, bw * 0.72, bh, 6);
        ctx2d.fill();
      }
    } else if (mode === 'orb') {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const baseR = Math.min(w, h) * (0.14 + bass * 0.08);
      const rays = 96;
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2 + ts * 0.0004;
        const v = freqData[i % 128] / 255;
        const r2 = baseR + v * Math.min(w, h) * 0.22;
        ctx2d.strokeStyle = i % 2 === 0 ? SPEC.accent : SPEC.secondary;
        ctx2d.lineWidth = 3 * window.devicePixelRatio;
        ctx2d.beginPath();
        ctx2d.moveTo(cx + Math.cos(angle) * baseR, cy + Math.sin(angle) * baseR);
        ctx2d.lineTo(cx + Math.cos(angle) * r2, cy + Math.sin(angle) * r2);
        ctx2d.stroke();
      }
    } else if (mode === 'wave') {
      ctx2d.strokeStyle = SPEC.accent;
      ctx2d.lineWidth = 4 * window.devicePixelRatio;
      ctx2d.beginPath();
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w;
        const y = h * 0.5 + ((timeData[i] - 128) / 128) * (h * 0.28);
        if (i === 0) ctx2d.moveTo(x, y);
        else ctx2d.lineTo(x, y);
      }
      ctx2d.stroke();
    } else {
      particles.forEach((p, idx) => {
        p.x = (p.x + p.vx * (1 + bass * 4) + 1) % 1;
        p.y = (p.y + p.vy * (1 + bass * 4) + 1) % 1;
        const v = freqData[idx % 128] / 255;
        ctx2d.fillStyle = p.hue;
        ctx2d.beginPath();
        ctx2d.arc(p.x * w, p.y * h, (p.r + v * 9) * window.devicePixelRatio, 0, Math.PI * 2);
        ctx2d.fill();
      });
    }

    // Scrubber waveform
    const ww = waveCanvas.width;
    const wh = waveCanvas.height;
    waveCtx.clearRect(0, 0, ww, wh);
    const dur = hasExternalAudio && Number.isFinite(audioEl.duration) && audioEl.duration > 0 ? audioEl.duration : 204;
    const cur = hasExternalAudio ? audioEl.currentTime : (synthElapsed % dur);
    curTimeEl.textContent = fmt(cur);
    durTimeEl.textContent = fmt(dur);
    const prog = Math.max(0, Math.min(1, cur / dur));

    const bars = 90;
    const stepW = ww / bars;
    for (let i = 0; i < bars; i++) {
      const ratio = i / bars;
      const amp = 0.25 + 0.65 * Math.abs(Math.sin(i * 0.43 + 1.7) * Math.cos(i * 0.19));
      const bh = amp * (wh - 8);
      waveCtx.fillStyle = ratio <= prog ? SPEC.accent : 'rgba(255,255,255,0.22)';
      waveCtx.fillRect(i * stepW + 1, (wh - bh) / 2, stepW - 3, bh);
    }

    requestAnimationFrame(drawFrame);
  }
  requestAnimationFrame(drawFrame);
})();
</script>
</body>
</html>`;
}
const SCHEMA = {
    type: 'object',
    additionalProperties: false,
    required: ['preset', 'title', 'subtitle', 'artist', 'accent', 'secondary', 'tracks'],
    properties: {
        preset: { type: 'string', enum: PRESET_LIST },
        title: { type: 'string' },
        subtitle: { type: 'string' },
        artist: { type: 'string' },
        accent: { type: 'string' },
        secondary: { type: 'string' },
        tracks: {
            type: 'array',
            items: {
                type: 'object',
                additionalProperties: false,
                required: ['title', 'duration', 'bpm', 'key'],
                properties: {
                    title: { type: 'string' },
                    duration: { type: 'string' },
                    bpm: { type: 'number' },
                    key: { type: 'string' },
                },
            },
        },
    },
};
/** Resolve an audio or image Stored file from a tab number or from any tab in the conversation. */
function findMedia(w, tabNum, mimePrefix) {
    if (tabNum > 0) {
        const m = w.find(tabNum);
        const hit = m ? current(m).files.find((f) => f.mime.startsWith(mimePrefix)) : null;
        if (hit)
            return hit;
    }
    // Scan recent tabs (1..12) for matching media if none explicitly passed
    for (let i = 1; i <= 12; i++) {
        const m = w.find(i);
        if (!m)
            continue;
        const hit = current(m).files.find((f) => f.mime.startsWith(mimePrefix));
        if (hit)
            return hit;
    }
    return null;
}
async function renderApp(w, s) {
    w.doing('Building the interactive app');
    const audioUrl = s.audio ? await data(await read(w.wire, s.audio)).catch(() => '') : '';
    const imageUrl = s.image ? await data(await read(w.wire, s.image)).catch(() => '') : '';
    const html = buildAppHtml(s, audioUrl, imageUrl);
    const stored = await w.keep('app.html', new Blob([html], { type: 'text/html' }));
    return [stored];
}
export const app = {
    id: 'app',
    label: 'Interactive app',
    blurb: 'Music player & visualizer apps, synth studios, and interactive visual experiences from your files or a prompt.',
    icon: Sparkles,
    tool: {
        name: 'make_app',
        description: 'Create a full-blown interactive HTML5/Canvas/WebAudio app in a tab — such as a music player & visualizer app built around an uploaded music/audio file or generated track, an interactive synth studio, or an interactive visual experience.',
        parameters: {
            type: 'object',
            properties: {
                title: { type: 'string', description: 'Title of the music app or interactive experience.' },
                subtitle: { type: 'string', description: 'Tagline or subtitle.' },
                artist: { type: 'string', description: 'Artist, creator, or brand name.' },
                preset: {
                    type: 'string',
                    enum: PRESET_LIST,
                    description: 'music-app for a full music player + EQ + visualizer + stem deck; visualizer for full-screen audio/visual art; synth-studio for an interactive synthesizer.',
                },
                prompt: { type: 'string', description: 'Visual and musical direction, mood, colours, and features.' },
                audio_tab: { type: 'integer', description: '1-based tab number of an uploaded or generated audio/music file to wire into the app.' },
                image_tab: { type: 'integer', description: '1-based tab number of an uploaded or generated image to use as cover art / visual backdrop.' },
                accent: { type: 'string', description: 'Primary hex colour, e.g. #f43f5e.' },
                secondary: { type: 'string', description: 'Secondary hex colour, e.g. #a1a1aa.' },
            },
            required: ['title', 'prompt'],
        },
    },
    needs: () => null,
    make: async (w, args) => {
        const audioFile = findMedia(w, num(args.audio_tab, 0), 'audio/');
        const imageFile = findMedia(w, num(args.image_tab, 0), 'image/');
        const prompt = str(args.prompt, str(args.title, 'Interactive music & visualizer app'));
        let enriched = {};
        try {
            w.doing('Designing the app layout & tracklist');
            enriched = await structured(w.wire, w.writer, 'You design interactive music and visual web apps. Given the user prompt and any attached audio/image filename, return a cohesive title, subtitle, artist name, vibrant hex accent & secondary colours, and a 3-4 item track/stem list.', `Prompt: ${prompt}\nAudio file: ${audioFile?.name ?? 'Live WebAudio Synth'}\nTitle hint: ${str(args.title)}`, SCHEMA, w.signal);
        }
        catch {
            // Fallback cleanly to deterministic defaults
        }
        const cleanAudioName = audioFile?.name ? audioFile.name.replace(/\.[a-z0-9]+$/i, '') : str(args.title, 'Featured Track');
        const s = parseSpec({
            ...enriched,
            preset: str(args.preset, enriched.preset ?? 'music-app'),
            title: str(args.title, enriched.title || cleanAudioName || 'Sonic Studio'),
            subtitle: str(args.subtitle, enriched.subtitle || 'Interactive Music Player, 3-Band EQ & Visualizer'),
            artist: str(args.artist, enriched.artist || 'Hanzo Studio'),
            prompt,
            accent: str(args.accent, enriched.accent || (w.brand?.colors.accent ?? '#f43f5e')),
            secondary: str(args.secondary, enriched.secondary || '#a1a1aa'),
            audio: audioFile?.key ?? '',
            audioName: cleanAudioName,
            image: imageFile?.key ?? '',
            tracks: enriched.tracks?.length
                ? [{ title: cleanAudioName, duration: '3:24', bpm: enriched.tracks[0]?.bpm ?? 124, key: enriched.tracks[0]?.key ?? 'A minor' }, ...enriched.tracks.slice(1)]
                : undefined,
            system: w.brand ?? PRESETS[0],
        });
        const files = await renderApp(w, s);
        return {
            title: s.title,
            draft: {
                spec: s,
                files,
                note: audioFile ? `${s.title} (wired to ${audioFile.name})` : s.title,
                by: 'Studio interactive engine',
            },
        };
    },
    revise: async (w, made, change) => {
        const now = parseSpec(current(made).spec);
        let next = { ...now, ...(change.patch ?? {}) };
        if (change.instruction) {
            w.doing('Updating the interactive app');
            try {
                const ask = await structured(w.wire, w.writer, 'You revise an interactive music & visual app spec. Apply the instruction and return the updated JSON spec.', `Current spec: ${JSON.stringify({ preset: now.preset, title: now.title, subtitle: now.subtitle, artist: now.artist, accent: now.accent, secondary: now.secondary, tracks: now.tracks })}\nInstruction: ${change.instruction}`, SCHEMA, w.signal);
                next = parseSpec({ ...now, ...ask, audio: now.audio, audioName: now.audioName, image: now.image });
            }
            catch {
                next = parseSpec({ ...now, subtitle: change.instruction });
            }
        }
        const files = await renderApp(w, next);
        return { spec: next, files, note: change.instruction ?? 'Updated app', by: 'Studio interactive engine' };
    },
    View: AppFrame,
    exports: [
        {
            label: 'Interactive App (HTML)',
            run: async (w, m, v) => ({ name: filename(m.title, 'html'), blob: await read(w, v.files[0].key) }),
        },
    ],
};
function AppFrame({ made, version, wire, edit, busy }) {
    const s = parseSpec(version.spec);
    const [draft, setDraft] = useState(s);
    const [srcDoc, setSrcDoc] = useState('');
    useEffect(() => setDraft(parseSpec(version.spec)), [version.id]);
    useEffect(() => {
        let live = true;
        const f = version.files[0];
        if (!f)
            return;
        read(wire, f.key)
            .then((b) => b.text())
            .then((txt) => {
            if (live)
                setSrcDoc(txt);
        })
            .catch(() => undefined);
        return () => {
            live = false;
        };
    }, [wire, version.id]);
    const changed = draft.title !== s.title ||
        draft.subtitle !== s.subtitle ||
        draft.artist !== s.artist ||
        draft.accent !== s.accent ||
        draft.secondary !== s.secondary ||
        draft.prompt !== s.prompt;
    const set = (patch) => setDraft({ ...draft, ...patch });
    return (_jsxs(YStack, { flex: 1, minH: 0, $md: { flexDirection: 'row' }, children: [_jsx(YStack, { flex: 1, minH: 360, bg: "#07070b", position: "relative", children: srcDoc ? (_jsx("iframe", { title: made.title, srcDoc: srcDoc, sandbox: "allow-scripts allow-downloads", style: { width: '100%', height: '100%', border: 0, display: 'block' } })) : (_jsx(YStack, { flex: 1, items: "center", justify: "center", children: _jsx(SizableText, { color: "$soft", children: "Loading interactive app\u2026" }) })) }), _jsxs(YStack, { width: "100%", $md: { width: 290 }, gap: "$3", p: "$3", overflow: "scroll", borderLeftWidth: 1, borderColor: "$borderColor", children: [_jsx(Row, { label: "App title", children: _jsx(Text1, { label: "App title", value: draft.title, onChange: (title) => set({ title }) }) }), _jsx(Row, { label: "Artist / Creator", children: _jsx(Text1, { label: "Artist", value: draft.artist, onChange: (artist) => set({ artist }) }) }), _jsx(Row, { label: "Subtitle", children: _jsx(Text1, { label: "Subtitle", value: draft.subtitle, onChange: (subtitle) => set({ subtitle }) }) }), _jsx(Row, { label: "Primary accent", children: _jsx(Text1, { label: "Primary accent", value: draft.accent, onChange: (accent) => set({ accent }) }) }), _jsx(Row, { label: "Secondary colour", children: _jsx(Text1, { label: "Secondary colour", value: draft.secondary, onChange: (secondary) => set({ secondary }) }) }), _jsx(Row, { label: "Creative direction", children: _jsx(TextN, { label: "Creative direction", rows: 3, value: draft.prompt, onChange: (prompt) => set({ prompt }) }) }), _jsx(XStack, { render: "button", "aria-label": "Save changes to app", disabled: !changed || busy, onPress: () => changed && !busy && edit(draft, 'Updated app settings'), height: 36, items: "center", justify: "center", rounded: "$3", bg: changed ? '$ink' : '$hover', cursor: changed ? 'pointer' : 'default', children: _jsx(SizableText, { size: "$2", color: changed ? '$background' : '$soft', children: busy ? 'Rebuilding…' : 'Rebuild app' }) })] })] }));
}
