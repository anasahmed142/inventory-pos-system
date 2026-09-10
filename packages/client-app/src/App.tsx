// packages/client-app/src/App.tsx
import React, { useState, useEffect } from 'react';
import {
  useTenantBrandingStore,
  BusinessMode,
  ThemeCustomizerModal,
  ExcelImportExportModal,
  DailyExpenseRoznamchaModal,
  SoftwareUserManualModal
} from '@inventory/ui';
import { BrandedLoginScreen, UserSession } from './modules/auth/BrandedLoginScreen';
import { MainAdminDashboard } from './modules/admin/MainAdminDashboard';
import { CompanyAdminDashboard } from './modules/admin/CompanyAdminDashboard';
import { SupermarketPosView } from './modules/pos/modes/SupermarketPosView';
import { KiryanaPosView } from './modules/pos/modes/KiryanaPosView';
import { MandiAgriPosView } from './modules/pos/modes/MandiAgriPosView';
import { WholesaleDistributionHub } from './modules/wholesale/WholesaleDistributionHub';
import { BahiKhataLedgerView } from './modules/khata/BahiKhataLedgerView';
import { TradeOrdersHub } from './modules/orders/TradeOrdersHub';
import {
  ShoppingCart,
  Store,
  Truck,
  Scale,
  Warehouse,
  Wifi,
  User,
  Clock,
  LogOut,
  Building2,
  Package,
  BookOpen,
  Crown,
  Lock,
  Layers,
  Palette,
  Sun,
  Moon,
  Sparkles,
  FileText,
  FileSpreadsheet,
  DollarSign,
  HelpCircle
} from 'lucide-react';

type NavigationTab = 'main_admin_hub' | 'company_hub' | 'pos_counter' | 'orders_trade' | 'wholesale_godown' | 'khata_ledger';

export const App: React.FC = () => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const switchBusinessMode = useTenantBrandingStore((s) => s.switchBusinessMode);
  const toggleThemeMode = useTenantBrandingStore((s) => s.toggleThemeMode);

  // Starts as null so login screen is ALWAYS shown first on open
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('orders_trade');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isRoznamchaModalOpen, setIsRoznamchaModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // When user logs in, set their default view based on category & role
  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    if (session.role === 'main_admin') {
      setActiveTab('main_admin_hub');
    } else if (session.mode === 'wholesale') {
      setActiveTab('orders_trade');
    } else if (session.mode === 'mandi' || session.mode === 'kiryana' || session.mode === 'supermarket') {
      setActiveTab('pos_counter');
    } else if (session.permissions.includes('orders_create')) {
      setActiveTab(session.mode === 'wholesale' ? 'orders_trade' : 'pos_counter');
    } else if (session.permissions.includes('khata_manage')) {
      setActiveTab('khata_ledger');
    } else if (session.permissions.includes('products_manage')) {
      setActiveTab('company_hub');
    } else {
      setActiveTab('orders_trade');
    }
  };

  if (!currentUser) {
    return <BrandedLoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const isMainAdmin = currentUser.role === 'main_admin';
  const isCompanyAdmin = currentUser.role === 'company_admin';
  const effectiveMode = profile?.mode || currentUser.mode || 'supermarket';
  const isWholesale = effectiveMode === 'wholesale';
  const isMandi = effectiveMode === 'mandi';
  const isKiryana = effectiveMode === 'kiryana';
  const hasOrderPermission = currentUser.permissions.includes('orders_create');
  const hasKhataPermission = currentUser.permissions.includes('khata_manage');
  const hasProductPermission = currentUser.permissions.includes('products_manage');
  const isDarkMode = profile?.themeMode === 'dark';
  const primaryColor = profile?.primaryHex || '#3E97FF';

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col font-sans selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Metronic Clean Responsive Top Navigation Header */}
      <header className="h-14 md:h-16 bg-[var(--bg-header)] border-b border-[var(--border-color)] flex items-center justify-between px-3 md:px-6 sticky top-0 z-40 shadow-sm transition-colors duration-200">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-2.5 md:space-x-3 overflow-hidden">
          {profile?.logoBase64 && !isMainAdmin ? (
            <img
              src={profile.logoBase64}
              alt="Company Logo"
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-contain bg-white dark:bg-[#1e1e2d] p-1 border border-slate-200 dark:border-[#2b2b40] shadow-sm shrink-0"
            />
          ) : (
            <div
              className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-white text-base md:text-lg tracking-wider shadow-sm transition-all shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {isMainAdmin ? '👑' : isWholesale ? '🏢' : isMandi ? '🌾' : 'IS'}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <span className="font-extrabold text-xs md:text-base tracking-tight text-[var(--text-main)] truncate">
                {isMainAdmin ? 'SaaS Admin' : profile?.name || currentUser.tenantName}
              </span>
              <span
                className="hidden sm:inline-block text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border shrink-0"
                style={{
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  borderColor: `${primaryColor}30`
                }}
              >
                {isMainAdmin
                  ? 'Owner'
                  : isWholesale
                  ? 'Wholesale'
                  : isMandi
                  ? 'Galla Mandi'
                  : isCompanyAdmin
                  ? 'Admin'
                  : 'Staff'}
              </span>
            </div>
            <div className="text-[10px] md:text-xs text-[var(--text-muted)] font-urdu tracking-wide truncate">
              {isMainAdmin ? 'مرکزی کنٹرول' : profile?.urduName || currentUser.tenantUrduName}
            </div>
          </div>
        </div>

        {/* Central Dynamic Navigation Bar for Desktop / Tablet */}
        <div className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-100 dark:bg-[#151521] p-1 rounded-2xl border border-slate-200/60 dark:border-[#2b2b40]">
          {/* Main Admin Tab */}
          {isMainAdmin && (
            <button
              onClick={() => setActiveTab('main_admin_hub')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'main_admin_hub'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'main_admin_hub' ? primaryColor : 'transparent'
              }}
            >
              <Crown size={14} />
              <span>Companies & SaaS</span>
            </button>
          )}

          {/* Primary Counter Tab (Supermarket POS, Kiryana Counter, Mandi Kanta) */}
          {!isMainAdmin && !isWholesale && (isCompanyAdmin || hasOrderPermission) && (
            <button
              onClick={() => setActiveTab('pos_counter')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'pos_counter'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'pos_counter' ? primaryColor : 'transparent'
              }}
            >
              {isMandi ? (
                <>
                  <Scale size={14} className="text-amber-400" />
                  <span>Mandi Kanta (کانٹا)</span>
                </>
              ) : isKiryana ? (
                <>
                  <Store size={14} className="text-amber-400" />
                  <span>Kiryana (کریانہ)</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={14} />
                  <span>Retail POS (کاؤنٹر)</span>
                </>
              )}
            </button>
          )}

          {/* Orders & Trade Tab */}
          {!isMainAdmin && (isCompanyAdmin || hasOrderPermission) && (
            <button
              onClick={() => setActiveTab('orders_trade')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'orders_trade'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'orders_trade' ? primaryColor : 'transparent'
              }}
            >
              <FileText size={14} />
              <span>{isWholesale ? 'Trade Orders (آرڈرز)' : isMandi ? 'Seed Orders (سیڈز)' : 'Orders (آرڈرز)'}</span>
            </button>
          )}

          {/* Wholesale Godown & Dispatch Hub */}
          {!isMainAdmin && isWholesale && (isCompanyAdmin || hasOrderPermission) && (
            <button
              onClick={() => setActiveTab('wholesale_godown')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'wholesale_godown'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'wholesale_godown' ? primaryColor : 'transparent'
              }}
            >
              <Warehouse size={14} />
              <span>Godown (گودام)</span>
            </button>
          )}

          {/* Company Admin & Products Tab */}
          {!isMainAdmin && (isCompanyAdmin || hasProductPermission) && (
            <button
              onClick={() => setActiveTab('company_hub')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'company_hub'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'company_hub' ? primaryColor : 'transparent'
              }}
            >
              <Building2 size={14} />
              <span>{isWholesale ? 'Stock (اسٹاک)' : isMandi ? 'Seeds (بیج)' : 'Products (مصنوعات)'}</span>
            </button>
          )}

          {/* Khata Ledger Tab */}
          {!isMainAdmin && (isCompanyAdmin || hasKhataPermission) && (
            <button
              onClick={() => setActiveTab('khata_ledger')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'khata_ledger'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'khata_ledger' ? primaryColor : 'transparent'
              }}
            >
              <BookOpen size={14} />
              <span>بہی کھاتہ (Khata)</span>
            </button>
          )}
        </div>

        {/* System Telemetry & Utility Actions */}
        <div className="flex items-center space-x-1.5 md:space-x-2">
          {/* Excel Bulk Hub Button */}
          {!isMainAdmin && (
            <button
              onClick={() => setIsExcelModalOpen(true)}
              className="p-2 md:px-2.5 md:py-1.5 rounded-xl border border-slate-200 dark:border-[#2b2b40] bg-slate-50 dark:bg-[#151521] text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-xs"
              title="Excel & CSV Bulk Data Hub (ایکسل امپورٹ و ایکسپورٹ)"
            >
              <FileSpreadsheet size={14} className="text-emerald-500" />
              <span className="hidden xl:inline">Excel Hub</span>
            </button>
          )}

          {/* Daily Roznamcha Button */}
          {!isMainAdmin && (
            <button
              onClick={() => setIsRoznamchaModalOpen(true)}
              className="p-2 md:px-2.5 md:py-1.5 rounded-xl border border-slate-200 dark:border-[#2b2b40] bg-slate-50 dark:bg-[#151521] text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-xs"
              title="Daily Expenses & Roznamcha (روزنامچہ و اخراجات)"
            >
              <DollarSign size={14} className="text-amber-500" />
              <span className="hidden xl:inline">Roznamcha</span>
            </button>
          )}

          {/* User Manual & Guide Button */}
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="p-2 md:px-2.5 md:py-1.5 rounded-xl border border-slate-200 dark:border-[#2b2b40] bg-slate-50 dark:bg-[#151521] text-slate-700 dark:text-slate-300 hover:text-blue-500 transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-xs"
            title="Official User Manual & Operational Guide (سافٹ ویئر رہنمائی)"
          >
            <BookOpen size={14} className="text-blue-500" />
            <span className="hidden xl:inline">Manual</span>
          </button>

          {/* Metronic Theme Studio Button */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="p-2 md:px-2.5 md:py-1.5 rounded-xl border border-slate-200 dark:border-[#2b2b40] bg-slate-50 dark:bg-[#151521] text-slate-700 dark:text-slate-300 hover:text-purple-500 transition-colors flex items-center space-x-1.5 text-xs font-semibold shadow-xs"
            title="Open Theme Studio"
          >
            <Palette size={14} className="text-purple-500" />
            <span className="hidden xl:inline">Theme</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleThemeMode}
            className="p-2 rounded-xl border border-slate-200 dark:border-[#2b2b40] bg-slate-50 dark:bg-[#151521] text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors shadow-xs"
            title="Toggle Light / Dark Theme"
          >
            {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-1.5 pl-1 md:pl-2 border-l border-slate-200 dark:border-slate-800">
            <div
              className="w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <User size={14} />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold leading-tight text-[var(--text-main)] truncate max-w-[120px]">{currentUser.fullName}</div>
              <div className="text-[10px] text-blue-500 font-mono">@{currentUser.username}</div>
            </div>
          </div>

          <button
            onClick={() => setCurrentUser(null)}
            title="Lock Terminal / Logout (لاگ آؤٹ)"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Routed Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0 min-h-0">
        {/* Main Admin Portal */}
        {activeTab === 'main_admin_hub' && isMainAdmin && <MainAdminDashboard />}

        {/* Company Admin / Inventory Portal */}
        {activeTab === 'company_hub' && !isMainAdmin && <CompanyAdminDashboard />}

        {/* Counter Views (Supermarket POS, Kiryana Counter, Mandi Kanta & Arhat) */}
        {activeTab === 'pos_counter' && !isMainAdmin && !isWholesale && (
          <>
            {effectiveMode === 'supermarket' && <SupermarketPosView />}
            {effectiveMode === 'kiryana' && <KiryanaPosView />}
            {effectiveMode === 'mandi' && <MandiAgriPosView />}
          </>
        )}

        {/* Universal Trade & Orders Hub (Sales, Procurement, 5-Stage Lifecycle, Challan & Invoice) */}
        {activeTab === 'orders_trade' && !isMainAdmin && <TradeOrdersHub />}

        {/* Wholesale Godown & Dispatch Hub */}
        {activeTab === 'wholesale_godown' && !isMainAdmin && isWholesale && <WholesaleDistributionHub />}

        {/* Bahi-Khata Ledger View */}
        {activeTab === 'khata_ledger' && !isMainAdmin && <BahiKhataLedgerView />}
      </main>

      {/* Mobile Bottom Navigation Bar (Handheld Phone App Experience) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-header)]/95 backdrop-blur-lg border-t border-[var(--border-color)] px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb transition-colors duration-200">
        {/* Main Admin Mobile Tab */}
        {isMainAdmin && (
          <button
            onClick={() => setActiveTab('main_admin_hub')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              activeTab === 'main_admin_hub' ? 'text-blue-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown size={18} />
            <span className="text-[10px] mt-0.5">SaaS Admin</span>
          </button>
        )}

        {/* Primary Counter (POS / Kiryana / Mandi) */}
        {!isMainAdmin && !isWholesale && (isCompanyAdmin || hasOrderPermission) && (
          <button
            onClick={() => setActiveTab('pos_counter')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              activeTab === 'pos_counter' ? 'text-blue-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMandi ? <Scale size={18} className="text-amber-400" /> : isKiryana ? <Store size={18} className="text-amber-400" /> : <ShoppingCart size={18} />}
            <span className="text-[10px] mt-0.5">{isMandi ? 'کانٹا (Kanta)' : isKiryana ? 'کریانہ (Shop)' : 'POS (کاؤنٹر)'}</span>
          </button>
        )}

        {/* Orders & Trade */}
        {!isMainAdmin && (isCompanyAdmin || hasOrderPermission) && (
          <button
            onClick={() => setActiveTab('orders_trade')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              activeTab === 'orders_trade' ? 'text-blue-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText size={18} />
            <span className="text-[10px] mt-0.5">{isWholesale ? 'آرڈرز (Trade)' : 'آرڈرز (Orders)'}</span>
          </button>
        )}

        {/* Wholesale Godown */}
        {!isMainAdmin && isWholesale && (isCompanyAdmin || hasOrderPermission) && (
          <button
            onClick={() => setActiveTab('wholesale_godown')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              activeTab === 'wholesale_godown' ? 'text-blue-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Warehouse size={18} />
            <span className="text-[10px] mt-0.5">گودام (Godown)</span>
          </button>
        )}

        {/* Products & Staff */}
        {!isMainAdmin && (isCompanyAdmin || hasProductPermission) && (
          <button
            onClick={() => setActiveTab('company_hub')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              activeTab === 'company_hub' ? 'text-blue-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 size={18} />
            <span className="text-[10px] mt-0.5">{isWholesale ? 'اسٹاک (Stock)' : isMandi ? 'سیڈز (Seeds)' : 'پراڈکٹس (Items)'}</span>
          </button>
        )}

        {/* Khata Ledger */}
        {!isMainAdmin && (isCompanyAdmin || hasKhataPermission) && (
          <button
            onClick={() => setActiveTab('khata_ledger')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition-all ${
              activeTab === 'khata_ledger' ? 'text-blue-500 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={18} />
            <span className="text-[10px] mt-0.5">کھاتہ (Khata)</span>
          </button>
        )}

        {/* Manual on Mobile */}
        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl text-slate-400 hover:text-blue-500 transition-all"
        >
          <HelpCircle size={18} />
          <span className="text-[10px] mt-0.5">رہنمائی</span>
        </button>
      </nav>

      {/* Modal Dialogs */}
      <ThemeCustomizerModal isOpen={isThemeModalOpen} onClose={() => setIsThemeModalOpen(false)} />
      <ExcelImportExportModal isOpen={isExcelModalOpen} onClose={() => setIsExcelModalOpen(false)} />
      <DailyExpenseRoznamchaModal isOpen={isRoznamchaModalOpen} onClose={() => setIsRoznamchaModalOpen(false)} />
      <SoftwareUserManualModal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} />
    </div>
  );
};