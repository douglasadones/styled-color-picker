# Color Converter - Usage Examples

## Example 1: Converting Red Color

**Goal**: Convert pure red across all formats

**Steps**:
1. Application starts with red (#FF0000) by default
2. Observe outputs:
   - **RGB**: r: 255, g: 0, b: 0
   - **HSL**: h: 0°, s: 100%, l: 50%
   - **HSV**: h: 0°, s: 100%, v: 100%
   - **CMYK**: c: 0%, m: 100%, y: 100%, k: 0%

**Expected Behavior**:
- All sliders align to show red
- Color preview shows red swatch
- All four sections display correct values

---

## Example 2: Creating a Semi-Transparent Blue

**Goal**: Create blue with 50% transparency

**Steps**:
1. Click "Enable Alpha Channel" button in RGB section
2. Click hue slider at position 240°
3. Adjust alpha slider to 50%

**Results**:
- **RGB**: r: 0, g: 0, b: 255, a: 0.50
- **Hex**: #0000FF80 (8 characters with alpha)
- Color preview shows semi-transparent blue
- Alpha percentage shows 50%

**Copy**:
- Clicking copy in RGB gives: `rgba(0, 0, 255, 0.50)`

---

## Example 3: Converting CMYK Print Color to Web RGB

**Goal**: Convert print color (C: 60, M: 30, Y: 0, K: 10) to RGB

**Steps**:
1. Locate CMYK section
2. Input: c: 60, m: 30, y: 0, k: 10
3. Observe RGB values update automatically

**Results**:
- **RGB**: r: 81, g: 145, b: 230 (approximately)
- **Hex**: #5191E6
- **HSL**: h: 217°, s: 72%, l: 61%
- Color preview updates to teal-blue

---

## Example 4: Fine-Tuning Saturation with HSL

**Goal**: Create a desaturated pastel color

**Steps**:
1. Use color picker: Select h: 60° (yellow area)
2. Drag from top-right towards center to decrease saturation
3. Adjust lightness slider upward to brighten

**Results**:
- **HSL**: h: 60°, s: 40%, l: 75%
- **RGB**: r: 230, g: 224, b: 156 (pastel yellow)
- **Hex**: #E6E09C

---

## Example 5: Batch Color Conversion

**Goal**: Convert multiple hex colors for design system

**Color 1 - Primary**:
1. Clear hex and paste: `#3B82F6`
2. Observe all formats
3. Copy HSL: `hsl(217, 98%, 61%)`

**Color 2 - Success**:
1. Paste: `#10B981`
2. Export CMYK for printing: `cmyk(82%, 0%, 59%, 16%)`

**Color 3 - Warning**:
1. Paste: `#F59E0B`
2. Export RGB: `rgb(245, 158, 11)`

---

## Example 6: Understanding HSV vs HSL

**Same Hue, Different Color Models**:

**Using HSV**:
1. Set h: 200°, s: 100%, v: 100%
2. Observe: Bright, saturated blue (0, 0, 255)

**Switch to HSL with same hue (h: 200°)**:
1. Set s: 100%, l: 50%
2. Observe: Also bright blue, but calculation differs
3. Set l: 30% → Darker blue with same saturation

**Key Difference**: 
- HSV: Value controls brightness (100% = brightest)
- HSL: Lightness controls brightness (50% = pure color, 100% = white)

---

## Example 7: Real-Time Synchronization Demo

**Goal**: Verify all formats stay synchronized

**Scenario**:
1. Click on color picker at arbitrary position (e.g., hue: 140°, saturation: 75%, value: 85%)
2. Input fields should update immediately:
   - RGB displays new values
   - HSL updates
   - HSV updates
   - CMYK updates
3. All sliders move to new positions
4. Color preview updates
5. Hex code updates

**Verification**:
- Adjust any RGB value (e.g., r: 100)
- All other formats should recalculate
- Color picker adjusts to show correct hue
- Sliders realign

---

## Example 8: Accessibility - Checking Contrast

**Goal**: Select colors for text and background

**Dark Text**:
1. Hex: #1F2937 (dark gray)
2. Hex: #F3F4F6 (light gray background)
3. RGB format shows dark: r: 31, g: 41, b: 55

**Light Text**:
1. Hex: #FFFFFF (white)
2. Same background for high contrast
3. RGB: r: 255, g: 255, b: 255

**Tool Use**:
- Use color preview to visually check contrast
- Export RGB/HSL values for CSS
- Test against WCAG guidelines externally

---

## Example 9: Gradient Color Stops

**Goal**: Generate colors for a gradient (Cool to Warm)

**Color Stop 1 - Cool**:
1. Hex: #0EA5E9 (sky blue)
2. Copy HSL: `hsl(198, 97%, 48%)`

**Color Stop 2 - Transition**:
1. Hex: #EAB308 (yellow)
2. Copy HSL: `hsl(47, 98%, 50%)`

**Color Stop 3 - Warm**:
1. Hex: #DC2626 (red)
2. Copy HSL: `hsl(0, 90%, 56%)`

**CSS Result**:
```css
background: linear-gradient(
  to right,
  hsl(198, 97%, 48%),
  hsl(47, 98%, 50%),
  hsl(0, 90%, 56%)
);
```

---

## Example 10: CMYK for Print Materials

**Goal**: Prepare colors for print production

**Logo Primary Color**:
1. Design color: #006FBF (blue)
2. Switch to CMYK section
3. Read values: c: 100%, m: 45%, y: 0%, k: 25%
4. Copy CMYK: `cmyk(100%, 45%, 0%, 25%)`
5. Send to printer with hex: `#006FBF` as reference

**Note**: CMYK values differ from RGB display due to color space differences. Always verify printed output matches expectations.

---

## Keyboard and Mouse Tips

### Color Picker Controls
- **Click anywhere**: Sets saturation and value
- **Horizontal drag**: Adjusts saturation
- **Vertical drag**: Adjusts value
- **Hue slider**: Click or drag to change hue
- **Alpha slider**: Click or drag (if enabled)

### Input Controls
- **Click input field**: Type specific value
- **Drag slider**: Smooth adjustment
- **Up/Down arrows**: Increment/decrement by 1

### Copy Operations
- Click blue "Copy" button for any format
- Button changes to green "Copied" for 2 seconds
- Color code automatically in clipboard

---

## Common Use Cases

### 1. Web Design
- Start with hex (#...)
- Convert to RGB for CSS
- Use HSL/HSV for understanding color properties
- Export as `rgb()` or hex for HTML

### 2. Print Design
- Use CMYK values for production
- Keep hex reference for digital preview
- Verify colors won't shift unexpectedly

### 3. Color Accessibility
- Note HSL lightness for contrast ratios
- Adjust lightness for WCAG AA/AAA compliance
- Test combinations with foreground/background

### 4. Design Systems
- Create color scales by adjusting lightness
- Generate variants using saturation
- Export multiple formats for different use cases
- Keep hex as primary for consistency

---

## Troubleshooting

### Issue: Colors don't match between RGB and CMYK
**Reason**: Different color spaces for screen (RGB) vs. print (CMYK)
**Solution**: This is expected. CMYK is subtractive, RGB is additive.

### Issue: Alpha channel not appearing
**Reason**: Alpha toggle not enabled
**Solution**: Click "Enable Alpha Channel" button in RGB section

### Issue: Values seem rounded
**Reason**: All values are rounded to nearest integer for display
**Solution**: This is correct. Color conversions use rounding for accuracy.

### Issue: Copied color format is different than selected
**Reason**: CSS format is auto-generated
**Solution**: This is expected. Check format display under each section.
