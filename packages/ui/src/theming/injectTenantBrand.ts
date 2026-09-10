export type ThemePresetKey =
  | 'metronic_dark'
  | 'metronic_light'
  | 'midnight_navy'
  | 'emerald_fintech'
  | 'royal_purple'
  | 'warm_amber'
  | string;

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  secondary: string;
  bgCanvas: string;
  bgCard: string;
  bgHeader: string;
  borderColor: string;
  textMain: string;
  textMuted: string;
}

export const THEME_PRESETS: Record<string, {
  name: string;
  mode: 'dark' | 'light';
  colors: ThemeColors;
}> = {
  metronic_dark: {
    name: 'Metronic Executive Dark (Classic)',
    mode: 'dark',
    colors: {
      primary: '#3E97FF',
      primaryHover: '#2884EF',
      secondary: '#50CD89',
      bgCanvas: '#151521',
      bgCard: '#1e1e2d',
      bgHeader: '#1e1e2d',
      borderColor: '#2b2b40',
      textMain: '#ffffff',
      textMuted: '#92929f'
    }
  },
  metronic_light: {
    name: 'Metronic Corporate Light (Clean White)',
    mode: 'light',
    colors: {
      primary: '#3E97FF',
      primaryHover: '#2884EF',
      secondary: '#50CD89',
      bgCanvas: '#f4f6fa',
      bgCard: '#ffffff',
      bgHeader: '#ffffff',
      borderColor: '#e4e6ef',
      textMain: '#181C32',
      textMuted: '#5E6278'
    }
  },
  midnight_navy: {
    name: 'Midnight Sapphire Navy (Pro)',
    mode: 'dark',
    colors: {
      primary: '#009EF7',
      primaryHover: '#0086D6',
      secondary: '#7239EA',
      bgCanvas: '#0c101d',
      bgCard: '#141a2e',
      bgHeader: '#141a2e',
      borderColor: '#212c4d',
      textMain: '#f8fafc',
      textMuted: '#8b9bb4'
    }
  },
  emerald_fintech: {
    name: 'Fintech Emerald Green',
    mode: 'dark',
    colors: {
      primary: '#50CD89',
      primaryHover: '#47BE7D',
      secondary: '#3E97FF',
      bgCanvas: '#0e1717',
      bgCard: '#152424',
      bgHeader: '#152424',
      borderColor: '#213a3a',
      textMain: '#ffffff',
      textMuted: '#88a3a3'
    }
  },
  royal_purple: {
    name: 'Royal SaaS Violet',
    mode: 'dark',
    colors: {
      primary: '#7239EA',
      primaryHover: '#6229D7',
      secondary: '#F1416C',
      bgCanvas: '#130f24',
      bgCard: '#1d1736',
      bgHeader: '#1d1736',
      borderColor: '#302659',
      textMain: '#ffffff',
      textMuted: '#9e91c7'
    }
  },
  warm_amber: {
    name: 'Wholesale Trade Amber & Gold',
    mode: 'dark',
    colors: {
      primary: '#F59E0B',
      primaryHover: '#D97706',
      secondary: '#10B981',
      bgCanvas: '#14120e',
      bgCard: '#211d17',
      bgHeader: '#211d17',
      borderColor: '#383227',
      textMain: '#fefefe',
      textMuted: '#9e9584'
    }
  }
};

export function hexToShadcnHsl(hex: string): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function applyCompleteMetronicTheme(options: {
  themeMode?: 'dark' | 'light';
  themePreset?: string;
  primaryHex?: string;
  secondaryHex?: string;
  fontFamily?: string;
  borderRadius?: string;
}): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const body = document.body;

  const presetKey = options.themePreset || (options.themeMode === 'light' ? 'metronic_light' : 'metronic_dark');
  const preset = THEME_PRESETS[presetKey] || THEME_PRESETS.metronic_dark;
  const isDark = (options.themeMode || preset.mode) === 'dark';

  // 1. Toggle dark class on html root
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // 2. Resolve colors
  const primary = options.primaryHex || preset.colors.primary;
  const secondary = options.secondaryHex || preset.colors.secondary;
  const radius = options.borderRadius || '14px';
  const fontFamily = options.fontFamily || "'Inter', system-ui, -apple-system, sans-serif";

  // Light/Dark colors
  const bgCanvas = isDark ? (presetKey === 'metronic_light' ? '#151521' : preset.colors.bgCanvas) : (presetKey === 'metronic_dark' ? '#f4f6fa' : preset.colors.bgCanvas);
  const bgCard = isDark ? (presetKey === 'metronic_light' ? '#1e1e2d' : preset.colors.bgCard) : (presetKey === 'metronic_dark' ? '#ffffff' : preset.colors.bgCard);
  const bgHeader = isDark ? (presetKey === 'metronic_light' ? '#1e1e2d' : preset.colors.bgHeader) : (presetKey === 'metronic_dark' ? '#ffffff' : preset.colors.bgHeader);
  const borderColor = isDark ? '#2b2b40' : '#e4e6ef';
  const textMain = isDark ? '#ffffff' : '#181C32';
  const textMuted = isDark ? '#92929f' : '#5E6278';

  // 3. Inject CSS root variables
  root.style.setProperty('--primary', hexToShadcnHsl(primary));
  root.style.setProperty('--ring', hexToShadcnHsl(primary));
  root.style.setProperty('--brand-primary-hex', primary);
  root.style.setProperty('--brand-secondary-hex', secondary);
  root.style.setProperty('--bg-canvas', bgCanvas);
  root.style.setProperty('--bg-card', bgCard);
  root.style.setProperty('--bg-header', bgHeader);
  root.style.setProperty('--border-color', borderColor);
  root.style.setProperty('--text-main', textMain);
  root.style.setProperty('--text-muted', textMuted);
  root.style.setProperty('--radius', radius);
  root.style.setProperty('--font-family', fontFamily);

  // Body background and font
  body.style.backgroundColor = bgCanvas;
  body.style.color = textMain;
  body.style.fontFamily = fontFamily;
}

export function applyBrandThemeVariables(primaryHex: string, secondaryHex?: string): void {
  applyCompleteMetronicTheme({ primaryHex, secondaryHex });
}