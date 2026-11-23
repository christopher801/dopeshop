
/**
 * DOPE SHOP — PWA / Favicon / Apple Touch / Open Graph Generator
 *
 * Source:
 *   ./dopeshop.png
 *
 * Output:
 *   ./public/icons/
 *   ./public/images/og-default.png
 *   ./public/favicon.png
 *
 * Usage:
 *   npm run icons
 *
 * Dependency:
 *   npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// ============================================
// CONFIGURATION
// ============================================

const ROOT = __dirname;
const SOURCE = path.join(ROOT, 'dopeshop.png');

const PUBLIC = path.join(ROOT, 'public');
const ICONS = path.join(PUBLIC, 'icons');
const IMAGES = path.join(PUBLIC, 'images');

const INK = '#101114';

// ============================================
// DIRECTORY SETUP
// ============================================

function createDirectories() {
  [ICONS, IMAGES].forEach((directory) => {
    fs.mkdirSync(directory, { recursive: true });
  });
}

// ============================================
// ICON GENERATOR
// ============================================

async function generateIcon(size, output, options = {}) {
  const {
    padding = 0,
    background = INK,
  } = options;

  const artworkSize = Math.round(size * (1 - padding * 2));

  const artwork = await sharp(SOURCE)
    .resize(artworkSize, artworkSize, {
      fit: 'contain',
      background: { r: 16, g: 17, b: 20, alpha: 1 },
    })
    .png()
    .toBuffer();

  const finalIcon = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([
      {
        input: artwork,
        gravity: 'center',
      },
    ])
    .png()
    .toFile(path.join(ICONS, output));

  console.log(`Generated: icons/${output} (${size}x${size})`);

  return finalIcon;
}

// ============================================
// FAVICON GENERATOR
// ============================================

async function generateFavicon() {
  await sharp(SOURCE)
    .resize(48, 48, {
      fit: 'cover',
      position: 'centre',
    })
    .png()
    .toFile(path.join(PUBLIC, 'favicon.png'));

  console.log('Generated: favicon.png (48x48)');
}

// ============================================
// APPLE TOUCH ICON
// ============================================

async function generateAppleIcon() {
  await sharp(SOURCE)
    .resize(180, 180, {
      fit: 'cover',
      position: 'centre',
    })
    .png()
    .toFile(path.join(ICONS, 'apple-touch-icon.png'));

  console.log('Generated: icons/apple-touch-icon.png (180x180)');
}

// ============================================
// OPEN GRAPH IMAGE
// ============================================

async function generateOpenGraph() {
  const size = 600;

  const artwork = await sharp(SOURCE)
    .resize(size, size, {
      fit: 'contain',
      background: INK,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: INK,
    },
  })
    .composite([
      {
        input: artwork,
        gravity: 'centre',
      },
    ])
    .png()
    .toFile(path.join(IMAGES, 'og-default.png'));

  console.log('Generated: images/og-default.png (1200x630)');
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log('\n================================');
  console.log('      DOPE SHOP ICON BUILDER');
  console.log('================================\n');

  if (!fs.existsSync(SOURCE)) {
    throw new Error(
      'Logo not found: dopeshop.png\n' +
      'Place dopeshop.png in the project root.'
    );
  }

  createDirectories();

  await generateIcon(192, 'icon-192.png');
  await generateIcon(512, 'icon-512.png');

  // Maskable icons: preserve safe space.
  await generateIcon(192, 'maskable-192.png', {
    padding: 0.10,
  });

  await generateIcon(512, 'maskable-512.png', {
    padding: 0.10,
  });

  await generateAppleIcon();
  await generateFavicon();
  await generateOpenGraph();

  console.log('\n================================');
  console.log('  ALL ICONS GENERATED SUCCESSFULLY');
  console.log('================================\n');
}

main().catch((error) => {
  console.error('\nIcon generation failed:', error.message);
  process.exitCode = 1;
});
