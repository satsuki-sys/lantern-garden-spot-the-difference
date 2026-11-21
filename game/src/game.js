// Game state and the whole on-canvas interface: header counter, timer
// bar, buttons, title / clear / time-up panels. The canvas is the only
// surface, so screenshots show the complete game exactly as played.

import {
  BEST_KEY, FIND_RADIUS, FONT_STACK, HEADER_HEIGHT, LEVELS, PALETTE, PANEL, SCORE, STAGE,
} from './config.js';
import { buildLevel, itemsForSide } from './scene.js';
import { drawFoundMarker, drawHintRing, drawMissMark, drawPanel, drawSparks } from './render.js';
import { playFind, playHint, playLevelClear, playMiss, unlockAudio } from './audio.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

const BUTTONS = {
  hint: { x: 1052, y: 14, w: 96, h: 52, label: 'Hint' },
  restart: { x: 1160, y: 14, w: 100, h: 52, label: 'Restart' },
};

export function createGame(canvas) {
  const ctx = canvas.getContext('2d');
  const state = {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    built: null,
    found: new Set(),
    score: 0,
    best: readBest(),
    secondsLeft: 0,
    hintsLeft: 0,
    misses: 0,
    hintSpot: null,
    hintUntil: 0,
    missMark: null,
    sparks: [],
    message: '',
    messageUntil: 0,
    startedAt: 0,
  };

  function readBest() {
    try {
      return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
    } catch {
      return 0;
    }
  }

  function saveBest() {
    if (state.score <= state.best) return;
    state.best = state.score;
    try {
      window.localStorage.setItem(BEST_KEY, String(state.best));
    } catch {
      // Private windows: the best score lasts for this visit only.
    }
  }

  function startLevel(levelIndex) {
    state.levelIndex = levelIndex;
    state.built = buildLevel(levelIndex);
    state.found = new Set();
    state.secondsLeft = LEVELS[levelIndex].seconds;
    state.hintsLeft = LEVELS[levelIndex].hints;
    state.misses = 0;
    state.hintSpot = null;
    state.missMark = null;
    state.sparks = [];
    state.screen = SCREEN_PLAY;
    state.startedAt = performance.now();
  }

  function startRun() {
    state.score = 0;
    startLevel(0);
  }

  function remaining() {
    return state.built ? state.built.differences.length - state.found.size : 0;
  }

  function say(message, seconds = 2.2) {
    state.message = message;
    state.messageUntil = performance.now() + seconds * 1000;
  }

  function findAt(side, sx, sy) {
    const built = state.built;
    for (const diff of built.differences) {
      if (state.found.has(diff.id)) continue;
      const cx = side === 'right' ? diff.rightX : diff.x;
      const cy = side === 'right' ? diff.rightY : diff.y;
      const dist = Math.hypot(sx - cx, sy - cy);
      if (dist <= Math.max(FIND_RADIUS, diff.radius)) return diff;
    }
    return null;
  }

  function burst(x, y, side) {
    for (let i = 0; i < 10; i += 1) {
      const angle = (i / 10) * Math.PI * 2;
      state.sparks.push({
        x: x + Math.cos(angle) * 6,
        y: y + Math.sin(angle) * 6,
        vx: Math.cos(angle) * 90,
        vy: Math.sin(angle) * 90 - 30,
        age: 0,
        life: 0.55,
        side,
      });
    }
  }

  function handlePanelClick(side, sx, sy, now) {
    if (state.screen !== SCREEN_PLAY) return;
    const diff = findAt(side, sx, sy);
    if (diff) {
      state.found.add(diff.id);
      state.score += SCORE.find;
      if (state.hintSpot && state.hintSpot.id === diff.id) state.hintSpot = null;
      burst(diff.x, diff.y, 'left');
      burst(diff.rightX, diff.rightY, 'right');
      playFind();
      if (remaining() === 0) {
        state.score += SCORE.cleanLevelBonus + Math.floor(state.secondsLeft) * SCORE.secondBonus;
        saveBest();
        playLevelClear();
        state.screen = state.levelIndex === LEVELS.length - 1 ? SCREEN_WIN : SCREEN_CLEAR;
      } else {
        say(`Found it — ${diff.label}! ${remaining()} to go.`);
      }
    } else {
      state.misses += 1;
      state.secondsLeft = Math.max(0, state.secondsLeft - SCORE.missSeconds);
      state.missMark = { side, x: sx, y: sy, until: now + 650 };
      playMiss();
      say(`Nothing there — ${SCORE.missSeconds} seconds lost.`);
    }
  }

  function useHint(now) {
    if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return;
    const open = state.built.differences.filter((d) => !state.found.has(d.id));
    if (!open.length) return;
    const target = open[Math.floor(Math.random() * open.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - SCORE.hintCost);
    state.hintSpot = target;
    state.hintUntil = now + 2600;
    playHint();
    say('Something glimmers inside the golden ring…');
  }

  function clickAt(px, py, now) {
    unlockAudio();
    if (state.screen === SCREEN_PLAY) {
      for (const [name, b] of Object.entries(BUTTONS)) {
        if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) {
          if (name === 'hint') useHint(now);
          if (name === 'restart') startLevel(state.levelIndex);
          return;
        }
      }
    }
    if (px >= PANEL.leftX && px < PANEL.leftX + PANEL.width && py >= PANEL.top && py < PANEL.top + PANEL.height) {
      handlePanelClick('left', px - PANEL.leftX, py - PANEL.top, now);
    } else if (px >= PANEL.rightX && px < PANEL.rightX + PANEL.width && py >= PANEL.top && py < PANEL.top + PANEL.height) {
      handlePanelClick('right', px - PANEL.rightX, py - PANEL.top, now);
    } else if (state.screen !== SCREEN_PLAY) {
      advanceFromPanel();
    }
  }

  function advanceFromPanel() {
    if (state.screen === SCREEN_TITLE) startRun();
    else if (state.screen === SCREEN_CLEAR) startLevel(state.levelIndex + 1);
    else if (state.screen === SCREEN_OVER || state.screen === SCREEN_WIN) startRun();
  }

  function key(code) {
    unlockAudio();
    if (code === 'KeyH') useHint(performance.now());
    else if (code === 'KeyR' && state.screen === SCREEN_PLAY) startLevel(state.levelIndex);
    else if (code === 'Space' || code === 'Enter') {
      if (state.screen !== SCREEN_PLAY) advanceFromPanel();
    }
  }

  function update(dt, now) {
    if (state.screen === SCREEN_PLAY) {
      state.secondsLeft -= dt;
      if (state.secondsLeft <= 0) {
        state.secondsLeft = 0;
        saveBest();
        state.screen = SCREEN_OVER;
      }
    }
    for (const spark of state.sparks) {
      spark.age += dt;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vy += 260 * dt;
    }
    state.sparks = state.sparks.filter((s) => s.age < s.life);
    if (state.hintSpot && now > state.hintUntil) state.hintSpot = null;
    if (state.missMark && now > state.missMark.until) state.missMark = null;
  }

  function panelFrame(x, label) {
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, PANEL.top, PANEL.width, PANEL.height);
    ctx.fillStyle = PALETTE.paper;
    ctx.font = `600 17px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.fillText(label, x + 4, PANEL.top - 8);
  }

  function drawHeader(now) {
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(0, 0, STAGE.width, HEADER_HEIGHT);
    ctx.fillStyle = PALETTE.cream;
    ctx.font = `700 26px ${FONT_STACK}`;
    ctx.textAlign = 'left';
    ctx.fillText('Lantern Garden', 20, 36);
    ctx.font = `400 15px ${FONT_STACK}`;
    ctx.fillStyle = '#c9cede';
    const level = LEVELS[state.levelIndex];
    ctx.fillText(state.screen === SCREEN_TITLE ? 'Spot the difference under the lanterns' : level.subtitle, 20, 62);

    if (state.built && state.screen !== SCREEN_TITLE) {
      const total = state.built.differences.length;
      ctx.font = `700 24px ${FONT_STACK}`;
      ctx.fillStyle = PALETTE.marker;
      ctx.textAlign = 'center';
      ctx.fillText(`Found ${state.found.size} of ${total} · ${remaining()} remain`, 500, 40);
      ctx.font = `400 16px ${FONT_STACK}`;
      ctx.fillStyle = PALETTE.paper;
      ctx.fillText(`Score ${state.score} · Best ${state.best} · Hints ${state.hintsLeft}`, 500, 64);

      // Timer bar: gold while comfortable, red under thirty seconds.
      const frac = state.secondsLeft / level.seconds;
      ctx.fillStyle = '#2a3050';
      ctx.fillRect(726, 26, 300, 16);
      ctx.fillStyle = state.secondsLeft < 30 ? PALETTE.danger : PALETTE.gold;
      ctx.fillRect(726, 26, Math.max(0, 300 * frac), 16);
      ctx.fillStyle = PALETTE.paper;
      ctx.font = `600 15px ${FONT_STACK}`;
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.ceil(state.secondsLeft)}s`, 726, 62);

      for (const b of Object.values(BUTTONS)) {
        ctx.fillStyle = '#232a45';
        ctx.strokeStyle = '#4a5478';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.w, b.h, 9);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = PALETTE.paper;
        ctx.font = `600 16px ${FONT_STACK}`;
        ctx.textAlign = 'center';
        ctx.fillText(b.label, b.x + b.w / 2, b.y + 33);
      }
    }
    if (state.message && now < state.messageUntil && state.screen === SCREEN_PLAY) {
      ctx.font = `600 17px ${FONT_STACK}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = PALETTE.cream;
      ctx.fillText(state.message, STAGE.width / 2, 692);
    }
  }

  function drawPanels(now) {
    const built = state.built ?? buildLevel(0);
    const pulse = 0.5 + 0.5 * Math.sin(now / 280);
    drawPanel(ctx, PANEL.leftX, PANEL.top, itemsForSide(built, 'left'), built.level.sky);
    drawPanel(ctx, PANEL.rightX, PANEL.top, itemsForSide(built, 'right'), built.level.sky);
    panelFrame(PANEL.leftX, 'Original');
    panelFrame(PANEL.rightX, 'Changed');
    if (!state.built) return;
    for (const diff of built.differences) {
      if (!state.found.has(diff.id)) continue;
      drawFoundMarker(ctx, PANEL.leftX, PANEL.top, diff.x, diff.y, diff.radius, pulse);
      drawFoundMarker(ctx, PANEL.rightX, PANEL.top, diff.rightX, diff.rightY, diff.radius, pulse);
    }
    if (state.hintSpot) {
      const strength = Math.max(0, (state.hintUntil - now) / 2600);
      drawHintRing(ctx, PANEL.leftX, PANEL.top, state.hintSpot.x, state.hintSpot.y, strength);
      drawHintRing(ctx, PANEL.rightX, PANEL.top, state.hintSpot.rightX, state.hintSpot.rightY, strength);
    }
    if (state.missMark) {
      const ox = state.missMark.side === 'right' ? PANEL.rightX : PANEL.leftX;
      drawMissMark(ctx, ox, PANEL.top, state.missMark.x, state.missMark.y, 0.9);
    }
    for (const side of ['left', 'right']) {
      const ox = side === 'right' ? PANEL.rightX : PANEL.leftX;
      drawSparks(ctx, ox, PANEL.top, state.sparks.filter((s) => s.side === side));
    }
  }

  function veilPanel(title, lines, prompt) {
    ctx.fillStyle = 'rgba(10, 13, 26, 0.78)';
    ctx.fillRect(0, HEADER_HEIGHT, STAGE.width, STAGE.height - HEADER_HEIGHT);
    ctx.fillStyle = PALETTE.paper;
    ctx.textAlign = 'center';
    ctx.font = `700 44px ${FONT_STACK}`;
    ctx.fillText(title, STAGE.width / 2, 300);
    ctx.font = `400 20px ${FONT_STACK}`;
    lines.forEach((line, i) => ctx.fillText(line, STAGE.width / 2, 348 + i * 30));
    ctx.font = `600 19px ${FONT_STACK}`;
    ctx.fillStyle = PALETTE.marker;
    ctx.fillText(prompt, STAGE.width / 2, 348 + lines.length * 30 + 26);
  }

  function draw(now) {
    ctx.fillStyle = PALETTE.ink;
    ctx.fillRect(0, 0, STAGE.width, STAGE.height);
    drawPanels(now);
    drawHeader(now);
    if (state.screen === SCREEN_TITLE) {
      veilPanel('Lantern Garden', [
        'Two gardens, lit by the same lanterns — almost.',
        'Click a difference in either picture to ring it on both.',
        'Three gardens, more differences each time, one ticking clock.',
        'Keys: H hint · R restart · Space start',
      ], 'Click or press Space to begin');
    } else if (state.screen === SCREEN_CLEAR) {
      veilPanel(`${LEVELS[state.levelIndex].name} — all found!`, [
        `Score ${state.score} · Misses ${state.misses}`,
        `Next: ${LEVELS[state.levelIndex + 1].name} hides ${LEVELS[state.levelIndex + 1].differences} differences.`,
      ], 'Click or press Space for the next garden');
    } else if (state.screen === SCREEN_OVER) {
      veilPanel('The lanterns go out…', [
        `Time ran out with ${remaining()} difference${remaining() === 1 ? '' : 's'} still hiding.`,
        `Score ${state.score} · Best ${state.best}`,
      ], 'Click or press Space to try again');
    } else if (state.screen === SCREEN_WIN) {
      veilPanel('Every difference found!', [
        `All three gardens cleared. Final score ${state.score} · Best ${state.best}`,
        'The garden glows a little brighter tonight.',
      ], 'Click or press Space to play again');
    }
  }

  return { state, startRun, startLevel, clickAt, key, update, draw, useHint };
}
