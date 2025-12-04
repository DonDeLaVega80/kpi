# Icon Generation Guide

This directory contains the app icons for KPI Tool. The icons feature a target/bullseye design with chart elements, representing performance tracking.

## Current Icons

The following icon files are required for Tauri:
- `32x32.png` - Small icon
- `128x128.png` - Medium icon
- `128x128@2x.png` - High DPI medium icon (256x256)
- `icon.icns` - macOS icon bundle
- `icon.ico` - Windows icon

## Generating Icons from SVG

The `icon.svg` file is the source icon. To generate the required formats:

### Option 1: Using Online Tools

1. **Convert SVG to PNG**:
   - Use https://cloudconvert.com/svg-to-png
   - Upload `icon.svg`
   - Generate sizes: 32x32, 128x128, 256x256

2. **Create ICNS file** (macOS):
   - Use https://cloudconvert.com/png-to-icns
   - Upload the 256x256 PNG
   - Or use `iconutil` on macOS (see below)

3. **Create ICO file** (Windows):
   - Use https://cloudconvert.com/png-to-ico
   - Upload the 256x256 PNG

### Option 2: Using Command Line (macOS)

```bash
# Install ImageMagick (if not installed)
brew install imagemagick

# Generate PNG files from SVG
convert -background none -resize 32x32 icon.svg 32x32.png
convert -background none -resize 128x128 icon.svg 128x128.png
convert -background none -resize 256x256 icon.svg 128x128@2x.png

# Create ICNS file
mkdir icon.iconset
cp 32x32.png icon.iconset/icon_16x16.png
cp 32x32.png icon.iconset/icon_16x16@2x.png
cp 128x128.png icon.iconset/icon_128x128.png
cp 128x128@2x.png icon.iconset/icon_128x128@2x.png
cp 128x128@2x.png icon.iconset/icon_256x256.png
cp 128x128@2x.png icon.iconset/icon_256x256@2x.png
cp 128x128@2x.png icon.iconset/icon_512x512.png
cp 128x128@2x.png icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o icon.icns
rm -rf icon.iconset
```

### Option 3: Using Node.js Script

You can use `sharp` or `jimp` to convert the SVG programmatically.

## Icon Design

The icon features:
- **Blue target/bullseye**: Represents goals and precision
- **Chart bars**: Represents data tracking and KPIs
- **Clean, modern design**: Professional appearance

## Alternative: Simple Target Icon

If you prefer a simpler design, you can modify the SVG to remove the chart bars and just keep the target design.

