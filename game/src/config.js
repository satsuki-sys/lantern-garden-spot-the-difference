// Lantern Garden — every shared number and colour lives here.
// The canvas is a fixed 1280x720 stage; the two picture panels sit side by
// side under the header bar, and each panel paints the same 610x540 scene.

export const STAGE = { width: 1280, height: 720 };
export const HEADER_HEIGHT = 84;
export const PANEL = { width: 610, height: 540, top: 108, leftX: 20, rightX: 650, gap: 20 };
export const SCENE = { width: 610, height: 540 };

/** A click this close (scene pixels) to a difference centre counts as a find. */
export const FIND_RADIUS = 30;

export const SCORE = {
  find: 100,
  cleanLevelBonus: 150,
  hintCost: 40,
  missSeconds: 5,
  secondBonus: 2,
};

export const LEVELS = [
  {
    name: 'Dusk Garden',
    subtitle: 'Level 1 · 5 differences',
    seedSalt: 101,
    differences: 5,
    seconds: 180,
    hints: 3,
    sky: ['#2b3a67', '#4968a8'],
    subtlety: 1,
  },
  {
    name: 'Firefly Hollow',
    subtitle: 'Level 2 · 7 differences',
    seedSalt: 707,
    differences: 7,
    seconds: 240,
    hints: 3,
    sky: ['#1d2a52', '#3a5a96'],
    subtlety: 0.8,
  },
  {
    name: 'Midnight Conservatory',
    subtitle: 'Level 3 · 9 differences',
    seedSalt: 1301,
    differences: 9,
    seconds: 300,
    hints: 2,
    sky: ['#141d3d', '#2c447c'],
    subtlety: 0.62,
  },
];

export const PALETTE = {
  ink: '#0d1120',
  paper: '#f4ead2',
  cream: '#ffe9b8',
  gold: '#f2b33d',
  coral: '#ef6461',
  leaf: '#5da85f',
  leafDark: '#2f6b4f',
  pine: '#274e3d',
  blossom: '#f2a7c3',
  water: '#2e6da8',
  waterLight: '#7fc4e8',
  wood: '#7a4b2a',
  stone: '#9aa3ad',
  marker: '#ffd94d',
  markerFound: '#7be495',
  danger: '#ff6b5e',
  panelEdge: '#f4ead2',
};

export const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const BEST_KEY = 'lantern-garden.best';
