// packages/client-app/src/modules/admin/MainAdminDashboard.tsx
import React, { useState } from 'react';
import {
  Building2,
  ShieldAlert,
  CreditCard,
  Users,
  Plus,
  CheckCircle,
  XCircle,
  Edit3,
  DollarSign,
  Calendar,
  Lock,
  Unlock,
  Sparkles,
  Layers,
  Search,
  FileText,
  Sliders,
  Store,
  ShoppingCart,
  Truck,
  Eye,
  Trash2,
  History,
  Receipt,
  FileCheck,
  Hash,
  MapPin,
  Phone,
  Printer,
  ShieldCheck,
  Filter,
  TrendingUp,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { CompanyCategory, UserPermission } from '@inventory/shared-types';
import {
  useMasterDataStore,
  CompanyRecord,
  SubscriptionRecord,
  CompanyStaffUser,
  SubscriptionPaymentRecord,
  useTenantBrandingStore
} from '@inventory/ui';

export const MainAdminDashboard: React.FC = () => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const primaryColor = profile?.primaryHex || '#3E97FF';
  const secondaryColor = profile?.secondaryHex || '#50CD89';

  const [activeTab, setActiveTab] = useState<'companies' | 'subscriptions' | 'all_staff'>('companies');

  // Master Store State & Actions
  const companies = useMasterDataStore((s) => s.companies);
  const subscriptions = useMasterDataStore((s) => s.subscriptions);
  const addCompany = useMasterDataStore((s) => s.addCompany);
  const updateCompany = useMasterDataStore((s) => s.updateCompany);
  const deleteCompany = useMasterDataStore((s) => s.deleteCompany);
  const toggleCompanyLogin = useMasterDataStore((s) => s.toggleCompanyLogin);
  const setCompanyCategory = useMasterDataStore((s) => s.setCompanyCategory);
  const addStaffUser = useMasterDataStore((s) => s.addStaffUser);
  const updateStaffUser = useMasterDataStore((s) => s.updateStaffUser);
  const deleteStaffUser = useMasterDataStore((s) => s.deleteStaffUser);
  const toggleStaffUserStatus = useMasterDataStore((s) => s.toggleStaffUserStatus);

  const addSubscription = useMasterDataStore((s) => s.addSubscription);
  const addSubscriptionPayment = useMasterDataStore((s) => s.addSubscriptionPayment);
  const deleteSubscriptionPayment = useMasterDataStore((s) => s.deleteSubscriptionPayment);
  const updateSubscriptionStatus = useMasterDataStore((s) => s.updateSubscriptionStatus);
  const deleteSubscription = useMasterDataStore((s) => s.deleteSubscription);

  // Modals & Inspection Drawer States
  const [inspectingCompany, setInspectingCompany] = useState<CompanyRecord | null>(null);
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(null);
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNewSubModalOpen, setIsNewSubModalOpen] = useState(false);
  const [selectedSubForPayment, setSelectedSubForPayment] = useState<SubscriptionRecord | null>(null);
  const [viewingHistorySub, setViewingHistorySub] = useState<SubscriptionRecord | null>(null);

  // Edit Staff Modal State (Used by both Drawer & Global Staff Directory)
  const [editingStaffUser, setEditingStaffUser] = useState<{
    companyId: string;
    companyName: string;
    user: CompanyStaffUser;
  } | null>(null);

  // Global Add Staff Modal State
  const [isGlobalAddStaffOpen, setIsGlobalAddStaffOpen] = useState(false);
  const [globalStaffTargetCompany, setGlobalStaffTargetCompany] = useState(companies[0]?.id || '');

  // Search & Filters
  const [companySearch, setCompanySearch] = useState('');
  const [subFilterStatus, setSubFilterStatus] = useState<string>('all');
  const [subSearchTenant, setSubSearchTenant] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  // New Company Form State
  const [newComp, setNewComp] = useState<Partial<CompanyRecord>>({
    name: '',
    urduName: '',
    category: 'supermarket',
    phone: '0300-1234567',
    address: 'Commercial Market',
    city: 'Lahore',
    province: 'Punjab',
    ntn: '3201456-7',
    strn: '32-77-8761-234-55',
    fbrPosId: '892014',
    fbrAuthToken: 'FBR-LIVE-PROD-TK-99824',
    fbrTier1Status: 'active',
    praRegistration: 'PRA-LHR-2024-8891',
    primaryHex: '#3E97FF',
    secondaryHex: '#50CD89',
    isLoginEnabled: true,
    printHeaderText: 'Official Tax Invoice',
    printFooterText: 'Thank you for your business.'
  });

  // New Subscription Form State
  const [newSubForm, setNewSubForm] = useState<{
    tenantId: string;
    planName: 'Starter' | 'Professional' | 'Enterprise' | 'Custom';
    monthlyFee: number;
    billingCycle: 'monthly' | 'quarterly' | 'annual' | 'lifetime';
    adminPrivateNotes: string;
  }>({
    tenantId: companies[0]?.id || '',
    planName: 'Professional',
    monthlyFee: 10000,
    billingCycle: 'monthly',
    adminPrivateNotes: 'SaaS License Agreement'
  });

  // Record Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'Cash' | 'Cheque'>('JazzCash');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Add Staff User Form (inside inspecting company)
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [newStaff, setNewStaff] = useState<{
    username: string;
    fullName: string;
    pin: string;
    roleTitle: string;
    permissions: UserPermission[];
  }>({
    username: '',
    fullName: '',
    pin: '1234',
    roleTitle: 'Cashier',
    permissions: ['orders_create']
  });

  const allPermissionsList: Array<{ id: UserPermission; label: string; urdu: string }> = [
    { id: 'orders_create', label: 'Create POS & Wholesale Orders (بل و آرڈر)', urdu: 'کیشئر و سیلز' },
    { id: 'products_manage', label: 'Manage Products & Barcodes (پروڈکٹ انٹری)', urdu: 'اسٹاک و پروڈکٹس' },
    { id: 'khata_manage', label: 'Manage Bahi-Khata Ledger (کھاتہ دار و ادھار)', urdu: 'بہی کھاتہ' },
    { id: 'customers_manage', label: 'Manage Buyers & Suppliers (گاہک و سپلائر)', urdu: 'پارٹیز' },
    { id: 'reports_view', label: 'View Sales & Financial Reports (رپورٹس)', urdu: 'رپورٹس' }
  ];

  // Financial Revenue Metrics
  const totalRevenueCollected = subscriptions.reduce((acc, s) => acc + (s.totalPaid || 0), 0);
  const totalMonthlyRunRate = subscriptions.filter((s) => s.status === 'active').reduce((acc, s) => acc + (s.monthlyFee || 0), 0);
  const totalPendingDues = subscriptions.reduce((acc, s) => acc + (s.remainingDues || 0), 0);

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComp.name) return;
    const createdId = `tenant-${Date.now().toString(36)}`;
    const comp: CompanyRecord = {
      id: createdId,
      name: newComp.name || 'New Company',
      urduName: newComp.urduName || 'نئی کمپنی',
      category: newComp.category || 'supermarket',
      phone: newComp.phone || '0300-0000000',
      address: newComp.address || 'Pakistan',
      city: newComp.city || 'Lahore',
      province: newComp.province || 'Punjab',
      ntn: newComp.ntn || '0000000-0',
      strn: newComp.strn || '00-00-0000-000-00',
      fbrPosId: newComp.fbrPosId || Math.floor(100000 + Math.random() * 900000).toString(),
      fbrAuthToken: newComp.fbrAuthToken || `FBR-PROD-${Date.now()}`,
      fbrTier1Status: newComp.fbrTier1Status || 'active',
      praRegistration: newComp.praRegistration || 'PRA-2026-0001',
      isLoginEnabled: true,
      primaryHex: newComp.primaryHex || '#3E97FF',
      secondaryHex: newComp.secondaryHex || '#50CD89',
      printHeaderText: newComp.printHeaderText || `${newComp.name} • Official Receipt`,
      printFooterText: newComp.printFooterText || 'Thank you for your business.',
      joinedDate: new Date().toLocaleDateString(),
      users: [
        {
          id: `su-${Date.now()}`,
          tenantId: createdId,
          username: 'company_admin',
          fullName: `${newComp.name} Manager`,
          pin: '1234',
          roleTitle: 'Store Owner',
          permissions: ['orders_create', 'products_manage', 'khata_manage', 'customers_manage', 'reports_view', 'settings_edit'],
          isActive: true,
          lastLogin: 'Never'
        }
      ]
    };

    addCompany(comp, 10000);
    setIsNewCompanyModalOpen(false);
    setNewComp({ name: '', urduName: '', category: 'supermarket', phone: '', address: '', ntn: '', strn: '', fbrPosId: '' });
  };

  const handleUpdateCompanySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    updateCompany(editingCompany.id, editingCompany);
    if (inspectingCompany && inspectingCompany.id === editingCompany.id) {
      setInspectingCompany(editingCompany);
    }
    setEditingCompany(null);
  };

  const handleCreateSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const targetComp = companies.find((c) => c.id === newSubForm.tenantId) || companies[0];
    if (!targetComp) return;

    const sub: SubscriptionRecord = {
      id: `sub-${Date.now().toString(36)}`,
      tenantId: targetComp.id,
      tenantName: targetComp.name,
      planName: newSubForm.planName,
      monthlyFee: Number(newSubForm.monthlyFee) || 5000,
      totalPaid: 0,
      remainingDues: Number(newSubForm.monthlyFee) || 5000,
      status: 'active',
      billingCycle: newSubForm.billingCycle,
      startDate: new Date().toLocaleDateString(),
      nextDueDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString(),
      lastPaymentDate: 'None',
      adminPrivateNotes: newSubForm.adminPrivateNotes || 'Direct license allocation',
      payments: []
    };

    addSubscription(sub);
    setIsNewSubModalOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForPayment || !paymentAmount) return;
    const amount = parseFloat(paymentAmount);

    addSubscriptionPayment(
      selectedSubForPayment.id,
      amount,
      paymentMethod,
      paymentRef,
      paymentNotes
    );

    setIsPaymentModalOpen(false);
    setSelectedSubForPayment(null);
    setPaymentAmount('');
    setPaymentRef('');
    setPaymentNotes('');
  };

  const handleAddStaffToCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = inspectingCompany?.id || globalStaffTargetCompany;
    if (!targetId || !newStaff.username || !newStaff.fullName) return;

    const user: CompanyStaffUser = {
      id: `su-${Date.now().toString(36)}`,
      tenantId: targetId,
      username: newStaff.username,
      fullName: newStaff.fullName,
      pin: newStaff.pin || '1234',
      roleTitle: newStaff.roleTitle || 'Cashier',
      permissions: newStaff.permissions,
      isActive: true,
      lastLogin: 'Never'
    };

    addStaffUser(targetId, user);
    if (inspectingCompany && inspectingCompany.id === targetId) {
      setInspectingCompany({ ...inspectingCompany, users: [...inspectingCompany.users, user] });
    }
    setIsAddingStaff(false);
    setIsGlobalAddStaffOpen(false);
    setNewStaff({ username: '', fullName: '', pin: '1234', roleTitle: 'Cashier', permissions: ['orders_create'] });
  };

  const handleSaveEditedStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffUser) return;
    updateStaffUser(editingStaffUser.companyId, editingStaffUser.user.id, editingStaffUser.user);
    if (inspectingCompany && inspectingCompany.id === editingStaffUser.companyId) {
      setInspectingCompany({
        ...inspectingCompany,
        users: inspectingCompany.users.map((u) => (u.id === editingStaffUser.user.id ? editingStaffUser.user : u))
      });
    }
    setEditingStaffUser(null);
  };

  const getCategoryBadge = (cat: CompanyCategory) => {
    switch (cat) {
      case 'supermarket':
        return (
          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
            <ShoppingCart size={12} />
            <span>Supermarket POS</span>
          </span>
        );
      case 'shop_kiryana':
        return (
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
            <Store size={12} />
            <span>Kiryana & Shop</span>
          </span>
        );
      case 'grain_mandi_seeds':
        return (
          <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
            <Truck size={12} />
            <span>Galla Mandi Agri</span>
          </span>
        );
      case 'wholesale_distributor':
        return (
          <span className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-xs px-2.5 py-1 rounded-xl font-bold flex items-center space-x-1">
            <Layers size={12} />
            <span>Wholesale FMCG</span>
          </span>
        );
    }
  };

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.urduName.includes(companySearch) ||
      c.city.toLowerCase().includes(companySearch.toLowerCase()) ||
      c.ntn.includes(companySearch)
  );

  const filteredSubscriptions = subscriptions.filter((s) => {
    const matchStatus = subFilterStatus === 'all' || s.status === subFilterStatus;
    const matchTenant = s.tenantName.toLowerCase().includes(subSearchTenant.toLowerCase());
    return matchStatus && matchTenant;
  });

  const allGlobalStaffList = companies.flatMap((c) =>
    c.users.map((u) => ({ ...u, companyName: c.name, companyUrdu: c.urduName, companyId: c.id }))
  ).filter((s) =>
    s.fullName.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.username.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.companyName.toLowerCase().includes(staffSearch.toLowerCase())
  );

  return (
    <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto bg-[var(--bg-canvas)] text-[var(--text-main)] font-sans transition-colors duration-200 pb-16 md:pb-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Metronic Modern Top Overview Banner */}
        <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-4 sm:p-6 shadow-sm flex flex-wrap justify-between items-center gap-4 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm font-black text-2xl"
              style={{ backgroundColor: primaryColor }}
            >
              👑
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  SaaS Platform Headquarters
                </h1>
                <span
                  className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                    borderColor: `${primaryColor}30`
                  }}
                >
                  Platform Master
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu mt-0.5">
                تمام رجسٹرڈ کمپنیوں، ایف بی آر و ٹیکس ڈیٹا اور پرائیویٹ فیس وصولی کا مستقل مین ایڈمن پینل
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-[#151521] p-1.5 rounded-xl border border-slate-200/60 dark:border-[#2b2b40]">
            <button
              onClick={() => setActiveTab('companies')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'companies'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'companies' ? primaryColor : 'transparent'
              }}
            >
              <Building2 size={15} />
              <span>Companies ({companies.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'subscriptions'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'subscriptions' ? primaryColor : 'transparent'
              }}
            >
              <CreditCard size={15} />
              <span>Private SaaS Billing</span>
            </button>

            <button
              onClick={() => setActiveTab('all_staff')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all_staff'
                  ? 'text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              style={{
                backgroundColor: activeTab === 'all_staff' ? primaryColor : 'transparent'
              }}
            >
              <Users size={15} />
              <span>Global Staff ({allGlobalStaffList.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: COMPANIES & PAKISTANI FBR COMMERCIAL PROFILES */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Client Companies & Tax Compliance
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage commercial profiles, FBR POSID, NTN, STRN, staff, and toggle company access.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search company, NTN, city..."
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-64 transition-all"
                  />
                </div>

                <button
                  onClick={() => setIsNewCompanyModalOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm hover:shadow transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Plus size={16} />
                  <span>Register Company / نئی کمپنی بنائیں</span>
                </button>
              </div>
            </div>

            {/* Metronic Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCompanies.map((comp) => (
                <div
                  key={comp.id}
                  className={`bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 border transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                    comp.isLoginEnabled
                      ? 'border-slate-200/80 dark:border-[#2b2b40]'
                      : 'border-rose-300 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      {getCategoryBadge(comp.category)}
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                            comp.isLoginEnabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {comp.isLoginEnabled ? 'Login Active' : 'Login Blocked'}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{comp.name}</h3>
                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 font-urdu mt-0.5">{comp.urduName}</div>

                    {/* Pakistani FBR & Tax Badges */}
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono">
                      <div className="bg-slate-50 dark:bg-[#151521] p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">NTN / ٹیکس نمبر:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold">{comp.ntn || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#151521] p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">STRN سیلز ٹیکس:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-bold truncate block">{comp.strn || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#151521] p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase">FBR POS ID:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{comp.fbrPosId || 'Not Configured'}</span>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#151521] p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 block uppercase">Location:</span>
                        <span className="text-slate-800 dark:text-white font-bold">{comp.city}, {comp.province}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-2">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setInspectingCompany(comp)}
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      >
                        <Eye size={14} />
                        <span>Details & Staff ({comp.users.length})</span>
                      </button>

                      <button
                        onClick={() => setEditingCompany(comp)}
                        className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                        title="Edit Company Profile & Settings"
                      >
                        <Edit3 size={13} />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleCompanyLogin(comp.id)}
                        className={`flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          comp.isLoginEnabled
                            ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                        }`}
                      >
                        {comp.isLoginEnabled ? <Lock size={13} /> : <Unlock size={13} />}
                        <span>{comp.isLoginEnabled ? 'Block Login' : 'Enable Login'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to permanently delete company "${comp.name}" and its data?`)) {
                            deleteCompany(comp.id);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 transition-colors border border-slate-200 dark:border-slate-700"
                        title="Delete Company"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: PRIVATE SAAS SUBSCRIPTIONS & BILLING */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            {/* Private SaaS Header Banner */}
            <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-5 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-xs text-blue-700 dark:text-blue-300">
                <Lock size={16} className="text-blue-500" />
                <span className="font-bold uppercase tracking-wider">
                  Private SaaS Ledger — Strictly Isolated & Invisible to Client Stores
                </span>
              </div>
              <button
                onClick={() => setIsNewSubModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-sm hover:shadow transition-all"
                style={{ backgroundColor: primaryColor }}
              >
                <Plus size={14} />
                <span>+ Create Subscription Plan</span>
              </button>
            </div>

            {/* Metronic KPI Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total SaaS Revenue Collected
                  </div>
                  <div className="text-3xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-2">
                    Rs. {totalRevenueCollected.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Lifetime license fee collected</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Active Monthly MRR
                  </div>
                  <div className="text-3xl font-mono font-black text-blue-600 dark:text-blue-400 mt-2">
                    Rs. {totalMonthlyRunRate.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Recurring SaaS run rate</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  <DollarSign size={24} />
                </div>
              </div>

              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Total Outstanding Dues
                  </div>
                  <div className="text-3xl font-mono font-black text-rose-600 dark:text-rose-400 mt-2">
                    Rs. {totalPendingDues.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Pending license payments</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                  <AlertCircle size={24} />
                </div>
              </div>
            </div>

            {/* Subscriptions Ledger Table */}
            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by company name..."
                    value={subSearchTenant}
                    onChange={(e) => setSubSearchTenant(e.target.value)}
                    className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 w-64"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Filter Status:</span>
                  <select
                    value={subFilterStatus}
                    onChange={(e) => setSubFilterStatus(e.target.value)}
                    className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="grace_period">Grace Period</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#151521] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Client Company</th>
                    <th className="px-5 py-3.5">Plan Tier</th>
                    <th className="px-5 py-3.5">Monthly Fee</th>
                    <th className="px-5 py-3.5">Total Paid</th>
                    <th className="px-5 py-3.5">Pending Dues</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{sub.tenantName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {sub.tenantId}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {sub.planName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                        Rs. {sub.monthlyFee.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Rs. {(sub.totalPaid || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                        Rs. {(sub.remainingDues || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={sub.status}
                          onChange={(e) => updateSubscriptionStatus(sub.id, e.target.value as any)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none ${
                            sub.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                              : sub.status === 'grace_period'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="trial">Trial</option>
                          <option value="grace_period">Grace Period</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedSubForPayment(sub);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                          >
                            + Record Payment
                          </button>
                          <button
                            onClick={() => setViewingHistorySub(sub)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            title="Payment History"
                          >
                            <History size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete subscription plan for "${sub.tenantName}"?`)) {
                                deleteSubscription(sub.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete Subscription"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GLOBAL COMPANY STAFF DIRECTORY */}
        {activeTab === 'all_staff' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Global Store Staff & Operator Accounts
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect, edit, create, and manage staff accounts and credentials across all registered client stores.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search staff or company..."
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 w-64"
                  />
                </div>

                <button
                  onClick={() => setIsGlobalAddStaffOpen(true)}
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm hover:shadow transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  <UserPlus size={15} />
                  <span>+ Add Staff to Store</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#151521] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200/80 dark:border-slate-800 font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Employee Name & Username</th>
                    <th className="px-5 py-3.5">Assigned Company</th>
                    <th className="px-5 py-3.5">Role Title</th>
                    <th className="px-5 py-3.5">Terminal PIN</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {allGlobalStaffList.map((u) => (
                    <tr key={`${u.companyId}-${u.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{u.fullName}</div>
                        <div className="text-xs text-blue-500 font-mono">@{u.username}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{u.companyName}</div>
                        <div className="text-[11px] text-slate-400 font-urdu">{u.companyUrdu}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {u.roleTitle}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                        PIN: {u.pin}
                      </td>
                      <td className="px-5 py-3.5">
                        {u.isActive ? (
                          <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <CheckCircle size={13} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            <XCircle size={13} />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() =>
                              setEditingStaffUser({
                                companyId: u.companyId,
                                companyName: u.companyName,
                                user: u
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center space-x-1"
                            title="Edit Staff Member"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => toggleStaffUserStatus(u.companyId, u.id)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              u.isActive
                                ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete staff user "${u.fullName}"?`)) {
                                deleteStaffUser(u.companyId, u.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            title="Delete Staff"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: VIEW FULL COMPANY DETAILS & STAFF USERS */}
      {inspectingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-3xl shadow-2xl p-6 space-y-5 my-8 text-slate-900 dark:text-white">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-black">{inspectingCompany.name}</h3>
                  {getCategoryBadge(inspectingCompany.category)}
                </div>
                <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 font-urdu mt-0.5">
                  {inspectingCompany.urduName}
                </div>
              </div>
              <button
                onClick={() => setInspectingCompany(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Pakistani Tax & Regulatory Settings */}
            <div className="bg-slate-50 dark:bg-[#151521] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center space-x-1.5">
                <FileCheck size={15} />
                <span>Pakistani Commercial Tax & FBR Integration</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-mono">
                <div><span className="text-slate-400">NTN:</span> <span className="font-bold">{inspectingCompany.ntn}</span></div>
                <div><span className="text-slate-400">STRN:</span> <span className="font-bold">{inspectingCompany.strn}</span></div>
                <div><span className="text-slate-400">FBR POSID:</span> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{inspectingCompany.fbrPosId}</span></div>
                <div><span className="text-slate-400">Tier-1 Status:</span> <span className="font-bold uppercase text-blue-600">{inspectingCompany.fbrTier1Status}</span></div>
                <div><span className="text-slate-400">PRA/SRB Reg:</span> <span className="font-bold">{inspectingCompany.praRegistration}</span></div>
                <div><span className="text-slate-400">Phone:</span> <span className="font-bold">{inspectingCompany.phone}</span></div>
                <div className="col-span-2 md:col-span-3 truncate"><span className="text-slate-400">Address:</span> <span className="text-slate-600 dark:text-slate-300">{inspectingCompany.address}, {inspectingCompany.city}, {inspectingCompany.province}</span></div>
              </div>
            </div>

            {/* Staff Users List */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 text-slate-900 dark:text-white">
                  <Users size={15} className="text-blue-500" />
                  <span>Company Staff Accounts ({inspectingCompany.users.length})</span>
                </h4>
                <button
                  onClick={() => setIsAddingStaff(!isAddingStaff)}
                  className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
                >
                  + Add Staff Account
                </button>
              </div>

              {/* Add Staff Form */}
              {isAddingStaff && (
                <form onSubmit={handleAddStaffToCompany} className="bg-slate-50 dark:bg-[#151521] p-4 rounded-xl border border-blue-500/40 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Username (e.g. cashier_ali)"
                      value={newStaff.username}
                      onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                      className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Full Name (e.g. Ali Raza)"
                      value={newStaff.fullName}
                      onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                      className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none"
                    />
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="PIN (1234)"
                      value={newStaff.pin}
                      onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value })}
                      className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsAddingStaff(false)} className="px-3 py-1 text-xs text-slate-400">Cancel</button>
                    <button type="submit" className="px-4 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold">Save Staff</button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto bg-slate-50 dark:bg-[#151521] rounded-xl border border-slate-200 dark:border-slate-800 p-2">
                {inspectingCompany.users.map((u) => (
                  <div key={u.id} className="py-2.5 px-3 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{u.fullName} <span className="text-slate-400 font-mono">(@{u.username})</span></div>
                      <div className="text-[11px] text-blue-500 font-mono mt-0.5">PIN: {u.pin} • Role: {u.roleTitle}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setEditingStaffUser({
                            companyId: inspectingCompany.id,
                            companyName: inspectingCompany.name,
                            user: u
                          })
                        }
                        className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-semibold flex items-center space-x-1"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => toggleStaffUserStatus(inspectingCompany.id, u.id)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                          u.isActive ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60' : 'text-rose-600 bg-rose-50 dark:bg-rose-950/60'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete staff account "${u.fullName}"?`)) {
                            deleteStaffUser(inspectingCompany.id, u.id);
                            setInspectingCompany({
                              ...inspectingCompany,
                              users: inspectingCompany.users.filter((item) => item.id !== u.id)
                            });
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setEditingCompany(inspectingCompany);
                  setInspectingCompany(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5"
              >
                <Edit3 size={14} />
                <span>Edit Company Profile</span>
              </button>

              <button
                onClick={() => setInspectingCompany(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT COMPANY PROFILE & SETTINGS */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Edit3 size={18} className="text-blue-500" />
                <span>Edit Company Settings & Tax Profile</span>
              </h3>
              <button onClick={() => setEditingCompany(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateCompanySave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={editingCompany.name}
                    onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Urdu Name (اردو نام)</label>
                  <input
                    type="text"
                    value={editingCompany.urduName}
                    onChange={(e) => setEditingCompany({ ...editingCompany, urduName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white text-right font-urdu outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Operating Category Selector */}
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">
                  Operating Business Category (Sets Unlocked Features)
                </label>
                <select
                  value={editingCompany.category}
                  onChange={(e) => setEditingCompany({ ...editingCompany, category: e.target.value as CompanyCategory })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="supermarket">🛒 Supermarket POS (Rapid Barcode Scanning, Cash Drawer, FBR USIN)</option>
                  <option value="shop_kiryana">🏪 Kiryana & Grocery (Loose Scale, Kg/Pao, Quick Bill)</option>
                  <option value="wholesale_distributor">🏢 Wholesale & Seeds Distributor (B2B Orders, 5-Stage Procurement, Godown vs Shop, Delivery Challans, No Retail POS)</option>
                  <option value="grain_mandi_seeds">🌾 Galla Mandi Seeds & Arhat (Electronic Kanta, 40kg Mann, Bardana Tare, Arhat %, Farmer Khata)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">NTN Number</label>
                  <input
                    type="text"
                    value={editingCompany.ntn}
                    onChange={(e) => setEditingCompany({ ...editingCompany, ntn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">STRN (Sales Tax)</label>
                  <input
                    type="text"
                    value={editingCompany.strn}
                    onChange={(e) => setEditingCompany({ ...editingCompany, strn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">FBR POSID</label>
                  <input
                    type="text"
                    value={editingCompany.fbrPosId}
                    onChange={(e) => setEditingCompany({ ...editingCompany, fbrPosId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingCompany.phone}
                    onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">City</label>
                  <input
                    type="text"
                    value={editingCompany.city}
                    onChange={(e) => setEditingCompany({ ...editingCompany, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Province</label>
                  <select
                    value={editingCompany.province}
                    onChange={(e) => setEditingCompany({ ...editingCompany, province: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad">Islamabad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Full Address</label>
                <input
                  type="text"
                  value={editingCompany.address}
                  onChange={(e) => setEditingCompany({ ...editingCompany, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-sm hover:shadow"
                  style={{ backgroundColor: primaryColor }}
                >
                  Save Changes / اپڈیٹ محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT STAFF MEMBER MODAL */}
      {editingStaffUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold flex items-center space-x-2">
                  <Edit3 size={18} className="text-blue-500" />
                  <span>Edit Staff Account Details</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Company: {editingStaffUser.companyName}</p>
              </div>
              <button onClick={() => setEditingStaffUser(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveEditedStaff} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingStaffUser.user.fullName}
                    onChange={(e) =>
                      setEditingStaffUser({
                        ...editingStaffUser,
                        user: { ...editingStaffUser.user, fullName: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editingStaffUser.user.username}
                    onChange={(e) =>
                      setEditingStaffUser({
                        ...editingStaffUser,
                        user: { ...editingStaffUser.user, username: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Role Title</label>
                  <input
                    type="text"
                    value={editingStaffUser.user.roleTitle}
                    onChange={(e) =>
                      setEditingStaffUser({
                        ...editingStaffUser,
                        user: { ...editingStaffUser.user, roleTitle: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Terminal PIN (4 Digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={editingStaffUser.user.pin}
                    onChange={(e) =>
                      setEditingStaffUser({
                        ...editingStaffUser,
                        user: { ...editingStaffUser.user, pin: e.target.value }
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Permissions:
                </label>
                <div className="space-y-2">
                  {allPermissionsList.map((perm) => {
                    const isChecked = editingStaffUser.user.permissions?.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer ${
                          isChecked
                            ? 'bg-blue-50/60 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                            : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const newPerms = isChecked
                                ? editingStaffUser.user.permissions.filter((p) => p !== perm.id)
                                : [...editingStaffUser.user.permissions, perm.id];
                              setEditingStaffUser({
                                ...editingStaffUser,
                                user: { ...editingStaffUser.user, permissions: newPerms }
                              });
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">{perm.label}</span>
                        </div>
                        <span className="text-[11px] font-urdu text-blue-500">{perm.urdu}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingStaffUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  Save Staff User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: GLOBAL ADD STAFF MODAL */}
      {isGlobalAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 my-8 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <UserPlus size={18} className="text-blue-500" />
                <span>Add Staff User to Client Company</span>
              </h3>
              <button onClick={() => setIsGlobalAddStaffOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddStaffToCompany} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Target Client Company</label>
                <select
                  value={globalStaffTargetCompany}
                  onChange={(e) => setGlobalStaffTargetCompany(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cashier_lahore"
                    value={newStaff.username}
                    onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Cashier"
                    value={newStaff.roleTitle}
                    onChange={(e) => setNewStaff({ ...newStaff, roleTitle: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Terminal PIN (4 Digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={newStaff.pin}
                    onChange={(e) => setNewStaff({ ...newStaff, pin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGlobalAddStaffOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  Save Staff User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: REGISTER NEW COMPANY */}
      {isNewCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 my-8 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <Building2 size={18} className="text-blue-500" />
                <span>Register New Client Company & Store</span>
              </h3>
              <button onClick={() => setIsNewCompanyModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Company Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Madina Cash & Carry"
                    value={newComp.name}
                    onChange={(e) => setNewComp({ ...newComp, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Urdu Name (اردو نام)</label>
                  <input
                    type="text"
                    placeholder="مثلاً مدینہ کیش اینڈ کیری"
                    value={newComp.urduName}
                    onChange={(e) => setNewComp({ ...newComp, urduName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white text-right font-urdu outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">
                  Operating Business Category (Sets Unlocked Features)
                </label>
                <select
                  value={newComp.category}
                  onChange={(e) => setNewComp({ ...newComp, category: e.target.value as CompanyCategory })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="supermarket">🛒 Supermarket POS (Rapid Barcode Scanning, Cash Drawer, FBR USIN)</option>
                  <option value="shop_kiryana">🏪 Kiryana & Grocery (Loose Scale, Kg/Pao, Quick Bill)</option>
                  <option value="wholesale_distributor">🏢 Wholesale & Seeds Distributor (B2B Orders, 5-Stage Procurement, Godown vs Shop, Delivery Challans, No Retail POS)</option>
                  <option value="grain_mandi_seeds">🌾 Galla Mandi Seeds & Arhat (Electronic Kanta, 40kg Mann, Bardana Tare, Arhat %, Farmer Khata)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">NTN Number</label>
                  <input
                    type="text"
                    placeholder="3201456-7"
                    value={newComp.ntn}
                    onChange={(e) => setNewComp({ ...newComp, ntn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">STRN (Sales Tax)</label>
                  <input
                    type="text"
                    placeholder="32-77-8761-234-55"
                    value={newComp.strn}
                    onChange={(e) => setNewComp({ ...newComp, strn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">FBR POSID</label>
                  <input
                    type="text"
                    placeholder="892014"
                    value={newComp.fbrPosId}
                    onChange={(e) => setNewComp({ ...newComp, fbrPosId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newComp.phone}
                    onChange={(e) => setNewComp({ ...newComp, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Lahore"
                    value={newComp.city}
                    onChange={(e) => setNewComp({ ...newComp, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Province</label>
                  <select
                    value={newComp.province}
                    onChange={(e) => setNewComp({ ...newComp, province: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad">Islamabad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Full Physical Address</label>
                <input
                  type="text"
                  placeholder="Main Commercial Market, Lahore"
                  value={newComp.address}
                  onChange={(e) => setNewComp({ ...newComp, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCompanyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white font-bold text-xs shadow-sm hover:shadow"
                  style={{ backgroundColor: primaryColor }}
                >
                  Register Company / کمپنی بنائیں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: CREATE SUBSCRIPTION PLAN */}
      {isNewSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <h3 className="text-base font-bold flex items-center space-x-2">
              <CreditCard size={18} className="text-blue-500" />
              <span>Create New Company SaaS Subscription</span>
            </h3>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Target Client Company</label>
                <select
                  value={newSubForm.tenantId}
                  onChange={(e) => setNewSubForm({ ...newSubForm, tenantId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Plan Tier</label>
                  <select
                    value={newSubForm.planName}
                    onChange={(e) => setNewSubForm({ ...newSubForm, planName: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Starter">Starter (1 POS)</option>
                    <option value="Professional">Professional (3 POS)</option>
                    <option value="Enterprise">Enterprise (Unlimited)</option>
                    <option value="Custom">Custom SLA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Monthly Fee (Rs.)</label>
                  <input
                    type="number"
                    value={newSubForm.monthlyFee}
                    onChange={(e) => setNewSubForm({ ...newSubForm, monthlyFee: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Billing Cycle</label>
                <select
                  value={newSubForm.billingCycle}
                  onChange={(e) => setNewSubForm({ ...newSubForm, billingCycle: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="monthly">Monthly (ہر ماہ)</option>
                  <option value="quarterly">Quarterly (سہ ماہی)</option>
                  <option value="annual">Annual (سالانہ)</option>
                  <option value="lifetime">Lifetime License (مستقل لائف ٹائم)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: RECORD PAYMENT */}
      {isPaymentModalOpen && selectedSubForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <h3 className="text-base font-bold flex items-center space-x-2">
              <DollarSign size={18} className="text-emerald-500" />
              <span>Record Subscription Fee Payment</span>
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              For: <strong className="text-slate-900 dark:text-white">{selectedSubForPayment.tenantName}</strong> (Remaining: Rs. {selectedSubForPayment.remainingDues.toLocaleString()})
            </div>

            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Payment Amount (Rs.)</label>
                <input
                  type="number"
                  required
                  placeholder={selectedSubForPayment.remainingDues.toString()}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Payment Channel</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Bank Transfer">Bank Transfer (1Link/Raast)</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Cheque">Bank Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Reference / Trx ID</label>
                  <input
                    type="text"
                    placeholder="e.g. TRX-998812"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Internal Note (Private)</label>
                <input
                  type="text"
                  placeholder="e.g. Received via Raast into Meezan Bank"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: VIEW PAYMENT HISTORY */}
      {viewingHistorySub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center space-x-2">
                <History size={18} className="text-blue-500" />
                <span>Payment History: {viewingHistorySub.tenantName}</span>
              </h3>
              <button onClick={() => setViewingHistorySub(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
              {viewingHistorySub.payments && viewingHistorySub.payments.length > 0 ? (
                viewingHistorySub.payments.map((p) => (
                  <div key={p.id} className="py-2.5 flex justify-between items-center text-xs">
                    <div>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        Rs. {p.amount.toLocaleString()} ({p.paymentMethod})
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">Ref: {p.referenceNo || 'Direct'} • {p.date}</div>
                    </div>
                    <button
                      onClick={() => deleteSubscriptionPayment(viewingHistorySub.id, p.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                      title="Delete Transaction"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">No payment records found.</div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingHistorySub(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
