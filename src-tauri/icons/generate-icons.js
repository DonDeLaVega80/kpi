#!/usr/bin/env node

/**
 * Icon generation script for KPI Tool
 * Generates PNG files from SVG using sharp (if available) or provides instructions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconDir = __dirname;
const svgFile = path.join(iconDir, 'icon-simple.svg');

console.log('🎯 KPI Tool Icon Generator\n');

// Check if sharp is available
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch (e) {
  console.log('⚠️  Sharp not installed. Installing...\n');
  console.log('Please run: npm install --save-dev sharp');
  console.log('Then run this script again.\n');
  console.log('Alternatively, use online tools:');
  console.log('1. Go to https://cloudconvert.com/svg-to-png');
  console.log('2. Upload icon-simple.svg');
  console.log('3. Generate sizes: 32x32, 128x128, 256x256');
  console.log('4. Save as 32x32.png, 128x128.png, 128x128@2x.png\n');
  process.exit(1);
}

if (!fs.existsSync(svgFile)) {
  console.error(`❌ SVG file not found: ${svgFile}`);
  process.exit(1);
}

async function generateIcons() {
  try {
    console.log('📐 Generating PNG files from icon-simple.svg...\n');

    // Generate 32x32
    await sharp(svgFile)
      .resize(32, 32)
      .png()
      .toFile(path.join(iconDir, '32x32.png'));
    console.log('✅ Generated 32x32.png');

    // Generate 128x128
    await sharp(svgFile)
      .resize(128, 128)
      .png()
      .toFile(path.join(iconDir, '128x128.png'));
    console.log('✅ Generated 128x128.png');

    // Generate 256x256 (128x128@2x)
    await sharp(svgFile)
      .resize(256, 256)
      .png()
      .toFile(path.join(iconDir, '128x128@2x.png'));
    console.log('✅ Generated 128x128@2x.png (256x256)\n');

    // Generate ICNS on macOS
    if (process.platform === 'darwin') {
      console.log('🍎 Creating ICNS file...');
      
      const iconsetDir = path.join(iconDir, 'icon.iconset');
      if (fs.existsSync(iconsetDir)) {
        fs.rmSync(iconsetDir, { recursive: true });
      }
      fs.mkdirSync(iconsetDir);

      // Generate all required sizes
      const sizes = [
        { name: 'icon_16x16.png', size: 16 },
        { name: 'icon_16x16@2x.png', size: 32 },
        { name: 'icon_32x32.png', size: 32 },
        { name: 'icon_32x32@2x.png', size: 64 },
        { name: 'icon_128x128.png', size: 128 },
        { name: 'icon_128x128@2x.png', size: 256 },
        { name: 'icon_256x256.png', size: 256 },
        { name: 'icon_256x256@2x.png', size: 512 },
        { name: 'icon_512x512.png', size: 512 },
        { name: 'icon_512x512@2x.png', size: 1024 },
      ];

      for (const { name, size } of sizes) {
        await sharp(svgFile)
          .resize(size, size)
          .png()
          .toFile(path.join(iconsetDir, name));
      }

      // Create ICNS
      execSync(`iconutil -c icns "${iconsetDir}" -o "${path.join(iconDir, 'icon.icns')}"`);
      
      // Clean up
      fs.rmSync(iconsetDir, { recursive: true });
      console.log('✅ Generated icon.icns\n');
    }

    console.log('✨ Icon generation complete!');
    console.log('\n📝 Note: For Windows ICO file, use:');
    console.log('   https://cloudconvert.com/png-to-ico');
    console.log('   Upload 128x128@2x.png (256x256) to generate icon.ico\n');

  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();

