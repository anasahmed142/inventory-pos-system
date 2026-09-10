// packages/client-app/src/modules/auth/BrandedLoginScreen.tsx
import React, { useState } from 'react';
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Building2,
  UserCheck,
  Sparkles,
  ShoppingCart,
  Package,
  BookOpen,
  Crown,
  AlertTriangle,
  Beaker,
  Sun,
  Moon
} from 'lucide-react';
import { UserRole, UserPermission, CompanyCategory } from '@inventory/shared-types';
import { useTenantBrandingStore, BusinessMode, useMasterDataStore, CompanyRecord } from '@inventory/ui';

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  permissions: UserPermission[];
  tenantId: string;
  tenantName: string;
  tenantUrduName: string;
  mode: BusinessMode;
}

interface BrandedLoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const BrandedLoginScreen: React.FC<BrandedLoginScreenProps> = ({ onLoginSuccess }) => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const setProfile = useTenantBrandingStore((s) => s.setProfile);
  const toggleThemeMode = useTenantBrandingStore((s) => s.toggleThemeMode);

  // Dynamic companies list from central persistent master store
  const storedCompanies = useMasterDataStore((s) => s.companies);

  const [username, setUsername] = useState('main_admin');
  const [pin, setPin] = useState('1234');
  const [selectedTenantId, setSelectedTenantId] = useState(profile?.tenantId || storedCompanies[0]?.id || 'tenant-madina-01');
  const [error, setError] = useState<string | null>(null);

  const activeTenant: CompanyRecord | undefined = storedCompanies.find((t) => t.id === selectedTenantId) || storedCompanies[0];
  const isDarkMode = profile?.themeMode === 'dark';
  const primaryColor = profile?.primaryHex || '#3E97FF';

  const quickPersonas: Array<{
    id: string;
    username: string;
    pin: string;
    fullName: string;
    role: UserRole;
    permissions: UserPermission[];
    badge: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'p1',
      username: 'main_admin',
      pin: '1234',
      fullName: 'Master SaaS Admin / Owner',
      role: 'main_admin',
      permissions: ['orders_create', 'products_manage', 'khata_manage', 'customers_manage', 'reports_view', 'settings_edit'],
      badge: '👑 Main Admin (SaaS)',
      icon: <Crown size={14} className="text-purple-500" />
    },
    {
      id: 'p2',
      username: 'company_admin',
      pin: '1234',
      fullName: 'Store Owner & General Manager',
      role: 'company_admin',
      permissions: ['orders_create', 'products_manage', 'khata_manage', 'customers_manage', 'reports_view', 'settings_edit'],
      badge: '🏢 Company Admin',
      icon: <Building2 size={14} className="text-blue-500" />
    },
    {
      id: 'p3',
      username: 'cashier_usman',
      pin: '1111',
      fullName: 'Muhammad Usman (Cashier)',
      role: 'sub_user',
      permissions: ['orders_create'],
      badge: '🛒 POS Cashier',
      icon: <ShoppingCart size={14} className="text-emerald-500" />
    },
    {
      id: 'p4',
      username: 'clerk_bilal',
      pin: '2222',
      fullName: 'Bilal Ahmad (Inventory Clerk)',
      role: 'sub_user',
      permissions: ['products_manage', 'customers_manage'],
      badge: '📦 Inventory Clerk',
      icon: <Package size={14} className="text-indigo-500" />
    },
    {
      id: 'p5',
      username: 'accountant_tariq',
      pin: '3333',
      fullName: 'Hafiz Tariq (Bahi-Khata)',
      role: 'sub_user',
      permissions: ['khata_manage', 'reports_view'],
      badge: '📖 Khata Accountant',
      icon: <BookOpen size={14} className="text-amber-500" />
    }
  ];

  const handleSelectQuickPersona = (persona: typeof quickPersonas[0]) => {
    setUsername(persona.username);
    setPin(persona.pin);
    setError(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTenant) {
      setError('No registered companies found in database.');
      return;
    }

    // Main Admin bypasses company lock
    if (username === 'main_admin' || (username === 'admin' && (pin === '1234' || pin === 'Admin@123'))) {
      onLoginSuccess({
        id: `session-admin-${Date.now()}`,
        username: 'main_admin',
        fullName: 'Master SaaS Admin & Platform Owner',
        role: 'main_admin',
        permissions: ['orders_create', 'products_manage', 'khata_manage', 'customers_manage', 'reports_view', 'settings_edit'],
        tenantId: 'platform_hq',
        tenantName: 'SaaS Platform Headquarters',
        tenantUrduName: 'مرکزی سافٹ ویئر ہیڈکوارٹرز',
        mode: 'supermarket'
      });
      return;
    }

    // Verify company login is active
    if (!activeTenant.isLoginEnabled) {
      setError(`Login Blocked: "${activeTenant.name}" has been disabled by Main Admin. (اس کمپنی کا لاگ ان بند ہے)`);
      return;
    }

    // Check company admin or sub-user
    let role: UserRole = 'sub_user';
    let fullName = `${activeTenant.name} User`;
    let permissions: UserPermission[] = ['orders_create'];

    if (username === 'company_admin' || (username === 'store_owner' && pin === '1234')) {
      role = 'company_admin';
      fullName = `${activeTenant.name} General Manager`;
      permissions = ['orders_create', 'products_manage', 'khata_manage', 'customers_manage', 'reports_view', 'settings_edit'];
    } else {
      // Check in company's registered staff list
      const staffMember = activeTenant.users.find(
        (u) => u.username.toLowerCase() === username.toLowerCase() && u.pin === pin
      );

      if (staffMember) {
        if (!staffMember.isActive) {
          setError(`User account @${username} is suspended. (اکاؤنٹ معطل ہے)`);
          return;
        }
        role = 'sub_user';
        fullName = staffMember.fullName;
        permissions = staffMember.permissions;
      } else if (username === 'cashier_usman' || pin === '1111') {
        role = 'sub_user';
        fullName = 'Muhammad Usman (Cashier)';
        permissions = ['orders_create'];
      } else if (username === 'clerk_bilal' || pin === '2222') {
        role = 'sub_user';
        fullName = 'Bilal Ahmad (Inventory Clerk)';
        permissions = ['products_manage', 'customers_manage'];
      } else if (username === 'accountant_tariq' || pin === '3333') {
        role = 'sub_user';
        fullName = 'Hafiz Tariq (Bahi-Khata Officer)';
        permissions = ['khata_manage', 'reports_view'];
      } else if (pin === '1234') {
        role = 'company_admin';
        fullName = 'Company Manager';
        permissions = ['orders_create', 'products_manage', 'khata_manage', 'customers_manage', 'reports_view', 'settings_edit'];
      } else {
        setError('Invalid operator credentials or PIN code (درست پن کوڈ درج کریں: 1234 یا 1111)');
        return;
      }
    }

    // Determine business mode from company category
    let resolvedMode: BusinessMode = 'supermarket';
    if (activeTenant.category === 'shop_kiryana') resolvedMode = 'kiryana';
    else if (activeTenant.category === 'grain_mandi_seeds') resolvedMode = 'mandi';
    else if (activeTenant.category === 'wholesale' || activeTenant.category === 'wholesale_distributor') resolvedMode = 'wholesale';

    // Apply tenant profile
    setProfile({
      ...(profile || {
        themeMode: 'dark',
        themePreset: 'metronic_dark',
        fontFamily: "'Inter', system-ui, sans-serif",
        borderRadius: '14px',
        cardShadow: 'sm',
        sidebarStyle: 'topbar'
      }),
      tenantId: activeTenant.id,
      name: activeTenant.name,
      urduName: activeTenant.urduName,
      logoBase64: null,
      primaryHex: activeTenant.primaryHex,
      secondaryHex: activeTenant.secondaryHex,
      mode: resolvedMode,
      phone: activeTenant.phone,
      address: activeTenant.address,
      ntnStrn: activeTenant.ntn,
      currencySymbol: 'Rs.',
      activeLanguage: 'ur'
    });

    onLoginSuccess({
      id: `session-${Date.now()}`,
      username,
      fullName,
      role,
      permissions,
      tenantId: activeTenant.id,
      tenantName: activeTenant.name,
      tenantUrduName: activeTenant.urduName,
      mode: resolvedMode
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col justify-center items-center p-4 relative font-sans transition-colors duration-200">
      {/* Top Floating Dark/Light Toggle */}
      <div className="absolute top-6 right-6">
        <button
          onClick={toggleThemeMode}
          className="p-2.5 rounded-2xl border border-slate-200 dark:border-[#2b2b40] bg-white dark:bg-[#1e1e2d] text-slate-700 dark:text-slate-300 hover:shadow-md transition-all flex items-center space-x-2 text-xs font-semibold"
        >
          {isDarkMode ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>
      </div>

      <div className="w-full max-w-lg bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl relative z-10 transition-colors duration-200 my-4">
        {/* Brand Header */}
        <div className="text-center mb-5 md:mb-6">
          {profile?.logoBase64 ? (
            <img
              src={profile.logoBase64}
              alt="Company Logo"
              className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-2 md:mb-3 rounded-2xl object-contain border border-slate-200 dark:border-[#2b2b40] p-1 shadow-sm bg-white dark:bg-[#151521]"
            />
          ) : (
            <div
              className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-2 md:mb-3 rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-sm"
              style={{ backgroundColor: primaryColor }}
            >
              IS
            </div>
          )}
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {profile?.name || 'Inventory System Enterprise'}
          </h1>
          <h2 className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 font-urdu mt-0.5">
            {profile?.urduName || 'مرکزی انوینٹری، پوائنٹ آف سیل و کھاتہ لاگ ان'}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise SaaS Platform for Pakistani Retail & Commercial Trade
          </p>
        </div>

        {/* 1-Click Role Persona Testing Panel WITH CLEAN MODERN NOTICE */}
        <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 bg-slate-50 dark:bg-[#151521] rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <Beaker size={13} className="text-blue-500" />
              <span>1-Click Sandbox</span>
            </div>
            <span className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">
              🧪 TEST ONLY
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 mb-2">
            {quickPersonas.slice(0, 3).map((qp) => (
              <button
                key={qp.id}
                type="button"
                onClick={() => handleSelectQuickPersona(qp)}
                className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                  username === qp.username
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-[#2b2b40] bg-white dark:bg-[#1e1e2d] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1 mb-1">
                  {qp.icon}
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{qp.badge}</span>
                </div>
                <div className="text-[9px] text-slate-400 font-mono">PIN: {qp.pin}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {quickPersonas.slice(3).map((qp) => (
              <button
                key={qp.id}
                type="button"
                onClick={() => handleSelectQuickPersona(qp)}
                className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  username === qp.username
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-[#2b2b40] bg-white dark:bg-[#1e1e2d] hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  {qp.icon}
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white">{qp.badge}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono">PIN: {qp.pin}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Company / Branch Selection WITH CLEAN NOTICE */}
          {username !== 'main_admin' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider block">
                  Target Company / Branch (کمپنی و برانچ منتخب کریں)
                </label>
                <span className="text-[9px] text-slate-400 font-mono">[🧪 Sandbox Selector]</span>
              </div>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                >
                  {storedCompanies.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.urduName}) • {t.isLoginEnabled ? 'Active' : 'BLOCKED'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider block mb-1">
                Operator ID / Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider block mb-1">
                PIN / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="password"
                  value={pin}
                  placeholder="••••"
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs font-bold text-rose-600 dark:text-rose-400 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 py-2.5 px-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            style={{ backgroundColor: primaryColor }}
          >
            <span>Login to Workspace / لاگ ان</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#2b2b40] text-center flex items-center justify-center space-x-2 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-blue-500" />
          <span>FBR POS Certified Multi-Tenant Engine • Metronic Clean UI</span>
        </div>
      </div>
    </div>
  );
};