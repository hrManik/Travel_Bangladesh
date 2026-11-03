import { readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

type Position = [number, number];
type Ring = Position[];
type Polygon = Ring[];

interface DistrictFeature {
  properties: { id: string; name: string; nameBn: string; division: string };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: Polygon | Polygon[];
  };
}

const WIDTH = 900;
const HEIGHT = 1050;
const GEO_DATA_PATH = fileURLToPath(
  new URL('../src/data/bangladeshDistrictsGeo.json', import.meta.url)
);

function getPolygons(feature: DistrictFeature): Polygon[] {
  return feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates as Polygon]
    : (feature.geometry.coordinates as Polygon[]);
}

function pngChunk(type: string, data: Buffer): Buffer {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBuffer, data]);
  let crc = 0xffffffff;
  for (const byte of crcInput) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function encodePng(pixels: Uint8Array): Buffer {
  const scanlines = Buffer.alloc((WIDTH * 4 + 1) * HEIGHT);
  for (let y = 0; y < HEIGHT; y++) {
    const rowStart = y * (WIDTH * 4 + 1);
    scanlines[rowStart] = 0;
    scanlines.set(
      pixels.subarray(y * WIDTH * 4, (y + 1) * WIDTH * 4),
      rowStart + 1
    );
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(scanlines)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function rasterize(features: DistrictFeature[]): Uint8Array {
  let minLongitude = Infinity;
  let maxLongitude = -Infinity;
  let minLatitude = Infinity;
  let maxLatitude = -Infinity;
  for (const feature of features) {
    for (const polygon of getPolygons(feature)) {
      for (const ring of polygon) {
        for (const [longitude, latitude] of ring) {
          minLongitude = Math.min(minLongitude, longitude);
          maxLongitude = Math.max(maxLongitude, longitude);
          minLatitude = Math.min(minLatitude, latitude);
          maxLatitude = Math.max(maxLatitude, latitude);
        }
      }
    }
  }

  const longitudeScale = Math.cos(((minLatitude + maxLatitude) * Math.PI) / 360);
  const mapWidth = (maxLongitude - minLongitude) * longitudeScale;
  const mapHeight = maxLatitude - minLatitude;
  const padding = 50;
  const scale = Math.min(
    (WIDTH - padding * 2) / mapWidth,
    (HEIGHT - padding * 2) / mapHeight
  );
  const renderedWidth = mapWidth * scale;
  const renderedHeight = mapHeight * scale;
  const offsetX = (WIDTH - renderedWidth) / 2;
  const offsetY = (HEIGHT - renderedHeight) / 2;
  const project = ([longitude, latitude]: Position): Position => [
    offsetX + (longitude - minLongitude) * longitudeScale * scale,
    offsetY + (maxLatitude - latitude) * scale,
  ];

  const owners = new Uint8Array(WIDTH * HEIGHT);
  features.forEach((feature, featureIndex) => {
    const rowCrossings = new Map<number, number[]>();
    for (const polygon of getPolygons(feature)) {
      for (const ring of polygon) {
        for (let index = 0; index < ring.length; index++) {
          const [x1, y1] = project(ring[index]);
          const [x2, y2] = project(ring[(index + 1) % ring.length]);
          if (y1 === y2) continue;

          const firstRow = Math.max(0, Math.ceil(Math.min(y1, y2) - 0.5));
          const lastRow = Math.min(HEIGHT - 1, Math.ceil(Math.max(y1, y2) - 0.5) - 1);
          for (let y = firstRow; y <= lastRow; y++) {
            const scanY = y + 0.5;
            const x = x1 + ((scanY - y1) / (y2 - y1)) * (x2 - x1);
            const crossings = rowCrossings.get(y) || [];
            crossings.push(x);
            rowCrossings.set(y, crossings);
          }
        }
      }
    }

    for (const [y, crossings] of rowCrossings) {
      crossings.sort((left, right) => left - right);
      for (let index = 0; index + 1 < crossings.length; index += 2) {
        const startX = Math.max(0, Math.ceil(crossings[index] - 0.5));
        const endX = Math.min(WIDTH, Math.ceil(crossings[index + 1] - 0.5));
        owners.fill(featureIndex + 1, y * WIDTH + startX, y * WIDTH + endX);
      }
    }
  });

  return owners;
}

function createDistrictPng(owners: Uint8Array, districtIndex: number): Buffer {
  const pixels = new Uint8Array(WIDTH * HEIGHT * 4);
  const background = [15, 23, 42];
  const unvisited = [248, 250, 252];
  const visited = [34, 197, 94];
  const border = [20, 83, 45];

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const owner = owners[y * WIDTH + x];
      const index = (y * WIDTH + x) * 4;
      if (owner === 0) {
        pixels.set([...background, 255], index);
        continue;
      }

      const onEdge =
        x === 0 ||
        y === 0 ||
        x === WIDTH - 1 ||
        y === HEIGHT - 1 ||
        owners[y * WIDTH + x - 1] !== owner ||
        owners[y * WIDTH + x + 1] !== owner ||
        owners[(y - 1) * WIDTH + x] !== owner ||
        owners[(y + 1) * WIDTH + x] !== owner;
      pixels.set(onEdge ? border : owner === districtIndex + 1 ? visited : unvisited, index);
      pixels[index + 3] = 255;
    }
  }

  return encodePng(pixels);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

export function socialSharePages(base: string): Plugin {
  return {
    name: 'district-social-share-pages',
    apply: 'build',
    generateBundle() {
      const { features } = JSON.parse(readFileSync(GEO_DATA_PATH, 'utf8')) as {
        features: DistrictFeature[];
      };
      const owners = rasterize(features);
      const siteUrl = `https://hrmanik.github.io${base}`;
      const appUrl = new URL(base, 'https://hrmanik.github.io').toString();

      features.forEach((feature, index) => {
        const { id, name, nameBn, division } = feature.properties;
        const pagePath = `share/${id}/`;
        const imagePath = `share/${id}/map.png`;
        const pageUrl = new URL(pagePath, siteUrl).toString();
        const imageUrl = new URL(imagePath, siteUrl).toString();
        const title = `I visited ${name} (${nameBn}) — Green Bangladesh`;
        const description = `A read-only shared map showing ${name}, ${division} Division highlighted in green. This page does not include personal photos, notes, or editable travel records.`;

        this.emitFile({
          type: 'asset',
          fileName: imagePath,
          source: createDistrictPng(owners, index),
        });
        this.emitFile({
          type: 'asset',
          fileName: `${pagePath}index.html`,
          source: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${escapeHtml(pageUrl)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="${WIDTH}">
    <meta property="og:image:height" content="${HEIGHT}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    <style>
      body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f172a;color:#fff;font:16px system-ui,sans-serif}
      main{width:min(900px,92vw);text-align:center;padding:32px 0}
      img{display:block;width:min(560px,100%);height:auto;margin:24px auto;border-radius:20px}
      .badge{display:inline-block;margin:0;padding:6px 12px;border:1px solid #34d399;border-radius:999px;color:#a7f3d0;font-size:13px;font-weight:700}
      .privacy{max-width:680px;margin:20px auto;color:#cbd5e1;font-size:14px;line-height:1.6}
      a{display:inline-block;padding:12px 20px;border-radius:12px;background:#22c55e;color:#052e16;font-weight:700;text-decoration:none}
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p class="badge">Read-only shared map</p>
      <img src="${escapeHtml(imageUrl)}" alt="Bangladesh map with ${escapeHtml(name)} highlighted in green">
      <p>${escapeHtml(description)}</p>
      <p class="privacy">This shared page only displays the district map and caption. It does not show, store, or let visitors edit the traveler's private photos, notes, or map records.</p>
      <a href="${escapeHtml(appUrl)}">Explore Green Bangladesh</a>
      <p>© ${new Date().getFullYear()} Manik. All rights reserved.</p>
    </main>
  </body>
</html>`,
        });
      });
    },
  };
}
