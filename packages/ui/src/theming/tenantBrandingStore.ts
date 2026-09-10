// packages/ui/src/theming/tenantBrandingStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { applyCompleteMetronicTheme, THEME_PRESETS } from './injectTenantBrand';

export type BusinessMode = 'supermarket' | 'kiryana' | 'mandi' | 'wholesale';
export type ThemeMode = 'dark' | 'light';

export interface TenantBrandingProfile {
  tenantId: string;
  name: string;
  urduName: string;
  logoBase64: string | null;
  primaryHex: string;
  secondaryHex: string;
  themeMode: ThemeMode;
  themePreset: string;
  fontFamily: string;
  borderRadius: string;
  cardShadow: 'none' | 'sm' | 'md' | 'lg';
  sidebarStyle: 'topbar' | 'sidebar';
  mode: BusinessMode;
  phone: string;
  address: string;
  ntnStrn: string;
  currencySymbol: string;
  activeLanguage: 'en' | 'ur';
}

interface TenantBrandingStoreState {
  profile: TenantBrandingProfile | null;
  isHydrated: boolean;
  setProfile: (profile: TenantBrandingProfile) => void;
  updateBrandColor: (primaryHex: string, secondaryHex?: string) => void;
  toggleThemeMode: () => void;
  setThemePreset: (presetKey: string) => void;
  updateThemeCustomization: (customization: Partial<TenantBrandingProfile>) => void;
  switchBusinessMode: (mode: BusinessMode) => void;
}

const DEFAULT_PROFILE: TenantBrandingProfile = {
  tenantId: 'tenant-root-001',
  name: 'KhataGHR',
  urduName: 'کھاتہ گھر',
  logoBase64: null,
  primaryHex: '#2563eb', // Modern Royal Indigo Blue
  secondaryHex: '#10b981', // Emerald Green
  themeMode: 'dark',
  themePreset: 'metronic_dark',
  fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  borderRadius: '14px',
  cardShadow: 'sm',
  sidebarStyle: 'topbar',
  mode: 'supermarket',
  phone: '0300-1234567',
  address: 'Commercial Enterprise Suite #01, Lahore',
  ntnStrn: '3200-1234567-8',
  currencySymbol: 'Rs.',
  activeLanguage: 'ur'
};

export const useTenantBrandingStore = create<TenantBrandingStoreState>()(
  persist(
    (set, get) => ({
      profile: DEFAULT_PROFILE,
      isHydrated: false,
      setProfile: (profile) => {
        applyCompleteMetronicTheme({
          themeMode: profile.themeMode || 'dark',
          themePreset: profile.themePreset || 'metronic_dark',
          primaryHex: profile.primaryHex,
          secondaryHex: profile.secondaryHex,
          fontFamily: profile.fontFamily,
          borderRadius: profile.borderRadius
        });
        set({ profile });
      },
      updateBrandColor: (primaryHex, secondaryHex) => {
        const current = get().profile || DEFAULT_PROFILE;
        const updated = { ...current, primaryHex, secondaryHex: secondaryHex || current.secondaryHex };
        applyCompleteMetronicTheme({
          themeMode: updated.themeMode,
          themePreset: updated.themePreset,
          primaryHex: updated.primaryHex,
          secondaryHex: updated.secondaryHex,
          fontFamily: updated.fontFamily,
          borderRadius: updated.borderRadius
        });
        set({ profile: updated });
      },
      toggleThemeMode: () => {
        const current = get().profile || DEFAULT_PROFILE;
        const newMode: ThemeMode = current.themeMode === 'dark' ? 'light' : 'dark';
        const newPreset = newMode === 'light' ? 'metronic_light' : 'metronic_dark';
        const updated = { ...current, themeMode: newMode, themePreset: newPreset };
        applyCompleteMetronicTheme({
          themeMode: updated.themeMode,
          themePreset: updated.themePreset,
          primaryHex: updated.primaryHex,
          secondaryHex: updated.secondaryHex,
          fontFamily: updated.fontFamily,
          borderRadius: updated.borderRadius
        });
        set({ profile: updated });
      },
      setThemePreset: (presetKey: string) => {
        const current = get().profile || DEFAULT_PROFILE;
        const preset = THEME_PRESETS[presetKey];
        if (!preset) return;
        const updated: TenantBrandingProfile = {
          ...current,
          themePreset: presetKey,
          themeMode: preset.mode,
          primaryHex: preset.colors.primary,
          secondaryHex: preset.colors.secondary
        };
        applyCompleteMetronicTheme({
          themeMode: updated.themeMode,
          themePreset: updated.themePreset,
          primaryHex: updated.primaryHex,
          secondaryHex: updated.secondaryHex,
          fontFamily: updated.fontFamily,
          borderRadius: updated.borderRadius
        });
        set({ profile: updated });
      },
      updateThemeCustomization: (customization: Partial<TenantBrandingProfile>) => {
        const current = get().profile || DEFAULT_PROFILE;
        const updated = { ...current, ...customization };
        applyCompleteMetronicTheme({
          themeMode: updated.themeMode,
          themePreset: updated.themePreset,
          primaryHex: updated.primaryHex,
          secondaryHex: updated.secondaryHex,
          fontFamily: updated.fontFamily,
          borderRadius: updated.borderRadius
        });
        set({ profile: updated });
      },
      switchBusinessMode: (mode: BusinessMode) => {
        const current = get().profile || DEFAULT_PROFILE;
        set({ profile: { ...current, mode } });
      }
    }),
    {
      name: 'inv_branding_v2',
      storage: createJSONStorage(() => localStorage)
    }
  )
);