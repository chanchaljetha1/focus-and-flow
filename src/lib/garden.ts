import { GardenState } from "@/lib/db";

// Seeded RNG — mulberry32. Same seed = same garden every load.
function makeRng(seed: number) {
  let s = seed | 0;
  return function (): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

// Garden palette from PRD Section 11.8
const FOLIAGE = ["#B0D9CC", "#6BB8A6", "#DCF0EA"];
const ACCENTS = ["#A8D5DB", "#D6ECEF"];
const SOIL = ["#D2D7CE", "#EAECE8"];

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// One "watercolour wash" plant at a given x,y position
// Returns SVG JSX string for a group of blurred ellipses
function plantBlob(
  cx: number,
  cy: number,
  size: number,
  layers: number,
  colours: string[],
  filterId: string,
  rng: () => number
): string {
  let out = `<g class="garden-sway" style="animation-duration:${Math.round(rngRange(rng, 8, 12))}s;animation-delay:-${Math.round(rngRange(rng, 0, 8))}s">`;
  for (let i = 0; i < layers; i++) {
    const rx = rngRange(rng, size * 0.5, size);
    const ry = rngRange(rng, size * 0.35, size * 0.65);
    const ox = rngRange(rng, -size * 0.3, size * 0.3);
    const oy = rngRange(rng, -size * 0.2, size * 0.2);
    const opacity = rngRange(rng, 0.15, 0.35);
    const colour = pick(colours, rng);
    out += `<ellipse cx="${(cx + ox).toFixed(1)}" cy="${(cy + oy).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${colour}" opacity="${opacity.toFixed(2)}" filter="url(#${filterId})"/>`;
  }
  out += `</g>`;
  return out;
}

// Small sprout: a stem + 1–2 leaf ellipses
function sprout(cx: number, cy: number, height: number, rng: () => number): string {
  const colour = pick(FOLIAGE, rng);
  const stemH = height;
  const leafRx = rngRange(rng, 6, 10);
  const leafRy = rngRange(rng, 4, 7);
  return `
    <g class="garden-sway" style="animation-duration:10s;animation-delay:-${rngRange(rng, 0, 5).toFixed(1)}s;transform-origin:${cx.toFixed(0)}px ${cy.toFixed(0)}px">
      <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${(cy - stemH).toFixed(0)}" stroke="${colour}" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
      <ellipse cx="${(cx - leafRx * 0.6).toFixed(1)}" cy="${(cy - stemH * 0.65).toFixed(1)}" rx="${leafRx}" ry="${leafRy}" fill="${colour}" opacity="0.5" transform="rotate(-30 ${(cx - leafRx * 0.6).toFixed(1)} ${(cy - stemH * 0.65).toFixed(1)})"/>
      <ellipse cx="${(cx + leafRx * 0.6).toFixed(1)}" cy="${(cy - stemH * 0.8).toFixed(1)}" rx="${leafRx * 0.8}" ry="${leafRy * 0.8}" fill="${pick(FOLIAGE, rng)}" opacity="0.45" transform="rotate(25 ${(cx + leafRx * 0.6).toFixed(1)} ${(cy - stemH * 0.8).toFixed(1)})"/>
    </g>`;
}

// Small flower on top of a plant
function flower(cx: number, cy: number, rng: () => number): string {
  const petalColour = rngRange(rng, 0, 1) > 0.5 ? "#F4E4D4" : "#E8D5C4";
  const centreColour = "#D4A86A";
  const r = rngRange(rng, 5, 8);
  return `
    <g>
      ${[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const px = cx + Math.cos(rad) * r * 1.4;
        const py = cy + Math.sin(rad) * r * 1.4;
        return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${(r * 0.7).toFixed(1)}" ry="${(r * 0.5).toFixed(1)}" fill="${petalColour}" opacity="0.7" transform="rotate(${deg} ${px.toFixed(1)} ${py.toFixed(1)})"/>`;
      }).join("")}
      <circle cx="${cx}" cy="${cy}" r="${(r * 0.55).toFixed(1)}" fill="${centreColour}" opacity="0.8"/>
    </g>`;
}

// Background tree
function tree(cx: number, cy: number, scale: number, rng: () => number): string {
  const trunkH = 60 * scale;
  const canopyR = 35 * scale;
  const trunkColour = pick(SOIL, rng);
  const layers = Math.floor(rngRange(rng, 3, 5));
  let out = `<g class="garden-sway" style="animation-duration:12s;animation-delay:-${rngRange(rng, 0, 6).toFixed(1)}s;transform-origin:${cx}px ${cy}px">`;
  out += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${(cy - trunkH).toFixed(0)}" stroke="${trunkColour}" stroke-width="${(3 * scale).toFixed(1)}" stroke-linecap="round" opacity="0.5"/>`;
  for (let i = 0; i < layers; i++) {
    const rx = rngRange(rng, canopyR * 0.7, canopyR);
    const ry = rngRange(rng, canopyR * 0.5, canopyR * 0.8);
    const ox = rngRange(rng, -canopyR * 0.3, canopyR * 0.3);
    const oy = rngRange(rng, -canopyR * 0.2, canopyR * 0.2);
    out += `<ellipse cx="${(cx + ox).toFixed(1)}" cy="${(cy - trunkH + oy).toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="${pick(FOLIAGE, rng)}" opacity="${rngRange(rng, 0.2, 0.4).toFixed(2)}" filter="url(#blur-soft)"/>`;
  }
  out += `</g>`;
  return out;
}

export interface PlantLabel {
  id: string;
  cx: number;
  cy: number;
  sessionRange: string;
}

export interface GardenRenderResult {
  svg: string;
  plantLabels: PlantLabel[];
}

export function renderGarden(state: GardenState): GardenRenderResult {
  const { totalSessions, allThreeTaskDays, weeksWith1PlusSession, firstSessionDate } = state;

  const seed = firstSessionDate ? firstSessionDate.getTime() : 12345678;
  const rng = makeRng(seed);

  const W = 480;
  const H = 320;
  const groundY = H - 48;

  const plantLabels: PlantLabel[] = [];
  let body = "";

  // Filters
  const filters = `
    <defs>
      <filter id="blur-soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="12"/>
      </filter>
      <filter id="blur-medium" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="8"/>
      </filter>
      <filter id="blur-heavy" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="18"/>
      </filter>
      <linearGradient id="sky-wash" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F0F7F8" stop-opacity="0.6"/>
        <stop offset="100%" stop-color="#D6ECEF" stop-opacity="0.2"/>
      </linearGradient>
    </defs>`;

  // Sky wash
  body += `<rect width="${W}" height="${H}" fill="url(#sky-wash)"/>`;

  // Ground strip
  body += `<rect x="0" y="${groundY}" width="${W}" height="${H - groundY}" fill="${SOIL[0]}" opacity="0.35"/>`;
  body += `<rect x="0" y="${groundY}" width="${W}" height="2" fill="${SOIL[1]}" opacity="0.5"/>`;

  // Stone (always present)
  const stoneX = rngRange(rng, W * 0.4, W * 0.6);
  body += `<ellipse cx="${stoneX.toFixed(0)}" cy="${groundY + 8}" rx="12" ry="7" fill="${SOIL[0]}" opacity="0.6"/>`;
  body += `<ellipse cx="${stoneX.toFixed(0)}" cy="${groundY + 7}" rx="10" ry="5" fill="${SOIL[1]}" opacity="0.4"/>`;

  if (totalSessions === 0) {
    return { svg: assembleSvg(W, H, filters, body), plantLabels };
  }

  // Tree (background, left or right)
  if (weeksWith1PlusSession >= 7 || totalSessions >= 30) {
    const treeScale = totalSessions >= 30 ? 1.3 : 0.85;
    const treeX = rngRange(rng, W * 0.1, W * 0.25);
    body += tree(treeX, groundY, treeScale, rng);
  }

  // Main plant cluster — centre-ish, grows with sessions
  const clusterCount = Math.min(
    1 + Math.floor(totalSessions / 5) + (totalSessions >= 30 ? 1 : 0),
    6
  );

  // Fixed cluster x positions seeded from firstSessionDate
  const clusterPositions: number[] = [];
  for (let i = 0; i < 6; i++) {
    clusterPositions.push(rngRange(rng, W * 0.15, W * 0.85));
  }

  for (let i = 0; i < clusterCount; i++) {
    const cx = clusterPositions[i];
    const cy = groundY - rngRange(rng, 10, 25);
    const sessionsForPlant = Math.max(1, Math.floor(totalSessions / clusterCount));
    const size = Math.min(18 + sessionsForPlant * 2, 55);
    const layers = Math.min(3 + Math.floor(sessionsForPlant / 3), 5);
    const colours = rng() > 0.5 ? FOLIAGE : [...FOLIAGE, ...ACCENTS];

    body += plantBlob(cx, cy - size * 0.5, size, layers, colours, "blur-soft", rng);

    plantLabels.push({
      id: `plant-${i}`,
      cx,
      cy: cy - size,
      sessionRange: sessionsForPlant === 1 ? "1 session" : `${sessionsForPlant} sessions`,
    });
  }

  // Sprout on first session
  if (totalSessions >= 1 && totalSessions < 4) {
    const sx = rngRange(rng, W * 0.45, W * 0.55);
    body += sprout(sx, groundY, 28, rng);
  }

  // Flowers for all-3-tasks days
  const flowerCount = Math.min(allThreeTaskDays, 5);
  for (let f = 0; f < flowerCount; f++) {
    const fx = rngRange(rng, W * 0.2, W * 0.8);
    const fy = groundY - rngRange(rng, 30, 60);
    body += flower(fx, fy, rng);
  }

  return { svg: assembleSvg(W, H, filters, body), plantLabels };
}

function assembleSvg(w: number, h: number, filters: string, body: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${filters}${body}</svg>`;
}
