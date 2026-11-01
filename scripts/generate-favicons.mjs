import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Exact replica of the user's Luba Beats navbar brand icon (Single Eighth Note ♪ in gradient squircle)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <!-- Brand Gradient: bottom-left purple-600 to top-right cyan-400 via indigo-600 -->
    <linearGradient id="luba-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#9333ea" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>

    <!-- Subtle neon glow filter for the border -->
    <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="glow" />
      <feMerge>
        <feMergeNode in="glow" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <!-- Ambient background to ensure rich black -->
  <rect width="512" height="512" fill="transparent" />

  <!-- Glowing outer rim -->
  <rect x="22" y="22" width="468" height="468" rx="132" fill="none" stroke="url(#luba-gradient)" stroke-width="12" opacity="0.45" filter="url(#neon-glow)" />

  <!-- Outer Squircle with Gradient Border -->
  <rect x="24" y="24" width="464" height="464" rx="128" fill="url(#luba-gradient)" />

  <!-- Inner Dark Core (Tailwind zinc-950 #09090b) -->
  <rect x="38" y="38" width="436" height="436" rx="114" fill="#09090b" />

  <!-- Exact Lucide Music2 Icon (Single Eighth Note ♪ in text-purple-400 #c084fc) -->
  <g transform="translate(256, 256) scale(14.8) translate(-12.4, -11.6)"
     fill="none"
     stroke="#c084fc"
     stroke-width="2.1"
     stroke-linecap="round"
     stroke-linejoin="round">
    <circle cx="9" cy="18" r="4" />
    <path d="m19 6-5.2-3.9a.5.5 0 0 0-.8.4V18" />
  </g>
</svg>`;

async function generate() {
  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, 'public');
  const appDir = path.join(rootDir, 'src', 'app');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  // 1. Save SVG files (vector)
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
  fs.writeFileSync(path.join(appDir, 'icon.svg'), svgContent, 'utf-8');
  console.log('✅ Generated exact brand icon.svg in public/ and src/app/');

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

  // Also save a copy in the artifact dir for direct user viewing
  const artifactIconPath = 'C:/Users/Cyper Ohzy/.gemini/antigravity/brain/35cd6392-d8df-4b84-a718-64ab7c48c711/luba_beats_app_icon.png';
  fs.writeFileSync(artifactIconPath, png512);

  console.log('✅ Generated PNG icons (16, 32, 48, 180, 192, 512)');

  // 3. Multi-resolution .ico containing 16x16, 32x32, and 48x48 PNGs
  const images = [
    { size: 16, buffer: png16 },
    { size: 32, buffer: png32 },
    { size: 48, buffer: png48 },
  ];

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = ICO
  header.writeUInt16LE(images.length, 4); // count

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size, 0); // width
    entry.writeUInt8(img.size, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
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

  // 4. Web Manifest
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
  console.log('✅ Updated site.webmanifest');
}

generate().catch(console.error);
