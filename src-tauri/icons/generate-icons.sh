#!/bin/bash

# Icon generation script for KPI Tool
# This script generates PNG and ICNS files from the SVG icon

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🎯 Generating KPI Tool icons..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo "Install it with: brew install imagemagick"
    exit 1
fi

# Use simple icon (without text) as base
SVG_FILE="icon-simple.svg"
if [ ! -f "$SVG_FILE" ]; then
    SVG_FILE="icon.svg"
fi

echo "📐 Generating PNG files from $SVG_FILE..."

# Generate PNG files
convert -background none -resize 32x32 "$SVG_FILE" 32x32.png
convert -background none -resize 128x128 "$SVG_FILE" 128x128.png
convert -background none -resize 256x256 "$SVG_FILE" 128x128@2x.png

echo "✅ PNG files generated:"
echo "   - 32x32.png"
echo "   - 128x128.png"
echo "   - 128x128@2x.png (256x256)"

# Create ICNS file (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Creating ICNS file..."
    
    # Create iconset directory
    ICONSET_DIR="icon.iconset"
    rm -rf "$ICONSET_DIR"
    mkdir "$ICONSET_DIR"
    
    # Copy PNG files to iconset with proper naming
    cp 32x32.png "$ICONSET_DIR/icon_16x16.png"
    cp 32x32.png "$ICONSET_DIR/icon_16x16@2x.png"
    cp 128x128.png "$ICONSET_DIR/icon_32x32.png"
    cp 128x128.png "$ICONSET_DIR/icon_32x32@2x.png"
    cp 128x128.png "$ICONSET_DIR/icon_128x128.png"
    cp 128x128@2x.png "$ICONSET_DIR/icon_128x128@2x.png"
    cp 128x128@2x.png "$ICONSET_DIR/icon_256x256.png"
    cp 128x128@2x.png "$ICONSET_DIR/icon_256x256@2x.png"
    cp 128x128@2x.png "$ICONSET_DIR/icon_512x512.png"
    
    # Generate larger sizes for ICNS
    convert -background none -resize 512x512 "$SVG_FILE" "$ICONSET_DIR/icon_512x512@2x.png"
    convert -background none -resize 1024x1024 "$SVG_FILE" "$ICONSET_DIR/icon_1024x1024.png"
    
    # Create ICNS file
    iconutil -c icns "$ICONSET_DIR" -o icon.icns
    
    # Clean up
    rm -rf "$ICONSET_DIR"
    
    echo "✅ icon.icns created"
else
    echo "⚠️  ICNS generation skipped (macOS only)"
fi

# Note about ICO file
echo ""
echo "📝 Note: For Windows ICO file, use an online converter:"
echo "   https://cloudconvert.com/png-to-ico"
echo "   Upload 128x128@2x.png (256x256) to generate icon.ico"

echo ""
echo "✨ Icon generation complete!"

