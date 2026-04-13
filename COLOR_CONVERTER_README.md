# Color Converter - Complete Documentation

A professional, real-time color converter web application that supports RGB, CMYK, HSL, and HSV color formats with visual color picker, alpha channel support, and synchronized inputs.

## Features

### Core Functionality

1. **Multi-Format Conversion**
   - RGB (Red, Green, Blue)
   - CMYK (Cyan, Magenta, Yellow, Key/Black)
   - HSL (Hue, Saturation, Lightness)
   - HSV (Hue, Saturation, Value)
   - Hexadecimal color codes

2. **Real-Time Synchronization**
   - All input fields update instantly when any value changes
   - All format sliders sync in real-time
   - Visual color preview updates simultaneously

3. **Visual Color Picker**
   - Interactive canvas-based color picker
   - Main gradient: Horizontal saturation, Vertical value
   - Hue slider for color selection
   - Alpha slider for transparency control
   - Real-time position indicators

4. **Alpha Channel Support**
   - Discrete toggle button to enable/disable alpha in RGB format
   - When enabled, RGB becomes ARGB
   - Alpha percentage slider (0-100%)
   - Preserved across color changes

5. **Copy Functionality**
   - Easy copy buttons for each format
   - Copy hexadecimal color code
   - Visual feedback with "Copied" confirmation
   - Auto-dismiss after 2 seconds

6. **Format Selector**
   - Quick switch between display formats
   - Dynamic UI updates to show relevant information
   - Format-specific information displayed in picker

### User Interface

- **Color Preview Card**: Current color with hex code and copy button
- **Color Picker**: Visual selection with canvas-based gradient
- **Format Selector**: Quick buttons to switch between RGB, HSL, HSV, CMYK
- **Input Groups**: Organized color format inputs with:
  - Labeled inputs with number fields
  - Range sliders for visual adjustment
  - Format display showing CSS-like syntax
  - Copy buttons for each format

## Architecture

### Project Structure

```
/lib
  ├── color-conversion.ts          # Core color conversion utilities
  └── __tests__/
      └── color-conversion.test.ts # Conversion function tests

/hooks
  ├── useColorState.ts             # Custom hook for state management
  └── __tests__/
      └── useColorState.test.ts    # Hook behavior tests

/components
  ├── ColorPreview.tsx             # Color display with hex copy
  ├── ColorPicker.tsx              # Visual canvas-based picker
  └── ColorInputGroup.tsx          # Reusable input group component

/app
  └── page.tsx                      # Main application page

/tests
  └── vitest.config.ts             # Test configuration
```

### Key Components

#### `useColorState` Hook
Custom React hook managing all color state and conversion logic.

```typescript
const {
  state,                // Current color in all formats
  updateFromRGB,       // Update from RGB values
  updateFromHSL,       // Update from HSL values
  updateFromHSV,       // Update from HSV values
  updateFromCMYK,      // Update from CMYK values
  updateFromHex,       // Update from hex code
  updateAlpha,         // Update alpha channel
  toggleAlpha,         // Enable/disable alpha
  setColorFromHSV,     // Used by color picker
} = useColorState('#FF0000');
```

#### Color Conversion Functions
Bidirectional conversion between all formats with proper normalization:

- `rgbToHSL()` / `hslToRGB()`
- `rgbToHSV()` / `hsvToRGB()`
- `rgbToCMYK()` / `cmykToRGB()`
- `rgbToHex()` / `hexToRGB()`
- Format functions: `formatRGB()`, `formatCMYK()`, `formatHSL()`, `formatHSV()`

#### Components

1. **ColorPreview**: Displays current color and hex code
   - Large color swatch
   - Hex input field
   - Copy button with feedback

2. **ColorPicker**: Interactive visual selector
   - Canvas-based gradient picker
   - Hue, Saturation, Value sliders
   - Optional alpha slider
   - Real-time position indicators

3. **ColorInputGroup**: Reusable input container
   - Labeled number inputs
   - Range sliders
   - Format display
   - Copy button
   - Optional alpha channel input

### Color Conversion Accuracy

All conversions use standard color space algorithms:

- **RGB ↔ HSL**: Using HSL color space definition
- **RGB ↔ HSV**: Using HSV color space definition
- **RGB ↔ CMYK**: Using CMYK print color conversion
- **RGB ↔ Hex**: Direct RGB to hexadecimal conversion

Round-trip conversions (RGB → Format → RGB) maintain accuracy within rounding error limits.

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Coverage

#### Color Conversion Tests (`color-conversion.test.ts`)
- Primary color conversions (red, green, blue)
- Grayscale handling (black, white, gray)
- Edge cases and boundary values
- Round-trip conversions
- Format string generation
- **Coverage**: 30+ test cases

#### Hook Tests (`useColorState.test.ts`)
- Hook initialization with defaults and custom colors
- RGB, HSL, HSV, CMYK updates
- Hex color parsing and generation
- Alpha channel toggling and updates
- Color picker integration
- Format synchronization
- **Coverage**: 20+ test cases

## Usage

### Basic Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open http://localhost:3000

### Converting Colors

1. **Using Color Picker**:
   - Move horizontally for saturation changes
   - Move vertically for value changes
   - Adjust hue slider for color selection
   - Adjust alpha slider for transparency (if enabled)

2. **Using Direct Input**:
   - Enter values in any format field
   - All other formats update automatically
   - Sliders reflect the changes

3. **Using Hex Input**:
   - Click the hex field and paste a color code
   - All formats update to match

4. **Copying Colors**:
   - Click copy button on any format
   - Paste in CSS, design tools, or code
   - Format automatically includes RGBA if alpha is enabled

## Color Format Reference

### RGB (Red, Green, Blue)
- Range: 0-255 each
- Format: `rgb(255, 0, 0)` or `rgba(255, 0, 0, 0.5)`

### CMYK (Cyan, Magenta, Yellow, Black)
- Range: 0-100% each
- Format: `cmyk(0%, 100%, 100%, 0%)`
- Print color model

### HSL (Hue, Saturation, Lightness)
- Hue: 0-360°
- Saturation: 0-100%
- Lightness: 0-100%
- Format: `hsl(0, 100%, 50%)`

### HSV (Hue, Saturation, Value)
- Hue: 0-360°
- Saturation: 0-100%
- Value: 0-100%
- Format: `hsv(0, 100%, 100%)`

### Hexadecimal
- Format: `#RRGGBB` or `#RRGGBBAA` (with alpha)
- Example: `#FF0000` (red)

## Technical Stack

- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS
- **Testing**: Vitest + React Testing Library
- **UI Icons**: Lucide React
- **Type Safety**: TypeScript

## Performance Optimizations

1. **Memoized Calculations**: useCallback for conversion functions
2. **Efficient Rendering**: Component-level state isolation
3. **Canvas Optimization**: Efficient canvas drawing for color picker
4. **No External State Library**: Direct React hooks for simplicity

## Browser Compatibility

- Modern browsers supporting:
  - Canvas API
  - CSS Gradients
  - ES6+ JavaScript
  - HTML5 Input types

## Code Quality

- Clean architecture with separation of concerns
- Comprehensive unit tests (50+ test cases)
- Type-safe TypeScript implementation
- Well-documented code with JSDoc comments
- Error handling and edge case coverage

## API Documentation

### Color Conversion Utility Functions

All functions are pure and handle normalization automatically.

```typescript
// RGB conversions
rgbToHSL(rgb: RGBColor): HSLColor
hslToRGB(hsl: HSLColor): RGBColor
rgbToHSV(rgb: RGBColor): HSVColor
hsvToRGB(hsv: HSVColor): RGBColor
rgbToCMYK(rgb: RGBColor): CMYKColor
cmykToRGB(cmyk: CMYKColor): RGBColor

// Hex conversions
rgbToHex(rgb: RGBColor): string
hexToRGB(hex: string): RGBColor

// Format functions
formatRGB(rgb: RGBColor, includeAlpha?: boolean): string
formatCMYK(cmyk: CMYKColor): string
formatHSL(hsl: HSLColor): string
formatHSV(hsv: HSVColor): string
```

### useColorState Hook API

```typescript
interface ColorState {
  rgb: RGBColor;
  cmyk: CMYKColor;
  hsl: HSLColor;
  hsv: HSVColor;
  hex: string;
  includeAlpha: boolean;
}

// Returns
{
  state: ColorState;
  updateFromRGB: (rgb: RGBColor) => void;
  updateFromHSL: (hsl: HSLColor) => void;
  updateFromHSV: (hsv: HSVColor) => void;
  updateFromCMYK: (cmyk: CMYKColor) => void;
  updateFromHex: (hex: string) => void;
  updateAlpha: (alpha: number) => void;
  toggleAlpha: () => void;
  setColorFromHSV: (h: number, s: number, v: number) => void;
}
```

## Future Enhancements

- Color palette history
- Named color database (e.g., CSS colors)
- Color accessibility checker (WCAG contrast)
- Palette generation (complementary, triadic, etc.)
- Export to various formats (CSS, JSON, etc.)
- Dark mode support
- Keyboard shortcuts
- Color blind simulation

## License

MIT

## Contributing

Contributions are welcome! Please ensure:
- All tests pass
- Code follows the existing style
- New features include tests
- Documentation is updated
