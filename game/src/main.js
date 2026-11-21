// Boot: fit the 1280x720 stage to the window, wire mouse and keyboard,
// and run one requestAnimationFrame loop. With ?shot=... the loop paints
// a staged scene twice and raises window.__shotReady for the screenshot.

import { STAGE } from './config.js';
import { createGame } from './game.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame(canvas);

function fitCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const scale = Math.min(window.innerWidth / STAGE.width, window.innerHeight / STAGE.height);
  canvas.width = Math.round(STAGE.width * scale * ratio);
  canvas.height = Math.round(STAGE.height * scale * ratio);
  canvas.style.width = `${Math.round(STAGE.width * scale)}px`;
  canvas.style.height = `${Math.round(STAGE.height * scale)}px`;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(canvas.width / STAGE.width, 0, 0, canvas.height / STAGE.height, 0, 0);
}

function toStage(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * STAGE.width,
    y: ((event.clientY - rect.top) / rect.height) * STAGE.height,
  };
}

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');

if (shotName) {
  fitCanvas();
  stageShot(game, shotName);
  let painted = 0;
  const paint = () => {
    game.draw(performance.now());
    painted += 1;
    if (painted < 3) requestAnimationFrame(paint);
    else window.__shotReady = true;
  };
  requestAnimationFrame(paint);
} else {
  fitCanvas();
  window.addEventListener('resize', fitCanvas);
  canvas.addEventListener('pointerdown', (event) => {
    const point = toStage(event);
    game.clickAt(point.x, point.y, performance.now());
  });
  window.addEventListener('keydown', (event) => {
    if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
    game.key(event.code);
  });
  let last = performance.now();
  const frame = (now) => {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    game.update(dt, now);
    game.draw(now);
    const { screen, found, built } = game.state;
    if (built) {
      status.textContent = `${screen}: found ${found.size} of ${built.differences.length} differences`;
    }
  };
  requestAnimationFrame(frame);
}
