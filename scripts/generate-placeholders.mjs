// Genererar abstrakta platshållarbilder (glansig lack) tills riktiga bilder finns.
// Kör: npm run placeholders
// Bilderna är INTE riktiga kundbilar och märks som platshållare på sajten.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const OUT = 'src/assets/placeholders';
await mkdir(OUT, { recursive: true });
await mkdir('public', { recursive: true });

// Enkel seedad slump så att bilderna blir likadana vid varje körning.
function rng(seed) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Glansig "lackyta": mörk bas, böjd kaross-form, spekulära reflexer. */
function paintSvg({ w, h, hue = 214, tilt = 0, dull = false, seed = 1 }) {
  const r = rng(seed);
  const base1 = dull ? `hsl(${hue} 6% 22%)` : `hsl(${hue} 70% 6%)`;
  const base2 = dull ? `hsl(${hue} 5% 34%)` : `hsl(${hue} 75% 15%)`;
  const shine = dull ? 0.12 : 0.9;
  const accent = dull ? 0.05 : 0.55;

  let dust = '';
  if (dull) {
    // Damm, prickar och virvelmärken för "före"-bilden.
    for (let i = 0; i < 900; i++) {
      const x = r() * w, y = r() * h, rad = r() * 2.4 + 0.4;
      dust += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(1)}" fill="hsl(40 10% ${50 + r() * 30}%)" opacity="${(0.15 + r() * 0.35).toFixed(2)}"/>`;
    }
    for (let i = 0; i < 140; i++) {
      const cx = r() * w, cy = r() * h, rad = 20 + r() * 120;
      dust += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}" fill="none" stroke="#fff" stroke-width="0.7" opacity="${(0.05 + r() * 0.08).toFixed(2)}"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="bg" cx="70%" cy="20%" r="90%">
      <stop offset="0" stop-color="${base2}"/>
      <stop offset="1" stop-color="#050608"/>
    </radialGradient>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${base1}"/>
      <stop offset="0.55" stop-color="${base2}"/>
      <stop offset="1" stop-color="#030405"/>
    </linearGradient>
    <linearGradient id="spec" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="${shine}"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="blue" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2E8BFF" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#5AA6FF" stop-opacity="${accent}"/>
      <stop offset="1" stop-color="#2E8BFF" stop-opacity="0"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="${w / 140}"/></filter>
    <filter id="blur2"><feGaussianBlur stdDeviation="${w / 60}"/></filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g transform="rotate(${tilt} ${w / 2} ${h / 2})">
    <path d="M${-w * 0.1} ${h * 0.62} C ${w * 0.25} ${h * 0.38}, ${w * 0.6} ${h * 0.3}, ${w * 1.1} ${h * 0.42} L ${w * 1.1} ${h * 1.2} L ${-w * 0.1} ${h * 1.2} Z" fill="url(#body)"/>
    <path d="M${-w * 0.05} ${h * 0.6} C ${w * 0.25} ${h * 0.4}, ${w * 0.6} ${h * 0.32}, ${w * 1.05} ${h * 0.44}" stroke="url(#spec)" stroke-width="${h * 0.035}" fill="none" filter="url(#blur)"/>
    <path d="M${w * 0.05} ${h * 0.78} C ${w * 0.3} ${h * 0.62}, ${w * 0.62} ${h * 0.56}, ${w * 1.05} ${h * 0.64}" stroke="url(#blue)" stroke-width="${h * 0.08}" fill="none" filter="url(#blur2)"/>
    <path d="M${w * 0.2} ${h * 0.9} C ${w * 0.4} ${h * 0.8}, ${w * 0.7} ${h * 0.76}, ${w * 0.95} ${h * 0.8}" stroke="url(#spec)" stroke-width="${h * 0.012}" fill="none" filter="url(#blur)" opacity="0.7"/>
  </g>
  ${dust}
  ${dull ? `<rect width="100%" height="100%" fill="#8a8170" opacity="0.18"/>` : ''}
</svg>`;
}

async function render(name, opts, format = 'jpg', dir = OUT) {
  const svg = Buffer.from(paintSvg(opts));
  const img = sharp(svg);
  const file = `${dir}/${name}.${format}`;
  await (format === 'jpg' ? img.jpeg({ quality: 88, mozjpeg: true }) : img.png()).toFile(file);
  console.log('✓', file);
}

await render('hero', { w: 2400, h: 1400, hue: 214, tilt: -4, seed: 3 });
await render('fore', { w: 1600, h: 1000, hue: 214, tilt: -3, dull: true, seed: 7 });
await render('efter', { w: 1600, h: 1000, hue: 214, tilt: -3, seed: 7 });

const hues = [214, 0, 200, 220, 30, 260];
for (let i = 0; i < 6; i++) {
  await render(`ig-${i + 1}`, { w: 900, h: 900, hue: hues[i], tilt: -12 + i * 6, seed: 11 + i });
}

// Open Graph-bild (1200x630) – ligger i public/ för en fast, absolut URL.
await sharp(Buffer.from(paintSvg({ w: 1200, h: 630, hue: 214, tilt: -4, seed: 3 })))
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile('public/og-image.jpg');
console.log('✓ public/og-image.jpg');
