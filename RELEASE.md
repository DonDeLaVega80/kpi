# Release Information

## Build Location

The standalone macOS application has been built and is available at:

**DMG Installer:**

```
src-tauri/target/release/bundle/dmg/KPI Tool_0.1.0_aarch64.dmg
```

- **Size**: 5.3 MB
- **Platform**: macOS (Apple Silicon / ARM64)
- **Build Date**: December 4, 2024
- **Ready for distribution**

**App Bundle:**

```
src-tauri/target/release/bundle/macos/KPI Tool.app
```

- **Size**: 13 MB (uncompressed)
- **Platform**: macOS (Apple Silicon / ARM64)
- **Can be run directly or distributed**

## Distribution Steps

### For GitHub Release:

1. **Create a new release** on GitHub:

   - Tag: `v0.1.0`
   - Title: `KPI Tool v0.1.0 - Initial Release`
   - Description: Copy from [RELEASE_NOTES.md](RELEASE_NOTES.md)

2. **Upload the DMG file**:

   - File: `KPI Tool_0.1.0_aarch64.dmg`
   - Location: `src-tauri/target/release/bundle/dmg/`

3. **Add release notes** from `RELEASE_NOTES.md`

### For Direct Distribution:

1. Share the DMG file directly
2. Users can:
   - Download the DMG
   - Open it
   - Drag "KPI Tool" to Applications
   - Launch from Applications

## Testing Checklist

- [x] App launches successfully
- [x] Database creates in correct location
- [x] All features work in standalone mode
- [x] Icons display correctly
- [x] Export/Import functions work
- [x] File dialogs work correctly

## Version Information

- **Version**: 0.1.0
- **Build Date**: December 2024
- **Platform**: macOS (Apple Silicon / ARM64)
- **Bundle Identifier**: com.kpitool.app

## Next Steps

1. Test the DMG on a clean macOS system
2. Create GitHub release
3. Upload DMG to release
4. Share with users
