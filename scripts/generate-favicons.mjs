import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bg-glow" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#241242" />
      <stop offset="60%" stop-color="#0e0c1a" />
      <stop offset="100%" stop-color="#08070d" />
    </radialGradient>

    <!-- Border Gradient -->
    <linearGradient id="border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <!-- Note & Wave Gradient -->
    <linearGradient id="note-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc" />
      <stop offset="40%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#22d3ee" />
    </linearGradient>

    <!-- Left Note Gradient -->
    <linearGradient id="left-note-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9333ea" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>

    <!-- Right Note Gradient -->
    <linearGradient id="right-note-grad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>

  <!-- Outer Squircle with vibrant gradient border -->
  <rect x="16" y="16" width="480" height="480" rx="124" fill="url(#border-grad)" />
  <!-- Inner Background -->
  <rect x="28" y="28" width="456" height="456" rx="112" fill="url(#bg-glow)" />

  <!-- Ambient light orb in center -->
  <circle cx="256" cy="240" r="150" fill="#9333ea" opacity="0.18" />

  <!-- Dynamic Sound Pulse Waves (Equalizer Beats bars) -->
  <!-- Left Side Audio Bars -->
  <rect x="74" y="210" width="18" height="92" rx="9" fill="#9333ea" opacity="0.8" />
  <rect x="106" y="165" width="18" height="182" rx="9" fill="url(#border-grad)" opacity="0.95" />

  <!-- Right Side Audio Bars -->
  <rect x="388" y="165" width="18" height="182" rx="9" fill="url(#border-grad)" opacity="0.95" />
  <rect x="420" y="210" width="18" height="92" rx="9" fill="#06b6d4" opacity="0.8" />

  <!-- Modern Music Emblem (Central Double Eighth Note with Sharp Clean Lines) -->
  <!-- Top Connecting Beam -->
  <path d="M 174 138 L 336 98 C 348 95 358 103 358 116 L 358 168 C 358 178 349 185 339 187 L 180 226 C 168 229 158 220 158 208 L 158 156 C 158 146 165 140 174 138 Z" fill="url(#note-grad)" />

  <!-- Left Stem -->
  <rect x="164" y="148" width="30" height="186" rx="15" fill="url(#left-note-grad)" />
  <!-- Left Note Head (Tilted disk) -->
  <ellipse cx="146" cy="334" rx="58" ry="44" transform="rotate(-24 146 334)" fill="url(#left-note-grad)" />
  <!-- Left Note Inner Highlight -->
  <ellipse cx="142" cy="331" rx="26" ry="16" transform="rotate(-24 142 331)" fill="#ffffff" opacity="0.3" />

  <!-- Right Stem -->
  <rect x="328" y="112" width="30" height="180" rx="15" fill="url(#right-note-grad)" />
  <!-- Right Note Head (Tilted disk) -->
  <ellipse cx="310" cy="292" rx="58" ry="44" transform="rotate(-24 310 292)" fill="url(#right-note-grad)" />
  <!-- Right Note Inner Highlight -->
  <ellipse cx="306" cy="289" rx="26" ry="16" transform="rotate(-24 306 289)" fill="#ffffff" opacity="0.3" />
</svg>`;

async function generate() {
  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  const appDir = path.join(rootDir, 'src', 'app');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // 1. Save SVG files
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('✅ Generated icon.svg in public/ and src/app/');

  // 2. Generate PNG sizes
  const svgBuffer = Buffer.from(svgContent);

  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const png48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const png180 = await sharp(svgBuffer).resize(180, 180).png().toBuffer();
  const png192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  const png512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), png180);
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), png192);
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), png512);

  console.log('✅ Generated PNG icons (16, 32, 48, 180, 192, 512)');

  // 3. Generate multi-resolution .ico containing 16x16, 32x32, and 48x48 PNGs
  const images = [
    { size: 16, buffer: png16 },
    { size: 32, buffer: png32 },
    { size: 48, buffer: png48 },
  ];

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(images.length, 4); // number of images

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 0); // width
    entry.writeUInt8(img.size === 256 ? 0 : img.size, 1); // height
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // image data size
    entry.writeUInt32LE(offset, 12); // image data offset
    entries.push(entry);
    offset += img.buffer.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...entries,
    ...images.map((img) => img.buffer),
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuffer);
  console.log('✅ Generated favicon.ico in public/ and src/app/');

  // 4. Generate site.webmanifest
  const manifest = {
    name: 'Luba Beats Marketplace',
    short_name: 'Luba Beats',
    description: 'Marketplace de Beats, Instrumentales y Audio en Perú y Latinoamérica',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#9333ea',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };

  fs.writeFileSync(
    path.join(publicDir, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2),
    'utf-8'
  );
  console.log('✅ Generated site.webmanifest');
}

generate().catch(console.error);
