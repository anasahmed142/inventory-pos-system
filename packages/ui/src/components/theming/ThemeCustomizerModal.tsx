// packages/ui/src/components/theming/ThemeCustomizerModal.tsx
import React, { useState } from 'react';
import {
  Palette,
  Sun,
  Moon,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  Type,
  Maximize2,
  X,
  Sliders,
  Store,
  ShoppingCart,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useTenantBrandingStore, ThemeMode } from '../../theming/tenantBrandingStore';
import { THEME_PRESETS } from '../../theming/injectTenantBrand';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ isOpen, onClose }) => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const setProfile = useTenantBrandingStore((s) => s.setProfile);
  const toggleThemeMode = useTenantBrandingStore((s) => s.toggleThemeMode);
  const setThemePreset = useTenantBrandingStore((s) => s.setThemePreset);
  const updateThemeCustomization = useTenantBrandingStore((s) => s.updateThemeCustomization);

  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography' | 'shape'>('presets');

  if (!isOpen || !profile) return null;

  const currentMode = profile.themeMode || 'dark';
  const currentPreset = profile.themePreset || 'metronic_dark';
  const currentPrimary = profile.primaryHex || '#3E97FF';
  const currentSecondary = profile.secondaryHex || '#50CD89';
  const currentFont = profile.fontFamily || "'Inter', system-ui, -apple-system, sans-serif";
  const currentRadius = profile.borderRadius || '14px';

  const colorSwatches = [
    { name: 'Royal Blue (Metronic)', hex: '#3E97FF' },
    { name: 'Emerald Green', hex: '#50CD89' },
    { name: 'Royal Violet', hex: '#7239EA' },
    { name: 'Crimson Rose', hex: '#F1416C' },
    { name: 'Amber Gold', hex: '#FFC700' },
    { name: 'Deep Cyan', hex: '#00A3BF' },
    { name: 'Indigo Modern', hex: '#6366F1' },
    { name: 'Slate Executive', hex: '#4B5563' }
  ];

  const fonts = [
    { id: "'Inter', system-ui, sans-serif", name: 'Inter (Clean Global Default)' },
    { id: "'Plus Jakarta Sans', system-ui, sans-serif", name: 'Plus Jakarta Sans (Modern SaaS)' },
    { id: "'Outfit', system-ui, sans-serif", name: 'Outfit (Trendy & Bold)' },
    { id: "'Roboto Mono', monospace", name: 'Roboto Mono (High-Tech Trading)' },
    { id: "'Noto Sans Arabic', 'Noto Nastaliq Urdu', system-ui, sans-serif", name: 'Noto Sans Arabic (Urdu First)' }
  ];

  const radiusOptions = [
    { id: '6px', label: 'Corporate Sharp', desc: '6px minimal corners' },
    { id: '10px', label: 'Compact Modern', desc: '10px standard radius' },
    { id: '14px', label: 'Metronic Sleek', desc: '14px rounded smooth (Default)' },
    { id: '20px', label: 'Smooth Pill', desc: '20px curved luxury' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] text-slate-900 dark:text-white transition-all">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-slate-100 dark:border-[#2b2b40] flex flex-wrap justify-between items-center gap-2 bg-slate-50/50 dark:bg-[#151521]/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <Palette size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Theme & Brand Studio</span>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                  Live
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Customize look & feel, color palette, mode, typography, and corner radius for your store.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            {/* Quick Dark/Light Toggle Button */}
            <button
              onClick={toggleThemeMode}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e2d] text-xs font-semibold flex items-center space-x-1.5 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {currentMode === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-500" />}
              <span className="hidden sm:inline">{currentMode === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Studio Content Grid */}
        <div className="flex flex-col md:grid md:grid-cols-12 flex-1 overflow-y-auto md:overflow-hidden">
          {/* Left Column: Navigation Tabs & Controls */}
          <div className="md:col-span-7 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-[#2b2b40] overflow-y-auto space-y-4 sm:space-y-6">
            {/* Navigation Pills */}
            <div className="flex space-x-2 p-1 bg-slate-100 dark:bg-[#151521] rounded-2xl">
              {[
                { id: 'presets', label: 'Themes', icon: <Sparkles size={13} /> },
                { id: 'colors', label: 'Colors', icon: <Palette size={13} /> },
                { id: 'typography', label: 'Fonts', icon: <Type size={13} /> },
                { id: 'shape', label: 'Corners', icon: <Maximize2 size={13} /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-[#1e1e2d] text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: THEME PRESETS */}
            {activeTab === 'presets' && (
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Curated Metronic Theme Presets:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => setThemePreset(key)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                        currentPreset === key
                          ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-[#2b2b40] hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#1e1e2d]'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className="w-4 h-4 rounded-full shadow-sm"
                          style={{ backgroundColor: preset.colors.primary }}
                        />
                        <span
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: preset.colors.secondary }}
                        />
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {preset.name.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {preset.mode === 'light' ? '☀️ Clean Light' : '🌙 Executive Dark'}
                      </div>
                      {currentPreset === key && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: BRAND COLORS */}
            {activeTab === 'colors' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Primary Brand Accent Color:
                  </label>
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="color"
                      value={currentPrimary}
                      onChange={(e) => updateThemeCustomization({ primaryHex: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={currentPrimary}
                      onChange={(e) => updateThemeCustomization({ primaryHex: e.target.value })}
                      className="bg-slate-100 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white w-32"
                    />
                    <span className="text-xs text-slate-400">Buttons, Active Tabs, Key Metrics</span>
                  </div>

                  {/* Swatches */}
                  <div className="grid grid-cols-4 gap-2">
                    {colorSwatches.map((sw) => (
                      <button
                        key={sw.hex}
                        onClick={() => updateThemeCustomization({ primaryHex: sw.hex })}
                        className={`p-2 rounded-xl border flex items-center space-x-2 text-xs font-semibold transition-all ${
                          currentPrimary.toLowerCase() === sw.hex.toLowerCase()
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 font-bold'
                            : 'border-slate-200 dark:border-[#2b2b40] hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: sw.hex }} />
                        <span className="truncate text-[11px]">{sw.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                    Secondary Accent Color:
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={currentSecondary}
                      onChange={(e) => updateThemeCustomization({ secondaryHex: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border-0 bg-transparent p-0"
                    />
                    <input
                      type="text"
                      value={currentSecondary}
                      onChange={(e) => updateThemeCustomization({ secondaryHex: e.target.value })}
                      className="bg-slate-100 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase text-slate-900 dark:text-white w-32"
                    />
                    <span className="text-xs text-slate-400">Success badges, highlight chips</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: TYPOGRAPHY */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Select Corporate Typography:
                </label>
                <div className="space-y-2">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => updateThemeCustomization({ fontFamily: f.id })}
                      className={`w-full p-3.5 rounded-2xl border text-left flex justify-between items-center transition-all ${
                        currentFont === f.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 font-bold'
                          : 'border-slate-200 dark:border-[#2b2b40] hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{f.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          The quick brown fox jumps over the lazy dog • ۱۲۳۴۵ انوینٹری
                        </div>
                      </div>
                      {currentFont === f.id && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SHAPE & CORNER RADIUS */}
            {activeTab === 'shape' && (
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Select Corner Curvature Style:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {radiusOptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => updateThemeCustomization({ borderRadius: r.id })}
                      className={`p-4 border text-left transition-all ${
                        currentRadius === r.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-[#2b2b40] hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                      style={{ borderRadius: r.id }}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{r.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Real-Time Metronic UI Preview Card */}
          <div className="md:col-span-5 p-6 bg-slate-50 dark:bg-[#151521] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Metronic Preview
                </span>
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full font-bold">
                  Instant CSS Render
                </span>
              </div>

              {/* Sample Widget Card */}
              <div
                className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] p-5 shadow-sm space-y-4 transition-all"
                style={{ borderRadius: currentRadius, fontFamily: currentFont }}
              >
                {/* Metric Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Today's Revenue
                    </span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      Rs. 148,250
                    </div>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{ backgroundColor: currentPrimary }}
                  >
                    <TrendingUp size={18} />
                  </div>
                </div>

                {/* Sample Badges */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-[#2b2b40]">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${currentPrimary}15`,
                      color: currentPrimary,
                      borderColor: `${currentPrimary}30`
                    }}
                  >
                    FBR Certified
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${currentSecondary}15`,
                      color: currentSecondary,
                      borderColor: `${currentSecondary}30`
                    }}
                  >
                    Paid in Full
                  </span>
                </div>

                {/* Sample Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    className="py-2 text-xs font-bold text-white shadow-sm flex items-center justify-center space-x-1"
                    style={{ backgroundColor: currentPrimary, borderRadius: currentRadius }}
                  >
                    <ShoppingCart size={13} />
                    <span>POS Checkout</span>
                  </button>
                  <button
                    className="py-2 text-xs font-bold border border-slate-200 dark:border-[#2b2b40] bg-white dark:bg-[#1e1e2d] text-slate-700 dark:text-slate-200 shadow-sm"
                    style={{ borderRadius: currentRadius }}
                  >
                    Bahi-Khata
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#2b2b40] flex justify-end space-x-2">
              <button
                onClick={() => setThemePreset('metronic_dark')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center space-x-1"
              >
                <RotateCcw size={13} />
                <span>Reset Default</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center space-x-1"
                style={{ backgroundColor: currentPrimary }}
              >
                <Check size={14} />
                <span>Apply & Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
