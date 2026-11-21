# lantern-garden-spot-the-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/satsuki-sys/lantern-garden-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/satsuki-sys/lantern-garden-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Lantern Garden** — an original spot-the-difference game that plays offline in a desktop browser from its own static files. Two near-identical moonlit gardens sit side by side; a handful of things have changed between them. Click a difference in either picture to ring it on both, beat the clock, and clear all three gardens.

## The game

- Three gardens of rising difficulty: **Dusk Garden** (5 differences), **Firefly Hollow** (7), **Midnight Conservatory** (9)
- Five kinds of change — recolour, vanish, resize, wander, flip — plus a visitor who appears only in the right-hand garden on later levels
- Every garden is grown from a seed by a procedural scene builder, so a level and its differences are the same on every run
- Found differences ring green on both panels with a spark burst and a chime; the header always shows how many remain
- Hints pulse a wide golden ring around one hiding spot (never the exact spot), wrong clicks cost 5 seconds, and the timer bar turns red under 30 seconds
- Keyboard and mouse: click to find, **H** hint, **R** restart, **Space** start / continue
- Sounds are synthesized live with WebAudio — no audio files, no network

## Play it

```sh
node serve.ts          # serves game/ at http://localhost:8080
```

Then open http://localhost:8080 in desktop Chrome. The game is plain static files under `game/` — any static file server works, and it makes no network request.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library in `vendor/makefun-game.ts`, unchanged from the kit.

## Layout

- `game/index.html` — the page, its styles, the canvas
- `game/src/config.js` — stage geometry, level definitions, palette, scoring
- `game/src/random.js` — the seeded random stream every garden grows from
- `game/src/scene.js` — builds a garden and plants its differences
- `game/src/render.js` — paints panels, markers, hint rings and sparks
- `game/src/game.js` — game state, input, timer, the on-canvas interface
- `game/src/audio.js` — the synthesized chimes
- `game/src/shots.js` — staged scenes for the screenshots (`?shot=start|play|end`)
- `game/src/main.js` — boot and the frame loop

## License

MIT — see `LICENSE`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=27qytqes&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
