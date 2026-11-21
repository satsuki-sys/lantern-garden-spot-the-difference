// Scene building: one garden, described as a list of items with anchors.
// The left panel paints the list as it stands; the right panel paints it
// with a handful of mutations applied. Each mutation becomes one difference
// the player can find, with the spot to click on each panel.
//
// Item: { id, kind, x, y, size, color, variant }
// Difference: { id, itemId, kind, x, y, rightX, rightY, radius, label }

import { LEVELS, PALETTE } from './config.js';
import { createDice } from './random.js';

const FLOWER_COLORS = [PALETTE.coral, PALETTE.blossom, PALETTE.gold, '#b18ce8', '#f4845f'];
const LANTERN_COLORS = ['#f2b33d', '#ef6461', '#f4ead2', '#7fc4e8', '#f2a7c3'];
const FRUIT_COLORS = ['#ef6461', '#f2b33d', '#f4845f'];

function item(id, kind, x, y, size, color, variant = 0) {
  return { id, kind, x, y, size, color, variant };
}

/** The composed garden before any difference is planted in it. */
export function buildGarden(dice, level) {
  const items = [];
  items.push(item('moon', 'moon', 508, 74, 34, PALETTE.cream));
  items.push(item('cloud-a', 'cloud', 150, 62, 44, '#dfe8f5', 0));
  items.push(item('cloud-b', 'cloud', 372, 40, 30, '#cfdcf0', 1));

  for (let i = 0; i < 22; i += 1) {
    items.push(item(`star-${i}`, 'star', dice.range(16, 594), dice.range(14, 150), dice.range(1.4, 3.2), '#ffffff', dice.int(0, 3)));
  }

  items.push(item('house', 'house', 118, 300, 118, '#4a3b63'));
  items.push(item('window-left', 'window', 84, 292, 15, PALETTE.gold, 1));
  items.push(item('window-right', 'window', 152, 292, 15, PALETTE.gold, 1));
  items.push(item('window-top', 'window', 118, 238, 13, '#31456e', 0));
  items.push(item('door-lantern', 'wallLantern', 118, 336, 10, '#ef6461'));

  items.push(item('pine-a', 'pine', 268, 268, 118, PALETTE.pine));
  items.push(item('pine-b', 'pine', 566, 282, 92, PALETTE.pine));
  items.push(item('round-tree', 'roundTree', 424, 262, 96, PALETTE.leaf));
  for (let i = 0; i < 6; i += 1) {
    const angle = (i / 6) * Math.PI * 2 + dice.range(-0.3, 0.3);
    items.push(item(
      `fruit-${i}`, 'fruit',
      424 + Math.cos(angle) * dice.range(22, 40),
      236 + Math.sin(angle) * dice.range(16, 30),
      6, dice.pick(FRUIT_COLORS),
    ));
  }
  items.push(item('owl', 'owl', 424, 176, 17, '#b18ce8'));

  // A string of paper lanterns sagging across the top of the garden.
  for (let i = 0; i < 6; i += 1) {
    const t = i / 5;
    const x = 236 + t * 330;
    const y = 118 + Math.sin(t * Math.PI) * 26;
    items.push(item(`lantern-${i}`, 'lantern', x, y, 13, LANTERN_COLORS[i % LANTERN_COLORS.length]));
  }

  items.push(item('fence-cat', 'cat', 66, 392, 22, '#20242e'));
  for (let i = 0; i < 7; i += 1) {
    items.push(item(`fence-${i}`, 'fencePost', 18 + i * 34, 408, 12, PALETTE.wood));
  }

  items.push(item('stone-lantern', 'stoneLantern', 316, 386, 30, PALETTE.stone));
  items.push(item('bush-a', 'bush', 226, 420, 34, PALETTE.leafDark));
  items.push(item('bush-b', 'bush', 520, 428, 28, PALETTE.leafDark));

  items.push(item('pond', 'pond', 452, 478, 118, PALETTE.water));
  items.push(item('koi', 'koi', 420, 482, 13, '#f4845f', 0));
  items.push(item('ripple-a', 'ripple', 486, 462, 16, PALETTE.waterLight));
  items.push(item('ripple-b', 'ripple', 408, 502, 11, PALETTE.waterLight));

  for (let i = 0; i < 5; i += 1) {
    items.push(item(`stone-${i}`, 'steppingStone', 176 + i * 30, 486 + (i % 2) * 16, 13, PALETTE.stone));
  }
  items.push(item('mushroom-a', 'mushroom', 282, 470, 13, PALETTE.coral));
  items.push(item('mushroom-b', 'mushroom', 306, 482, 9, PALETTE.coral));

  for (let i = 0; i < 14; i += 1) {
    const x = 24 + i * 43 + dice.range(-8, 8);
    items.push(item(`flower-${i}`, 'flower', x, dice.range(492, 522), dice.range(9, 14), dice.pick(FLOWER_COLORS), dice.int(0, 2)));
  }
  for (let i = 0; i < 10; i += 1) {
    items.push(item(`grass-${i}`, 'grass', dice.range(20, 590), dice.range(440, 520), dice.range(10, 18), PALETTE.leaf, dice.int(0, 2)));
  }
  const fireflies = level.seedSalt > 200 ? 9 : 5;
  for (let i = 0; i < fireflies; i += 1) {
    items.push(item(`firefly-${i}`, 'firefly', dice.range(40, 580), dice.range(180, 430), dice.range(2.4, 4), '#ffe97a', dice.int(0, 3)));
  }
  return items;
}

const MUTATIONS = [
  {
    kind: 'recolor',
    label: 'a colour changed',
    apply(dice, target, subtlety) {
      const pool = [...FLOWER_COLORS, ...LANTERN_COLORS, PALETTE.leaf, PALETTE.blossom]
        .filter((c) => c !== target.color);
      return { patch: { color: dice.pick(pool) }, dx: 0, dy: 0 };
    },
  },
  {
    kind: 'remove',
    label: 'something vanished',
    apply() {
      return { patch: { removed: true }, dx: 0, dy: 0 };
    },
  },
  {
    kind: 'resize',
    label: 'something grew or shrank',
    apply(dice, target, subtlety) {
      const factor = dice.chance(0.5) ? 1 + 0.45 * subtlety + 0.2 : Math.max(0.5, 1 - 0.4 * subtlety);
      return { patch: { size: Math.max(4, target.size * factor) }, dx: 0, dy: 0 };
    },
  },
  {
    kind: 'move',
    label: 'something wandered off',
    apply(dice, target, subtlety) {
      const dx = dice.range(16, 30) * (dice.chance(0.5) ? -1 : 1) * (0.6 + subtlety * 0.4);
      const dy = dice.range(-8, 10);
      return { patch: {}, dx, dy };
    },
  },
  {
    kind: 'variant',
    label: 'a small detail flipped',
    apply(dice, target) {
      return { patch: { variant: (target.variant + 1) % 3 }, dx: 0, dy: 0 };
    },
  },
];

/** Kinds too structural to mutate: the moon can only change, never vanish. */
const MUTABLE_KINDS = new Set([
  'window', 'wallLantern', 'lantern', 'flower', 'fruit', 'firefly', 'star',
  'mushroom', 'ripple', 'koi', 'owl', 'cat', 'cloud', 'steppingStone', 'bush',
]);

/**
 * Build one level: the garden, the right panel's patched items, and the
 * difference list. Deterministic for a given level index and attempt.
 */
export function buildLevel(levelIndex, attempt = 0) {
  const level = LEVELS[levelIndex];
  const dice = createDice(level.seedSalt * 7919 + attempt * 131 + 17);
  const base = buildGarden(dice, level);
  const byId = new Map(base.map((entry) => [entry.id, entry]));

  const candidates = dice.shuffle(base.filter((entry) => MUTABLE_KINDS.has(entry.kind)));
  const chosen = candidates.slice(0, level.differences);

  const patches = new Map();
  const differences = chosen.map((target, index) => {
    const mutation = MUTATIONS[index % MUTATIONS.length];
    const { patch, dx, dy } = mutation.apply(dice, target, level.subtlety);
    patches.set(target.id, { ...patch, dx, dy });
    return {
      id: `diff-${index}`,
      itemId: target.id,
      kind: mutation.kind,
      label: mutation.label,
      x: target.x,
      y: target.y,
      rightX: target.x + dx,
      rightY: target.y + dy,
      radius: Math.max(16, Math.min(30, target.size + 8)),
    };
  });

  // One extra traveller appears only in the right panel on later levels:
  // an "added" difference with no left-hand original to anchor to.
  if (levelIndex > 0) {
    const extra = item('extra-snail', 'snail', dice.range(120, 480), dice.range(500, 524), 11, '#b18ce8');
    base.push({ ...extra, rightOnly: true });
    byId.set(extra.id, extra);
    const last = differences[differences.length - 1];
    differences[differences.length - 1] = {
      ...last,
      itemId: extra.id,
      kind: 'added',
      label: 'a visitor arrived',
      x: extra.x,
      y: extra.y,
      rightX: extra.x,
      rightY: extra.y,
      radius: 20,
    };
    patches.set(extra.id, {});
  }

  const right = base.map((entry) => {
    const patch = patches.get(entry.id);
    if (!patch) return entry;
    const { dx, dy, ...rest } = patch;
    return { ...entry, ...rest, x: entry.x + (dx ?? 0), y: entry.y + (dy ?? 0) };
  });

  return { level, base, right, differences };
}

/** The item list one panel paints: left is the base, right is the patchwork. */
export function itemsForSide(built, side) {
  if (side === 'right') return built.right;
  return built.base.filter((entry) => !entry.rightOnly);
}
