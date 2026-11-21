// Painting: the garden items in, pixels out. Every kind of item has one
// small painter; a panel is sky, hills, ground, then the items in order.
// Found differences get a soft ring on both panels, hints pulse once, and
// a fresh find bursts a few sparks.

import { PALETTE, SCENE } from './config.js';

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

const PAINTERS = {
  star(ctx, it) {
    ctx.save();
    ctx.globalAlpha = 0.55 + it.variant * 0.15;
    circle(ctx, it.x, it.y, it.size, '#ffffff');
    ctx.restore();
  },
  moon(ctx, it) {
    circle(ctx, it.x, it.y, it.size, it.color);
    circle(ctx, it.x - 10, it.y - 6, 6, '#e8d9ae');
    circle(ctx, it.x + 8, it.y + 10, 4, '#e8d9ae');
    ctx.save();
    ctx.globalAlpha = 0.25;
    circle(ctx, it.x, it.y, it.size + 12, it.color);
    ctx.restore();
  },
  cloud(ctx, it) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ellipse(ctx, it.x, it.y, it.size, it.size * 0.42, it.color);
    ellipse(ctx, it.x - it.size * 0.4, it.y + 4, it.size * 0.55, it.size * 0.3, it.color);
    ellipse(ctx, it.x + it.size * 0.42, it.y + 3, it.size * 0.6, it.size * 0.34, it.color);
    ctx.restore();
  },
  house(ctx, it) {
    const w = it.size;
    const h = it.size * 0.92;
    ctx.fillStyle = it.color;
    ctx.fillRect(it.x - w / 2, it.y - h / 2 + 18, w, h - 18);
    ctx.fillStyle = '#33284d';
    ctx.beginPath();
    ctx.moveTo(it.x - w / 2 - 12, it.y - h / 2 + 22);
    ctx.lineTo(it.x, it.y - h / 2 - 26);
    ctx.lineTo(it.x + w / 2 + 12, it.y - h / 2 + 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(it.x - 11, it.y + h / 2 - 34, 22, 34);
  },
  window(ctx, it) {
    ctx.fillStyle = it.variant === 1 ? it.color : '#31456e';
    ctx.fillRect(it.x - it.size / 2, it.y - it.size / 2, it.size, it.size * 1.2);
    ctx.strokeStyle = '#2c2340';
    ctx.lineWidth = 2;
    ctx.strokeRect(it.x - it.size / 2, it.y - it.size / 2, it.size, it.size * 1.2);
    ctx.beginPath();
    ctx.moveTo(it.x, it.y - it.size / 2);
    ctx.lineTo(it.x, it.y + it.size * 0.7);
    ctx.stroke();
  },
  wallLantern(ctx, it) {
    circle(ctx, it.x, it.y, it.size, it.color);
    circle(ctx, it.x, it.y, it.size * 0.55, PALETTE.cream);
  },
  pine(ctx, it) {
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(it.x - 5, it.y + it.size * 0.28, 10, it.size * 0.3);
    ctx.fillStyle = it.color;
    for (let tier = 0; tier < 3; tier += 1) {
      const ty = it.y - it.size * 0.42 + tier * it.size * 0.26;
      const half = it.size * (0.46 - tier * 0.11);
      ctx.beginPath();
      ctx.moveTo(it.x - half, ty + it.size * 0.3);
      ctx.lineTo(it.x, ty - it.size * 0.18);
      ctx.lineTo(it.x + half, ty + it.size * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  },
  roundTree(ctx, it) {
    ctx.fillStyle = PALETTE.wood;
    ctx.fillRect(it.x - 6, it.y + 6, 12, it.size * 0.52);
    circle(ctx, it.x, it.y - it.size * 0.24, it.size * 0.46, it.color);
    circle(ctx, it.x - it.size * 0.3, it.y - it.size * 0.05, it.size * 0.3, it.color);
    circle(ctx, it.x + it.size * 0.3, it.y - it.size * 0.05, it.size * 0.3, it.color);
  },
  fruit(ctx, it) {
    circle(ctx, it.x, it.y, it.size, it.color);
    circle(ctx, it.x - 2, it.y - 2, it.size * 0.35, '#ffffff88');
  },
  owl(ctx, it) {
    ellipse(ctx, it.x, it.y, it.size * 0.72, it.size, it.color);
    circle(ctx, it.x - it.size * 0.3, it.y - it.size * 0.3, it.size * 0.2, '#ffffff');
    circle(ctx, it.x + it.size * 0.3, it.y - it.size * 0.3, it.size * 0.2, '#ffffff');
    if (it.variant === 1) {
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(it.x - it.size * 0.48, it.y - it.size * 0.3);
      ctx.lineTo(it.x - it.size * 0.12, it.y - it.size * 0.3);
      ctx.moveTo(it.x + it.size * 0.12, it.y - it.size * 0.3);
      ctx.lineTo(it.x + it.size * 0.48, it.y - it.size * 0.3);
      ctx.stroke();
    } else {
      circle(ctx, it.x - it.size * 0.3, it.y - it.size * 0.3, it.size * 0.09, PALETTE.ink);
      circle(ctx, it.x + it.size * 0.3, it.y - it.size * 0.3, it.size * 0.09, PALETTE.ink);
    }
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.moveTo(it.x - 3, it.y - it.size * 0.05);
    ctx.lineTo(it.x + 3, it.y - it.size * 0.05);
    ctx.lineTo(it.x, it.y + it.size * 0.12);
    ctx.closePath();
    ctx.fill();
  },
  lantern(ctx, it) {
    ctx.strokeStyle = '#00000055';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(it.x, it.y - it.size - 16);
    ctx.lineTo(it.x, it.y - it.size * 0.6);
    ctx.stroke();
    ellipse(ctx, it.x, it.y, it.size * 0.82, it.size, it.color);
    circle(ctx, it.x, it.y, it.size * 0.42, '#fff3cf');
    ctx.fillStyle = '#8a5a1d';
    ctx.fillRect(it.x - 4, it.y - it.size - 3, 8, 5);
    ctx.fillRect(it.x - 4, it.y + it.size - 2, 8, 5);
  },
  cat(ctx, it) {
    const s = it.size;
    ellipse(ctx, it.x, it.y + s * 0.3, s * 0.62, s * 0.5, it.color);
    circle(ctx, it.x - s * 0.3, it.y - s * 0.28, s * 0.42, it.color);
    ctx.fillStyle = it.color;
    ctx.beginPath();
    ctx.moveTo(it.x - s * 0.62, it.y - s * 0.5);
    ctx.lineTo(it.x - s * 0.42, it.y - s * 0.82);
    ctx.lineTo(it.x - s * 0.2, it.y - s * 0.52);
    ctx.moveTo(it.x - s * 0.2, it.y - s * 0.52);
    ctx.lineTo(it.x - s * 0.02, it.y - s * 0.82);
    ctx.lineTo(it.x * 1 + s * 0.12, it.y - s * 0.45);
    ctx.fill();
    ctx.strokeStyle = it.color;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const wag = it.variant === 1 ? -1 : 1;
    ctx.moveTo(it.x + s * 0.55, it.y + s * 0.45);
    ctx.quadraticCurveTo(it.x + s * 1.05, it.y + s * 0.3, it.x + s * 1.0, it.y - s * 0.3 * wag);
    ctx.stroke();
    circle(ctx, it.x - s * 0.42, it.y - s * 0.3, 2.2, '#ffe97a');
    circle(ctx, it.x - s * 0.16, it.y - s * 0.3, 2.2, '#ffe97a');
  },
  fencePost(ctx, it) {
    ctx.fillStyle = it.color;
    ctx.fillRect(it.x - 4, it.y - it.size, 8, it.size * 2);
    ctx.fillRect(it.x - 17, it.y - 4, 34, 5);
  },
  stoneLantern(ctx, it) {
    ctx.fillStyle = it.color;
    ctx.fillRect(it.x - 5, it.y - 2, 10, it.size * 0.8);
    ctx.fillRect(it.x - it.size * 0.5, it.y - it.size * 0.28, it.size, 9);
    ctx.fillRect(it.x - it.size * 0.62, it.y - it.size * 0.62, it.size * 1.24, 8);
    ctx.fillStyle = PALETTE.gold;
    ctx.fillRect(it.x - 6, it.y - it.size * 0.52, 12, 10);
  },
  bush(ctx, it) {
    circle(ctx, it.x - it.size * 0.4, it.y + 6, it.size * 0.55, it.color);
    circle(ctx, it.x + it.size * 0.4, it.y + 6, it.size * 0.55, it.color);
    circle(ctx, it.x, it.y - it.size * 0.2, it.size * 0.62, it.color);
  },
  pond(ctx, it) {
    ellipse(ctx, it.x, it.y, it.size, it.size * 0.36, it.color);
    ellipse(ctx, it.x, it.y - 3, it.size * 0.86, it.size * 0.29, '#3a7cc0');
  },
  koi(ctx, it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.variant === 1 ? 2.6 : 0.5);
    ellipse(ctx, 0, 0, it.size, it.size * 0.42, it.color);
    ctx.beginPath();
    ctx.moveTo(-it.size, 0);
    ctx.lineTo(-it.size - 8, -6);
    ctx.lineTo(-it.size - 8, 6);
    ctx.closePath();
    ctx.fillStyle = it.color;
    ctx.fill();
    circle(ctx, it.size * 0.45, -2, 2, PALETTE.ink);
    ctx.restore();
  },
  ripple(ctx, it) {
    ctx.strokeStyle = it.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(it.x, it.y, it.size, it.size * 0.36, 0, 0, Math.PI * 2);
    ctx.stroke();
  },
  steppingStone(ctx, it) {
    ellipse(ctx, it.x, it.y, it.size, it.size * 0.62, it.color);
    ellipse(ctx, it.x - 3, it.y - 2, it.size * 0.5, it.size * 0.3, '#b6bec7');
  },
  mushroom(ctx, it) {
    ctx.fillStyle = '#f4ead2';
    ctx.fillRect(it.x - 3, it.y, 6, it.size * 0.8);
    ctx.fillStyle = it.color;
    ctx.beginPath();
    ctx.arc(it.x, it.y + 2, it.size, Math.PI, 0);
    ctx.fill();
    circle(ctx, it.x - it.size * 0.4, it.y - it.size * 0.4, 2.4, '#ffffff');
    circle(ctx, it.x + it.size * 0.3, it.y - it.size * 0.6, 2, '#ffffff');
  },
  flower(ctx, it) {
    ctx.strokeStyle = PALETTE.leafDark;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(it.x, it.y + 12);
    ctx.lineTo(it.x, it.y);
    ctx.stroke();
    for (let p = 0; p < 5; p += 1) {
      const a = (p / 5) * Math.PI * 2 + it.variant * 0.4;
      circle(ctx, it.x + Math.cos(a) * it.size * 0.55, it.y + Math.sin(a) * it.size * 0.55, it.size * 0.5, it.color);
    }
    circle(ctx, it.x, it.y, it.size * 0.42, PALETTE.cream);
  },
  grass(ctx, it) {
    ctx.strokeStyle = it.color;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    for (let b = -1; b <= 1; b += 1) {
      ctx.beginPath();
      ctx.moveTo(it.x + b * 4, it.y + 8);
      ctx.quadraticCurveTo(it.x + b * 7, it.y - it.size * 0.4, it.x + b * 10, it.y - it.size * (0.7 + it.variant * 0.12));
      ctx.stroke();
    }
  },
  firefly(ctx, it) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    circle(ctx, it.x, it.y, it.size * 2.4, it.color);
    ctx.restore();
    circle(ctx, it.x, it.y, it.size * 0.8, it.color);
  },
  snail(ctx, it) {
    ellipse(ctx, it.x + 4, it.y + 4, it.size * 0.9, it.size * 0.55, '#8a6d4b');
    circle(ctx, it.x - 2, it.y - 2, it.size * 0.72, it.color);
    ctx.strokeStyle = '#6d4fa1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(it.x - 2, it.y - 2, it.size * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#8a6d4b';
    ctx.beginPath();
    ctx.moveTo(it.x + it.size * 0.7, it.y);
    ctx.lineTo(it.x + it.size * 1.05, it.y - it.size * 0.6);
    ctx.stroke();
  },
};

/** Paint one whole panel: backdrop first, then every visible item. */
export function drawPanel(ctx, originX, originY, items, sky) {
  ctx.save();
  ctx.translate(originX, originY);
  ctx.beginPath();
  ctx.rect(0, 0, SCENE.width, SCENE.height);
  ctx.clip();

  const gradient = ctx.createLinearGradient(0, 0, 0, SCENE.height);
  gradient.addColorStop(0, sky[0]);
  gradient.addColorStop(0.62, sky[1]);
  gradient.addColorStop(0.63, '#3c6b4f');
  gradient.addColorStop(1, '#2c5238');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SCENE.width, SCENE.height);

  // Distant hill silhouettes behind everything else.
  ctx.fillStyle = '#24365e';
  ctx.beginPath();
  ctx.moveTo(0, 330);
  ctx.quadraticCurveTo(150, 258, 330, 322);
  ctx.quadraticCurveTo(470, 366, 610, 318);
  ctx.lineTo(610, 360);
  ctx.lineTo(0, 360);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2f6b4f';
  ctx.fillRect(0, 348, SCENE.width, 10);

  // The lantern string's wire, under the lanterns themselves.
  ctx.strokeStyle = '#10182e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(228, 96);
  ctx.quadraticCurveTo(398, 168, 574, 100);
  ctx.stroke();

  for (const entry of items) {
    if (entry.removed) continue;
    const painter = PAINTERS[entry.kind];
    if (painter) painter(ctx, entry);
  }
  ctx.restore();
}

/** A ring marking a found difference, with a soft outer glow. */
export function drawFoundMarker(ctx, originX, originY, x, y, radius, pulse) {
  ctx.save();
  ctx.translate(originX, originY);
  ctx.strokeStyle = PALETTE.markerFound;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, radius + pulse * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y, radius + 4 + pulse * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** A wide, faint ring: the hint shows a neighbourhood, never the spot. */
export function drawHintRing(ctx, originX, originY, x, y, strength) {
  ctx.save();
  ctx.translate(originX, originY);
  ctx.globalAlpha = 0.25 + strength * 0.45;
  ctx.strokeStyle = PALETTE.marker;
  ctx.lineWidth = 5;
  ctx.setLineDash([12, 9]);
  ctx.beginPath();
  ctx.arc(x, y, 74, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** A short red cross where a click found nothing. */
export function drawMissMark(ctx, originX, originY, x, y, strength) {
  ctx.save();
  ctx.translate(originX, originY);
  ctx.globalAlpha = strength;
  ctx.strokeStyle = PALETTE.danger;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const r = 11;
  ctx.beginPath();
  ctx.moveTo(x - r, y - r);
  ctx.lineTo(x + r, y + r);
  ctx.moveTo(x + r, y - r);
  ctx.lineTo(x - r, y + r);
  ctx.stroke();
  ctx.restore();
}

/** Little sparks that burst the moment a difference is found. */
export function drawSparks(ctx, originX, originY, sparks) {
  ctx.save();
  ctx.translate(originX, originY);
  for (const spark of sparks) {
    ctx.globalAlpha = Math.max(0, 1 - spark.age / spark.life);
    circle(ctx, spark.x, spark.y, 3, PALETTE.marker);
  }
  ctx.restore();
}
