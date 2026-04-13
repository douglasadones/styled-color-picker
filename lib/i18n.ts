/**
 * i18n - Internationalisation dictionary
 * Supports PT-BR and EN languages
 */

export type Language = 'pt-BR' | 'en';

export interface Translations {
  appTitle: string;
  appSubtitle: string;
  hexLabel: string;
  hexPlaceholder: string;
  copiedLabel: string;
  copyLabel: string;
  alphaLabel: string;
  enableAlpha: string;
  disableAlpha: string;
  alphaEnabled: string;
  pasteOrEdit: string;
  sliderHue: string;
  sliderSaturation: string;
  sliderLightness: string;
  sliderValue: string;
  sliderCyan: string;
  sliderMagenta: string;
  sliderYellow: string;
  sliderBlack: string;
  sliderRed: string;
  sliderGreen: string;
  sliderBlue: string;
  sliderAlpha: string;
  formatCode: string;
  formatCodePlaceholder: { [key: string]: string };
  invalidFormat: string;
  footerNote: string;
  langToggle: string;
  /** Theme toggle */
  themeToggleDark: string;
  themeToggleLight: string;
  /** 3-D model panel */
  show3DModel: string;
  hide3DModel: string;
  model3DLabel: { [key: string]: string };
  model3DHint: string;
  showAll3D: string;
  hideAll3D: string;
  startRotation: string;
  stopRotation: string;
}

const ptBR: Translations = {
  appTitle: 'Conversor de Cores',
  appSubtitle: 'Converta entre RGB, CMYK, HSL e HSV em tempo real',
  hexLabel: 'HEX',
  hexPlaceholder: '#rrggbb ou #rrggbbaa',
  copiedLabel: 'Copiado',
  copyLabel: 'Copiar',
  alphaLabel: 'Alpha',
  enableAlpha: 'Ativar canal Alpha (ARGB)',
  disableAlpha: 'Desativar Alpha',
  alphaEnabled: 'Alpha ativo',
  pasteOrEdit: 'Cole ou edite o código',
  sliderHue: 'Matiz',
  sliderSaturation: 'Saturação',
  sliderLightness: 'Luminosidade',
  sliderValue: 'Valor',
  sliderCyan: 'Ciano',
  sliderMagenta: 'Magenta',
  sliderYellow: 'Amarelo',
  sliderBlack: 'Preto (K)',
  sliderRed: 'Vermelho',
  sliderGreen: 'Verde',
  sliderBlue: 'Azul',
  sliderAlpha: 'Alfa',
  formatCode: 'Código',
  formatCodePlaceholder: {
    RGB: 'rgb(255, 0, 0) ou rgba(255,0,0,1)',
    HSL: 'hsl(0, 100%, 50%)',
    HSV: 'hsv(0, 100%, 100%)',
    CMYK: 'cmyk(0%, 100%, 100%, 0%)',
  },
  invalidFormat: 'Formato inválido',
  footerNote:
    'Todos os valores atualizam em tempo real. Use o seletor ou edite qualquer campo.',
  langToggle: 'EN',
  themeToggleDark: 'Tema Escuro',
  themeToggleLight: 'Tema Claro',
  show3DModel: 'Ver modelo 3D',
  hide3DModel: 'Ocultar modelo 3D',
  model3DLabel: {
    RGB:  'Cubo RGB — cada vértice é uma combinação de R, G e B',
    HSL:  'Duplo Cone HSL — matiz no ângulo, luminosidade na altura',
    HSV:  'Cone HSV — matiz no ângulo, brilho na altura',
    CMYK: 'Cubo CMY — modelo subtrativo (K fixo)',
  },
  model3DHint: 'Arraste para girar · Scroll para zoom',
  showAll3D: 'Mostrar modelos 3D',
  hideAll3D: 'Ocultar modelos 3D',
  startRotation: 'Iniciar rotação',
  stopRotation: 'Parar rotação',
};

const en: Translations = {
  appTitle: 'Color Converter',
  appSubtitle: 'Convert between RGB, CMYK, HSL and HSV in real-time',
  hexLabel: 'HEX',
  hexPlaceholder: '#rrggbb or #rrggbbaa',
  copiedLabel: 'Copied',
  copyLabel: 'Copy',
  alphaLabel: 'Alpha',
  enableAlpha: 'Enable Alpha channel (ARGB)',
  disableAlpha: 'Disable Alpha',
  alphaEnabled: 'Alpha active',
  pasteOrEdit: 'Paste or edit the code',
  sliderHue: 'Hue',
  sliderSaturation: 'Saturation',
  sliderLightness: 'Lightness',
  sliderValue: 'Value',
  sliderCyan: 'Cyan',
  sliderMagenta: 'Magenta',
  sliderYellow: 'Yellow',
  sliderBlack: 'Black (K)',
  sliderRed: 'Red',
  sliderGreen: 'Green',
  sliderBlue: 'Blue',
  sliderAlpha: 'Alpha',
  formatCode: 'Code',
  formatCodePlaceholder: {
    RGB: 'rgb(255, 0, 0) or rgba(255,0,0,1)',
    HSL: 'hsl(0, 100%, 50%)',
    HSV: 'hsv(0, 100%, 100%)',
    CMYK: 'cmyk(0%, 100%, 100%, 0%)',
  },
  invalidFormat: 'Invalid format',
  footerNote:
    'All values update in real-time. Use the picker or edit any field.',
  langToggle: 'PT-BR',
  themeToggleDark: 'Dark Theme',
  themeToggleLight: 'Light Theme',
  show3DModel: 'Show 3D model',
  hide3DModel: 'Hide 3D model',
  model3DLabel: {
    RGB:  'RGB Cube — each vertex is a combination of R, G and B',
    HSL:  'HSL Double-Cone — hue by angle, lightness by height',
    HSV:  'HSV Cone — hue by angle, brightness by height',
    CMYK: 'CMY Cube — subtractive model (K fixed)',
  },
  model3DHint: 'Drag to rotate · Scroll to zoom',
  showAll3D: 'Show 3D models',
  hideAll3D: 'Hide 3D models',
  startRotation: 'Start rotation',
  stopRotation: 'Stop rotation',
};

export const translations: Record<Language, Translations> = { 'pt-BR': ptBR, en };

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}
