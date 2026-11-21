// Screenshot staging: ?shot=start|play|end&seed=N freezes one scene so the
// maker can photograph the game exactly as it plays.
// - start: the title over the first garden
// - play:  Firefly Hollow mid-hunt — 3 of 7 differences ringed, 4 still
//          hiding, the clock at 2:41 and a hint ring fading
// - end:   the victory panel over the finished third garden

import { LEVELS } from './config.js';
import { SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './game.js';

export function stageShot(game, name) {
  const { state } = game;
  if (name === 'start') {
    game.startLevel(0);
    state.screen = SCREEN_TITLE;
    return;
  }
  if (name === 'end') {
    game.startLevel(LEVELS.length - 1);
    for (const diff of state.built.differences) state.found.add(diff.id);
    state.score = 2740;
    state.best = 2740;
    state.secondsLeft = 96;
    state.screen = SCREEN_WIN;
    return;
  }
  // Default: mid-play on level 2.
  game.startLevel(1);
  const diffs = state.built.differences;
  for (const diff of diffs.slice(0, 3)) state.found.add(diff.id);
  state.score = 300;
  state.best = 1250;
  state.secondsLeft = 161;
  state.hintsLeft = 2;
  state.screen = SCREEN_PLAY;
  const open = diffs.find((d) => !state.found.has(d.id));
  if (open) {
    state.hintSpot = open;
    state.hintUntil = performance.now() + 60000;
  }
  state.message = 'Found it — a colour changed! 4 to go.';
  state.messageUntil = performance.now() + 60000;
}
