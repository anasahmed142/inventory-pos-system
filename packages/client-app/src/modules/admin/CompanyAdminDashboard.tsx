// packages/client-app/src/modules/admin/CompanyAdminDashboard.tsx
import React, { useState } from 'react';
import {
  Store,
  Palette,
  Printer,
  Package,
  Users,
  Barcode,
  Truck,
  Plus,
  Edit3,
  CheckCircle,
  XCircle,
  QrCode,
  Shield,
  KeyRound,
  DollarSign,
  Search,
  ShoppingCart,
  Layers,
  Sparkles,
  PrinterIcon,
  Trash2,
  FileCheck,
  Building2,
  Sliders,
  Type,
  Sun,
  Moon,
  AlertTriangle,
  UserPlus,
  Upload,
  Image as ImageIcon,
  Check,
  CheckSquare,
  Square,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import {
  useTenantBrandingStore,
  BusinessMode,
  THEME_PRESETS,
  ThemePresetKey
} from '@inventory/ui';
import { UserPermission } from '@inventory/shared-types';
import {
  useMasterDataStore,
  ProductRecord,
  OrderRecord,
  CompanyStaffUser,
  CompanyRecord
} from '../../stores/useMasterDataStore';

export const CompanyAdminDashboard: React.FC = () => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const setProfile = useTenantBrandingStore((s) => s.setProfile);
  const switchBusinessMode = useTenantBrandingStore((s) => s.switchBusinessMode);
  const toggleThemeMode = useTenantBrandingStore((s) => s.toggleThemeMode);
  const setThemePreset = useTenantBrandingStore((s) => s.setThemePreset);
  const updateThemeCustomization = useTenantBrandingStore((s) => s.updateThemeCustomization);

  const themeMode = profile?.themeMode || 'dark';
  const themePreset = profile?.themePreset || 'metronic_dark';
  const fontFamily = profile?.fontFamily || 'Inter';
  const borderRadius = profile?.borderRadius || '14px';

  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  // Master Persistent Store Actions & State
  const allProducts = useMasterDataStore((s) => s.products);
  const allOrders = useMasterDataStore((s) => s.orders);
  const allCompanies = useMasterDataStore((s) => s.companies);

  const addProduct = useMasterDataStore((s) => s.addProduct);
  const updateProduct = useMasterDataStore((s) => s.updateProduct);
  const deleteProduct = useMasterDataStore((s) => s.deleteProduct);
  const addStaffUser = useMasterDataStore((s) => s.addStaffUser);
  const updateStaffUser = useMasterDataStore((s) => s.updateStaffUser);
  const deleteStaffUser = useMasterDataStore((s) => s.deleteStaffUser);
  const toggleStaffUserStatus = useMasterDataStore((s) => s.toggleStaffUserStatus);
  const updateOrderStatus = useMasterDataStore((s) => s.updateOrderStatus);
  const updateCompany = useMasterDataStore((s) => s.updateCompany);

  // Scoped lists for this active company
  const currentCompany = allCompanies.find((c) => c.id === activeTenantId) || allCompanies[0];
  const products = allProducts.filter((p) => p.tenantId === activeTenantId || !p.tenantId);
  const orders = allOrders.filter((o) => o.tenantId === activeTenantId || !o.tenantId);
  const subUsers = currentCompany ? currentCompany.users : [];

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'orders' | 'sub_users' | 'settings'>('products');
  const [productSearch, setProductSearch] = useState('');

  // Batch Multi-Product Barcode Studio State
  const [isBarcodeStudioOpen, setIsBarcodeStudioOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [labelQuantities, setLabelQuantities] = useState<Record<string, number>>({});
  const [labelSize, setLabelSize] = useState<'50x25' | '38x25' | '40x30' | '100x50' | 'a4_sheet'>('50x25');
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [barcodeOptions, setBarcodeOptions] = useState({
    showUrduName: true,
    showCompanyName: true,
    showPrice: true,
    showBarcodeText: true,
    showDate: true
  });

  // Editing Product Modal State
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);

  // New Product Modal State
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [newProd, setNewProd] = useState<Partial<ProductRecord>>({
    name: '',
    urduName: '',
    category: 'Grains & Groceries',
    barcode: '',
    costPrice: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    currentStock: 0,
    minThreshold: 5,
    unit: 'Piece'
  });

  // Editing Sub-User Modal State
  const [editingSubUser, setEditingSubUser] = useState<CompanyStaffUser | null>(null);

  // New Sub-User Modal State
  const [isNewSubUserOpen, setIsNewSubUserOpen] = useState(false);
  const [newSubUser, setNewSubUser] = useState<{
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
    { id: 'products_manage', label: 'Manage Products & Barcode Printing (پروڈکٹ انٹری)', urdu: 'اسٹاک و پروڈکٹس' },
    { id: 'khata_manage', label: 'Manage Bahi-Khata Ledger (کھاتہ دار و ادھار)', urdu: 'بہی کھاتہ' },
    { id: 'customers_manage', label: 'Manage Buyers & Suppliers (گاہک و سپلائر)', urdu: 'پارٹیز' },
    { id: 'reports_view', label: 'View Sales & Financial Reports (رپورٹس)', urdu: 'رپورٹس' }
  ];

  // Logo Upload & Cache Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please select an image smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64 = uploadEvent.target?.result as string;
      updateThemeCustomization({ logoBase64: base64 });
      updateCompany(activeTenantId, { logoBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    updateThemeCustomization({ logoBase64: undefined });
    updateCompany(activeTenantId, { logoBase64: undefined });
  };

  // Barcode Studio Actions
  const handleOpenSingleProductBarcode = (prod: ProductRecord) => {
    setSelectedProductIds([prod.id]);
    setLabelQuantities({ [prod.id]: 1 });
    setIsBarcodeStudioOpen(true);
  };

  const handleOpenBatchBarcodes = () => {
    if (selectedProductIds.length === 0 && products.length > 0) {
      const initialIds = products.slice(0, 3).map((p) => p.id);
      setSelectedProductIds(initialIds);
      const initialQtys: Record<string, number> = {};
      initialIds.forEach((id) => { initialQtys[id] = 1; });
      setLabelQuantities(initialQtys);
    }
    setIsBarcodeStudioOpen(true);
  };

  const toggleSelectProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter((pid) => pid !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
      if (!labelQuantities[id]) {
        setLabelQuantities({ ...labelQuantities, [id]: 1 });
      }
    }
  };

  const selectAllProducts = () => {
    const allIds = products.map((p) => p.id);
    setSelectedProductIds(allIds);
    const qtys: Record<string, number> = {};
    allIds.forEach((id) => { qtys[id] = labelQuantities[id] || 1; });
    setLabelQuantities(qtys);
  };

  const deselectAllProducts = () => {
    setSelectedProductIds([]);
  };

  const updateLabelQty = (id: string, delta: number) => {
    const current = labelQuantities[id] || 1;
    const next = Math.max(1, current + delta);
    setLabelQuantities({ ...labelQuantities, [id]: next });
  };

  const printBarcodeSheet = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const itemsToPrint: Array<{ product: ProductRecord; copyIndex: number }> = [];
    selectedProductIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (prod) {
        const qty = labelQuantities[id] || 1;
        for (let i = 0; i < qty; i++) {
          itemsToPrint.push({ product: prod, copyIndex: i + 1 });
        }
      }
    });

    const companyName = profile?.name || currentCompany.name;
    const dateStr = new Date().toLocaleDateString('en-GB');

    let sizeCss = '';
    if (labelSize === '50x25') {
      sizeCss = `@page { size: 50mm 25mm; margin: 0; } body { margin: 0; width: 50mm; } .label-card { width: 50mm; height: 25mm; page-break-after: always; box-sizing: border-box; padding: 2mm; display: flex; flex-direction: column; justify-content: space-between; font-family: sans-serif; }`;
    } else if (labelSize === '38x25') {
      sizeCss = `@page { size: 38mm 25mm; margin: 0; } body { margin: 0; width: 38mm; } .label-card { width: 38mm; height: 25mm; page-break-after: always; box-sizing: border-box; padding: 1.5mm; display: flex; flex-direction: column; justify-content: space-between; font-family: sans-serif; }`;
    } else if (labelSize === '40x30') {
      sizeCss = `@page { size: 40mm 30mm; margin: 0; } body { margin: 0; width: 40mm; } .label-card { width: 40mm; height: 30mm; page-break-after: always; box-sizing: border-box; padding: 2mm; display: flex; flex-direction: column; justify-content: space-between; font-family: sans-serif; }`;
    } else if (labelSize === '100x50') {
      sizeCss = `@page { size: 100mm 50mm; margin: 0; } body { margin: 0; width: 100mm; } .label-card { width: 100mm; height: 50mm; page-break-after: always; box-sizing: border-box; padding: 4mm; display: flex; flex-direction: column; justify-content: space-between; font-family: sans-serif; }`;
    } else {
      sizeCss = `@page { size: A4; margin: 10mm; } body { margin: 0; font-family: sans-serif; } .a4-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5mm; } .label-card { height: 35mm; border: 1px dashed #ccc; box-sizing: border-box; padding: 2mm; display: flex; flex-direction: column; justify-content: space-between; }`;
    }

    const labelCardsHtml = itemsToPrint.map(({ product }) => {
      return `
        <div class="label-card">
          ${barcodeOptions.showCompanyName ? `<div style="font-size: 8px; font-weight: bold; text-align: center; text-transform: uppercase; overflow: hidden; white-space: nowrap;">${companyName}</div>` : ''}
          <div style="font-size: 11px; font-weight: 900; text-align: center; line-height: 1.1; overflow: hidden;">${product.name}</div>
          ${barcodeOptions.showUrduName && product.urduName ? `<div style="font-size: 10px; font-weight: bold; text-align: center; direction: rtl;">${product.urduName}</div>` : ''}
          <div style="text-align: center; margin: 2px 0;">
            <div style="height: 16px; display: flex; align-items: flex-end; justify-content: center; gap: 1.5px;">
              ${[...Array(28)].map((_, i) => `<div style="height: 100%; width: ${i % 3 === 0 ? '2px' : '1px'}; background: black;"></div>`).join('')}
            </div>
            ${barcodeOptions.showBarcodeText ? `<div style="font-size: 9px; letter-spacing: 2px; font-weight: bold; font-family: monospace;">${product.barcode}</div>` : ''}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9px; font-weight: bold; border-top: 0.5px solid #ddd; padding-top: 1px;">
            ${barcodeOptions.showPrice ? `<span style="font-size: 11px; font-weight: 900;">Rs. ${product.retailPrice.toLocaleString()}</span>` : '<span></span>'}
            ${barcodeOptions.showDate ? `<span>${dateStr}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode Labels - ${companyName}</title>
          <style>
            ${sizeCss}
          </style>
        </head>
        <body>
          ${labelSize === 'a4_sheet' ? `<div class="a4-grid">${labelCardsHtml}</div>` : labelCardsHtml}
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name) return;
    const prod: ProductRecord = {
      id: `p-${Date.now().toString(36)}`,
      tenantId: activeTenantId,
      name: newProd.name || '',
      urduName: newProd.urduName || '',
      category: newProd.category || 'General',
      barcode: newProd.barcode || Math.floor(100000000000 + Math.random() * 900000000000).toString(),
      costPrice: Number(newProd.costPrice) || 0,
      retailPrice: Number(newProd.retailPrice) || 0,
      wholesalePrice: Number(newProd.wholesalePrice) || 0,
      currentStock: Number(newProd.currentStock) || 0,
      minThreshold: Number(newProd.minThreshold) || 5,
      unit: newProd.unit || 'Piece'
    };

    addProduct(prod);
    setIsNewProductOpen(false);
    setNewProd({ name: '', urduName: '', category: 'General', barcode: '', costPrice: 0, retailPrice: 0, wholesalePrice: 0, currentStock: 0, unit: 'Piece' });
  };

  const handleUpdateProductSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct.id, editingProduct);
    setEditingProduct(null);
  };

  const handleCreateSubUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubUser.username || !newSubUser.fullName) return;
    const sub: CompanyStaffUser = {
      id: `su-${Date.now().toString(36)}`,
      tenantId: activeTenantId,
      username: newSubUser.username,
      fullName: newSubUser.fullName,
      pin: newSubUser.pin || '1234',
      permissions: newSubUser.permissions,
      isActive: true,
      roleTitle: newSubUser.roleTitle || 'Operator',
      lastLogin: 'Never'
    };

    addStaffUser(activeTenantId, sub);
    setIsNewSubUserOpen(false);
    setNewSubUser({ username: '', fullName: '', pin: '1234', roleTitle: 'Cashier', permissions: ['orders_create'] });
  };

  const handleUpdateSubUserSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSubUser) return;
    updateStaffUser(activeTenantId, editingSubUser.id, editingSubUser);
    setEditingSubUser(null);
  };

  const togglePermission = (perm: UserPermission) => {
    if (newSubUser.permissions.includes(perm)) {
      setNewSubUser({ ...newSubUser, permissions: newSubUser.permissions.filter((p) => p !== perm) });
    } else {
      setNewSubUser({ ...newSubUser, permissions: [...newSubUser.permissions, perm] });
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.urduName.includes(productSearch) ||
      p.barcode.includes(productSearch)
  );

  const lowStockCount = products.filter((p) => p.currentStock <= (p.minThreshold || 5)).length;
  const totalStockValue = products.reduce((acc, p) => acc + p.costPrice * p.currentStock, 0);

  return (
    <div className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto bg-[var(--bg-canvas)] text-[var(--text-main)] font-sans pb-16 md:pb-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-4 md:p-6 shadow-sm flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-[var(--primary-subtle)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)] font-black text-xl md:text-2xl shadow-sm shrink-0">
              🏢
            </div>
            <div>
              <div className="flex items-center space-x-2 md:space-x-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {profile?.name}
                </h1>
                <span className="bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] text-[10px] md:text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Company Admin
                </span>
                {currentCompany?.ntn && (
                  <span className="bg-slate-100 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400 text-[10px] md:text-xs px-2 py-0.5 rounded-md font-mono">
                    NTN: {currentCompany.ntn}
                  </span>
                )}
              </div>
              <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 font-urdu mt-0.5">
                {profile?.urduName} - دکان و کمپنی مینیجر کنٹرول پینل
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100/90 dark:bg-[#151521] p-1.5 rounded-xl border border-slate-200 dark:border-[#2b2b40] overflow-x-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveSubTab('products')}
              className={`flex items-center space-x-1.5 md:space-x-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeSubTab === 'products'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Package size={14} />
              <span>Products ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('orders')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'orders'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingCart size={14} />
              <span>Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('sub_users')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'sub_users'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>Staff ({subUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('settings')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'settings'
                  ? 'bg-[var(--primary)] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palette size={14} />
              <span>Theme & Settings</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Catalog Items</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{products.length}</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Active inventory lines</div>
          </div>

          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Low Stock Alert</div>
            <div className={`text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
              {lowStockCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Items below threshold</div>
          </div>

          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inventory Valuation</div>
            <div className="text-2xl font-mono font-black text-[var(--primary)] mt-1">
              Rs. {totalStockValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">At wholesale cost price</div>
          </div>

          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Staff Accounts</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{subUsers.length}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">Role-restricted users</div>
          </div>
        </div>

        {/* TAB 1: PRODUCTS & BARCODE PRINTING */}
        {activeSubTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-[#1e1e2d] p-4 rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] shadow-sm">
              <div className="relative flex-1 min-w-[260px] max-w-md">
                <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search product name, Urdu name, barcode..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleOpenBatchBarcodes}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] text-slate-800 dark:text-slate-200 hover:border-[var(--primary)] hover:text-[var(--primary)] font-bold text-xs shadow-sm transition-all"
                >
                  <Barcode size={15} className="text-[var(--primary)]" />
                  <span>Batch Barcode Studio / بارکوڈ اسٹوڈیو</span>
                </button>
                <button
                  onClick={() => setIsNewProductOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Plus size={15} />
                  <span>Add Product / نیا پروڈکٹ</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-[#151521] text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#2b2b40]">
                    <tr>
                      <th className="px-5 py-3.5">Product Name & Category</th>
                      <th className="px-5 py-3.5">Barcode / SKU</th>
                      <th className="px-5 py-3.5">Cost Price</th>
                      <th className="px-5 py-3.5">Retail Price</th>
                      <th className="px-5 py-3.5">Wholesale</th>
                      <th className="px-5 py-3.5">Live Stock</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400">
                          No products found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const isLowStock = p.currentStock <= (p.minThreshold || 5);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</div>
                              <div className="text-xs text-slate-500 font-urdu mt-0.5">{p.urduName}</div>
                              <span className="text-[10px] bg-slate-100 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded mt-1 inline-block">
                                {p.category}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">{p.barcode}</td>
                            <td className="px-5 py-3.5 font-mono text-xs text-slate-500 dark:text-slate-400">
                              Rs. {p.costPrice.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              Rs. {p.retailPrice.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 font-mono text-xs text-amber-600 dark:text-amber-400">
                              Rs. {p.wholesalePrice.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5 font-mono">
                              <div className="flex items-center space-x-1.5">
                                <span className={`font-bold ${isLowStock ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-900 dark:text-white'}`}>
                                  {p.currentStock}
                                </span>
                                <span className="text-[10px] text-slate-400">{p.unit}</span>
                                {isLowStock && (
                                  <span className="bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-[10px] px-1.5 py-0.2 rounded font-bold">
                                    Low
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <button
                                  onClick={() => handleOpenSingleProductBarcode(p)}
                                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white border border-[var(--primary)]/20 text-xs font-bold transition-all"
                                  title="Print Barcode Label"
                                >
                                  <Barcode size={13} />
                                  <span>Print</span>
                                </button>
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#151521] text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-[#2b2b40] transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete product "${p.name}"?`)) {
                                      deleteProduct(p.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & DISPATCH TRACKING */}
        {activeSubTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#1e1e2d] p-5 rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] shadow-sm">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Store & Wholesale Orders Ledger</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Track buyer order statuses, customer receivables, and warehouse dispatch lifecycle.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-5 border border-slate-200/80 dark:border-[#2b2b40] shadow-sm space-y-3.5"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs text-[var(--primary)] font-bold bg-[var(--primary-subtle)] px-2.5 py-1 rounded-md border border-[var(--primary)]/20">
                      {order.invoiceNo || order.id}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        order.dispatchStatus === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : order.dispatchStatus === 'dispatched'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {order.dispatchStatus}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{order.partyName || order.customerName}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{order.date} • {order.paymentMethod}</div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#151521] p-3 rounded-xl border border-slate-200 dark:border-[#2b2b40] space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Total Value:</span>
                      <span className="font-bold text-slate-900 dark:text-white">Rs. {order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Paid Amount:</span>
                      <span className="font-bold">Rs. {order.paidAmount.toLocaleString()}</span>
                    </div>
                    {(order.remainingDues ?? 0) > 0 && (
                      <div className="flex justify-between text-rose-600 dark:text-rose-400 pt-1 border-t border-slate-200 dark:border-[#2b2b40]">
                        <span>Remaining Dues:</span>
                        <span className="font-bold">Rs. {order.remainingDues?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">Dispatch Status:</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['pending', 'dispatched', 'delivered'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => updateOrderStatus(order.id, st)}
                          className={`py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                            order.dispatchStatus === st
                              ? 'bg-[var(--primary)] text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#2b2b40]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SUB-USERS & GRANULAR PERMISSIONS */}
        {activeSubTab === 'sub_users' && (
          <div className="space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-[#1e1e2d] p-5 rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] shadow-sm">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Company Staff & Granular Access</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Create cashiers, warehouse clerks, and salespeople with restricted permissions.
                </p>
              </div>
              <button
                onClick={() => setIsNewSubUserOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm transition-all"
              >
                <Plus size={15} />
                <span>Add Sub-User / ملازم شامل کریں</span>
              </button>
            </div>

            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-[#151521] text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#2b2b40]">
                  <tr>
                    <th className="px-5 py-3.5">Employee Name</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Terminal PIN</th>
                    <th className="px-5 py-3.5">Allowed Permissions</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]">
                  {subUsers.map((su) => (
                    <tr key={su.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{su.fullName}</div>
                        <div className="text-xs text-slate-400 font-mono">@{su.username}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="bg-[var(--primary-subtle)] text-[var(--primary)] text-xs px-2.5 py-0.5 rounded-full font-bold">
                          {su.roleTitle}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                        PIN: {su.pin}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {su.permissions.map((p) => (
                            <span key={p} className="bg-slate-100 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] text-[10px] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-mono">
                              {p.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {su.isActive ? (
                          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                            <CheckCircle size={12} />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                            <XCircle size={12} />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setEditingSubUser(su)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#151521] text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-[#2b2b40] transition-colors"
                            title="Edit Sub-User"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => toggleStaffUserStatus(activeTenantId, su.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                              su.isActive
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {su.isActive ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete sub-user account "${su.fullName}"?`)) {
                                deleteStaffUser(activeTenantId, su.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
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

        {/* TAB 4: BRANDING, THEMES & PAKISTANI FBR SETTINGS */}
        {activeSubTab === 'settings' && (
          <div className="space-y-6">
            {/* Company Official Logo Upload & Local Storage Cache */}
            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 border border-slate-200/80 dark:border-[#2b2b40] shadow-sm space-y-5">
              <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-slate-200/80 dark:border-[#2b2b40]">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <ImageIcon size={18} className="text-[var(--primary)]" />
                    <span>Company Official Logo (لوگو اپ لوڈ اور کیشے)</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Upload your high-res company logo. Cached in local storage and rendered on Login Screen, Topbar, Delivery Challan, and Invoices.
                  </p>
                </div>
                {profile?.logoBase64 && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-bold hover:bg-rose-100 transition-all"
                  >
                    <Trash2 size={13} />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-[#151521] overflow-hidden p-2 shadow-inner relative group">
                  {profile?.logoBase64 ? (
                    <img
                      src={profile.logoBase64}
                      alt="Company Logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-2">
                      <ImageIcon className="mx-auto text-slate-400 mb-1" size={24} />
                      <span className="text-[10px] text-slate-400 block font-medium">No Logo Uploaded</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white">Supported formats:</span> PNG, JPEG, SVG, WEBP (Max 2MB).
                    <br />
                    For best results on thermal receipts and invoices, use a clear image with transparent or white background.
                  </div>

                  <label className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold shadow-sm cursor-pointer transition-all">
                    <Upload size={14} />
                    <span>{profile?.logoBase64 ? 'Change Company Logo' : 'Upload Company Logo / لوگو منتخب کریں'}</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp, image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Theme & Styling Metronic Studio for Company */}
            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 border border-slate-200/80 dark:border-[#2b2b40] shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200/80 dark:border-[#2b2b40]">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Palette size={18} className="text-[var(--primary)]" />
                    <span>Company Theme, Styling & Branding Studio</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Customize your company's colors, fonts, corner curves, and light/dark theme. Saved automatically for your company.
                  </p>
                </div>

                {/* Dark / Light Toggle */}
                <button
                  type="button"
                  onClick={toggleThemeMode}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[var(--primary)] transition-all"
                >
                  {themeMode === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-600" />}
                  <span>{themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </button>
              </div>

              {/* Curated Metronic Presets */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                  Select Theme Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {Object.entries(THEME_PRESETS).map(([key, p]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThemePreset(key as ThemePresetKey)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        themePreset === key
                          ? 'border-[var(--primary)] bg-[var(--primary-subtle)] ring-1 ring-[var(--primary)]'
                          : 'border-slate-200 dark:border-[#2b2b40] bg-slate-50/50 dark:bg-[#151521] hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-1.5 mb-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.colors.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: p.colors.secondary }} />
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80 dark:border-[#2b2b40]">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Primary Brand Color (Hex)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={profile?.primaryHex || '#3b82f6'}
                      onChange={(e) => updateThemeCustomization({ primaryHex: e.target.value })}
                      className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={profile?.primaryHex || '#3b82f6'}
                      onChange={(e) => updateThemeCustomization({ primaryHex: e.target.value })}
                      className="flex-1 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Secondary Accent Color (Hex)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={profile?.secondaryHex || '#10b981'}
                      onChange={(e) => updateThemeCustomization({ secondaryHex: e.target.value })}
                      className="w-10 h-10 rounded-xl border-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={profile?.secondaryHex || '#10b981'}
                      onChange={(e) => updateThemeCustomization({ secondaryHex: e.target.value })}
                      className="flex-1 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Typography & Radius Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/80 dark:border-[#2b2b40]">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Font Family (Typography)
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => updateThemeCustomization({ fontFamily: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="Inter">Inter (Clean Modern Metronic)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Ultra Premium)</option>
                    <option value="Outfit">Outfit (Geometric Modern)</option>
                    <option value="Noto Sans Arabic">Noto Sans Arabic & Urdu</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Corner Curvature (Radius)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['6px', '10px', '14px', '20px'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => updateThemeCustomization({ borderRadius: r })}
                        className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                          borderRadius === r
                            ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                            : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40] text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Company Legal & Pakistani FBR Integration */}
            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 border border-slate-200/80 dark:border-[#2b2b40] shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Building2 size={18} className="text-[var(--primary)]" />
                <span>Company Legal Profile & Pakistani Tax / FBR Settings</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Store Name (English)
                  </label>
                  <input
                    type="text"
                    value={profile?.name || ''}
                    onChange={(e) => profile && setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Store Name (Urdu / اردو نام)
                  </label>
                  <input
                    type="text"
                    value={profile?.urduName || ''}
                    onChange={(e) => profile && setProfile({ ...profile, urduName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 text-right font-urdu outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    NTN Number (National Tax Number)
                  </label>
                  <input
                    type="text"
                    value={currentCompany.ntn || ''}
                    onChange={(e) => updateCompany(activeTenantId, { ntn: e.target.value })}
                    placeholder="e.g. 3201-7654321-1"
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    STRN (Sales Tax Registration)
                  </label>
                  <input
                    type="text"
                    value={currentCompany.strn || ''}
                    onChange={(e) => updateCompany(activeTenantId, { strn: e.target.value })}
                    placeholder="e.g. 19-05-9988-776-55"
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    FBR Digital POS ID (Online Integration)
                  </label>
                  <input
                    type="text"
                    value={currentCompany.fbrPosId || ''}
                    onChange={(e) => updateCompany(activeTenantId, { fbrPosId: e.target.value })}
                    placeholder="e.g. FBR-POS-09876"
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Phone / WhatsApp Helpline
                  </label>
                  <input
                    type="text"
                    value={profile?.phone || ''}
                    onChange={(e) => profile && setProfile({ ...profile, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BATCH MULTI-PRODUCT BARCODE STUDIO MODAL */}
      {isBarcodeStudioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-[#2b2b40] bg-slate-50/50 dark:bg-[#151521]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-bold">
                  <Barcode size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Batch Barcode Label Generator Studio</span>
                    <span className="text-xs text-[var(--primary)] font-urdu font-normal">(ملٹی پروڈکٹ بارکوڈ اسٹوڈیو)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Print custom thermal rolls and sticker sheets for multiple products simultaneously with custom copies.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBarcodeStudioOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#2b2b40] text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Studio Top Control Strip: Label Size & Content Options */}
            <div className="p-4 border-b border-slate-200 dark:border-[#2b2b40] bg-white dark:bg-[#1e1e2d] grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Label Size Selector */}
              <div className="lg:col-span-7 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                  1. Select Thermal Label Paper Size / اسٹیکر سائز
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {[
                    { id: '50x25', title: '50x25 mm', desc: 'Standard Retail' },
                    { id: '38x25', title: '38x25 mm', desc: 'Compact Sticker' },
                    { id: '40x30', title: '40x30 mm', desc: 'Square / Box' },
                    { id: '100x50', title: '100x50 mm', desc: 'Wholesale Bori' },
                    { id: 'a4_sheet', title: 'A4 Sheet', desc: '24-Grid (3x8)' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setLabelSize(s.id as any)}
                      className={`p-2 rounded-xl text-left border transition-all ${
                        labelSize === s.id
                          ? 'bg-[var(--primary-subtle)] border-[var(--primary)] ring-1 ring-[var(--primary)]'
                          : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40] hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="text-xs font-black text-slate-900 dark:text-white font-mono">{s.title}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Label Toggles */}
              <div className="lg:col-span-5 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                  2. Customize Label Display Fields
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'showCompanyName', label: 'Company Brand' },
                    { key: 'showUrduName', label: 'Urdu Title' },
                    { key: 'showPrice', label: 'Price (Rs.)' },
                    { key: 'showBarcodeText', label: 'Barcode Text' },
                    { key: 'showDate', label: 'Print Date' }
                  ].map(({ key, label }) => {
                    const isChecked = (barcodeOptions as any)[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setBarcodeOptions({ ...barcodeOptions, [key]: !isChecked })}
                        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40] text-slate-500'
                        }`}
                      >
                        {isChecked ? <Check size={12} /> : <div className="w-3 h-3" />}
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Split Workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[360px] overflow-hidden">
              {/* Left Column: Product Selector & Copies */}
              <div className="lg:col-span-6 p-4 border-r border-slate-200 dark:border-[#2b2b40] flex flex-col space-y-3 bg-slate-50/30 dark:bg-[#171723]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Select Products ({selectedProductIds.length}/{products.length})
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={selectAllProducts}
                      className="text-[11px] text-[var(--primary)] font-bold hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={deselectAllProducts}
                      className="text-[11px] text-slate-400 hover:text-rose-500 font-bold"
                    >
                      Deselect
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search product name or barcode..."
                    value={barcodeSearch}
                    onChange={(e) => setBarcodeSearch(e.target.value)}
                    className="w-full bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1">
                  {products
                    .filter((p) =>
                      p.name.toLowerCase().includes(barcodeSearch.toLowerCase()) ||
                      p.urduName.includes(barcodeSearch) ||
                      p.barcode.includes(barcodeSearch)
                    )
                    .map((prod) => {
                      const isSelected = selectedProductIds.includes(prod.id);
                      const qty = labelQuantities[prod.id] || 1;
                      return (
                        <div
                          key={prod.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isSelected
                              ? 'bg-white dark:bg-[#1e1e2d] border-[var(--primary)] shadow-sm'
                              : 'bg-white/60 dark:bg-[#1e1e2d]/60 border-slate-200 dark:border-[#2b2b40] opacity-80'
                          }`}
                        >
                          <div
                            onClick={() => toggleSelectProduct(prod.id)}
                            className="flex items-center space-x-2.5 flex-1 cursor-pointer min-w-0"
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center ${
                                isSelected ? 'bg-[var(--primary)] border-[var(--primary)] text-white' : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{prod.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                SKU: {prod.barcode} • Rs. {prod.retailPrice.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-[#151521] px-2 py-1 rounded-lg border border-slate-200 dark:border-[#2b2b40]">
                              <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Qty:</span>
                              <button
                                type="button"
                                onClick={() => updateLabelQty(prod.id, -1)}
                                className="w-5 h-5 rounded bg-white dark:bg-[#2b2b40] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-xs text-[var(--primary)] w-5 text-center">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateLabelQty(prod.id, 1)}
                                className="w-5 h-5 rounded bg-white dark:bg-[#2b2b40] text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Right Column: Realistic Live Sheet / Roll Preview */}
              <div className="lg:col-span-6 p-4 flex flex-col space-y-2.5 bg-slate-100/50 dark:bg-[#13131c]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Real-Time Sticker Sheet Preview</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Format: {labelSize === 'a4_sheet' ? 'A4 Multi-Grid' : `${labelSize} mm Thermal Roll`}
                  </span>
                </div>

                <div className="flex-1 bg-white text-black p-4 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-y-auto max-h-[300px] shadow-inner space-y-3 font-sans">
                  {selectedProductIds.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                      <Barcode size={36} className="mx-auto text-slate-300" />
                      <p className="text-xs">No products selected for barcode printing.</p>
                      <button
                        type="button"
                        onClick={selectAllProducts}
                        className="text-xs font-bold text-[var(--primary)] underline"
                      >
                        Select All Catalog Items
                      </button>
                    </div>
                  ) : (
                    <div
                      className={
                        labelSize === 'a4_sheet'
                          ? 'grid grid-cols-2 sm:grid-cols-3 gap-2'
                          : 'space-y-3 flex flex-col items-center'
                      }
                    >
                      {selectedProductIds.map((id) => {
                        const prod = products.find((p) => p.id === id);
                        if (!prod) return null;
                        const qty = labelQuantities[id] || 1;

                        return (
                          <div
                            key={id}
                            className={`border-2 border-dashed border-slate-300 bg-white rounded-xl p-2.5 text-center relative flex flex-col justify-between shadow-sm ${
                              labelSize === '100x50'
                                ? 'w-full max-w-sm min-h-[140px]'
                                : labelSize === '40x30'
                                ? 'w-44 min-h-[110px]'
                                : labelSize === '38x25'
                                ? 'w-36 min-h-[90px]'
                                : 'w-48 min-h-[100px]'
                            }`}
                          >
                            {qty > 1 && (
                              <span className="absolute top-1 right-1 bg-amber-100 text-amber-900 text-[9px] px-1.5 py-0.5 rounded font-bold font-mono">
                                ×{qty}
                              </span>
                            )}

                            {barcodeOptions.showCompanyName && (
                              <div className="text-[9px] font-bold uppercase tracking-wider text-slate-700 truncate">
                                {profile?.name || currentCompany.name}
                              </div>
                            )}

                            <div className="text-xs font-black text-slate-950 line-clamp-1 leading-tight mt-0.5">
                              {prod.name}
                            </div>

                            {barcodeOptions.showUrduName && prod.urduName && (
                              <div className="text-[10px] font-bold font-urdu text-slate-800 leading-tight">
                                {prod.urduName}
                              </div>
                            )}

                            {/* Barcode Simulated Lines */}
                            <div className="py-1 px-2 bg-slate-50 rounded flex flex-col items-center justify-center my-1">
                              <div className="h-6 w-full flex items-end justify-center space-x-0.5">
                                {[...Array(24)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-full ${i % 3 === 0 ? 'w-1 bg-black' : i % 2 === 0 ? 'w-0.5 bg-black' : 'w-0.5 bg-transparent'}`}
                                  />
                                ))}
                              </div>
                              {barcodeOptions.showBarcodeText && (
                                <span className="text-[9px] font-bold font-mono tracking-widest mt-0.5 text-slate-800">
                                  {prod.barcode}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-bold pt-1 border-t border-slate-200">
                              {barcodeOptions.showPrice ? (
                                <span className="text-xs font-black text-slate-950">
                                  Rs. {prod.retailPrice.toLocaleString()}
                                </span>
                              ) : <span />}
                              {barcodeOptions.showDate && (
                                <span className="text-[9px] text-slate-500 font-mono">
                                  {new Date().toLocaleDateString('en-GB')}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom Footer */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-[#2b2b40] bg-slate-50/50 dark:bg-[#151521] flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Selected: <span className="font-bold text-slate-900 dark:text-white">{selectedProductIds.length} Products</span> • Total Labels: <span className="font-bold text-[var(--primary)] font-mono text-sm">{selectedProductIds.reduce((sum, id) => sum + (labelQuantities[id] || 1), 0)} Stickers</span>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBarcodeStudioOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#2b2b40] text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  type="button"
                  disabled={selectedProductIds.length === 0}
                  onClick={printBarcodeSheet}
                  className="px-6 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center space-x-2 transition-all"
                >
                  <PrinterIcon size={16} />
                  <span>
                    Print Barcode Labels ({selectedProductIds.reduce((sum, id) => sum + (labelQuantities[id] || 1), 0)})
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-[#2b2b40]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Edit3 size={18} className="text-[var(--primary)]" />
                <span>Edit Product Details (پروڈکٹ ترمیم کریں)</span>
              </h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateProductSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Urdu Name (اردو نام)</label>
                  <input
                    type="text"
                    value={editingProduct.urduName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, urduName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 text-right font-urdu outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Cost Price</label>
                  <input
                    type="number"
                    value={editingProduct.costPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Retail Price</label>
                  <input
                    type="number"
                    value={editingProduct.retailPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, retailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Wholesale Price</label>
                  <input
                    type="number"
                    value={editingProduct.wholesalePrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-amber-600 dark:text-amber-400 font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    value={editingProduct.barcode}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={editingProduct.currentStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm"
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW PRODUCT MODAL */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Package size={18} className="text-[var(--primary)]" />
              <span>Add New Catalog Item (نیا پروڈکٹ شامل کریں)</span>
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Product Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basmati Rice 5kg"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Urdu Name (اردو نام)</label>
                  <input
                    type="text"
                    placeholder="مثلاً باسمتی چاول 5 کلو"
                    value={newProd.urduName}
                    onChange={(e) => setNewProd({ ...newProd, urduName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 text-right font-urdu outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Cost Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProd.costPrice}
                    onChange={(e) => setNewProd({ ...newProd, costPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Retail Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProd.retailPrice}
                    onChange={(e) => setNewProd({ ...newProd, retailPrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Wholesale Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newProd.wholesalePrice}
                    onChange={(e) => setNewProd({ ...newProd, wholesalePrice: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-amber-600 dark:text-amber-400 font-bold outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    placeholder="Leave blank for auto barcode"
                    value={newProd.barcode}
                    onChange={(e) => setNewProd({ ...newProd, barcode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Initial Stock Qty</label>
                  <input
                    type="number"
                    value={newProd.currentStock}
                    onChange={(e) => setNewProd({ ...newProd, currentStock: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProductOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SUB-USER MODAL */}
      {editingSubUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-[#2b2b40]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Edit3 size={18} className="text-[var(--primary)]" />
                <span>Edit Staff Member (ملازم اکاؤنٹ ترمیم کریں)</span>
              </h3>
              <button onClick={() => setEditingSubUser(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleUpdateSubUserSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editingSubUser.username}
                    onChange={(e) => setEditingSubUser({ ...editingSubUser, username: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editingSubUser.fullName}
                    onChange={(e) => setEditingSubUser({ ...editingSubUser, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Role Title</label>
                  <input
                    type="text"
                    value={editingSubUser.roleTitle}
                    onChange={(e) => setEditingSubUser({ ...editingSubUser, roleTitle: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Terminal PIN (4 Digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={editingSubUser.pin}
                    onChange={(e) => setEditingSubUser({ ...editingSubUser, pin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              {/* Granular Permission Checkboxes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Allowed Permissions:
                </label>
                <div className="space-y-2">
                  {allPermissionsList.map((perm) => {
                    const isChecked = editingSubUser.permissions?.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer ${
                          isChecked
                            ? 'bg-[var(--primary-subtle)] border-[var(--primary)]/40 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const newPerms = isChecked
                                ? editingSubUser.permissions.filter((p) => p !== perm.id)
                                : [...editingSubUser.permissions, perm.id];
                              setEditingSubUser({ ...editingSubUser, permissions: newPerms });
                            }}
                            className="rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-xs font-semibold">{perm.label}</span>
                        </div>
                        <span className="text-[11px] font-urdu text-[var(--primary)]">{perm.urdu}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSubUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm"
                >
                  Update Staff User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW SUB-USER MODAL */}
      {isNewSubUserOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users size={18} className="text-[var(--primary)]" />
              <span>Create Company Staff Account (ملازم اکاؤنٹ بنائیں)</span>
            </h3>

            <form onSubmit={handleCreateSubUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Username / شناختی نام</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cashier_ali"
                    value={newSubUser.username}
                    onChange={(e) => setNewSubUser({ ...newSubUser, username: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Full Name / پورا نام</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Raza"
                    value={newSubUser.fullName}
                    onChange={(e) => setNewSubUser({ ...newSubUser, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Role Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Counter Cashier"
                    value={newSubUser.roleTitle}
                    onChange={(e) => setNewSubUser({ ...newSubUser, roleTitle: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Terminal PIN (4 Digits)</label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={newSubUser.pin}
                    onChange={(e) => setNewSubUser({ ...newSubUser, pin: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Granular Permission Checkboxes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Select Allowed Permissions / اختیارات:
                </label>
                <div className="space-y-2">
                  {allPermissionsList.map((perm) => {
                    const isChecked = newSubUser.permissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[var(--primary-subtle)] border-[var(--primary)]/40 text-slate-900 dark:text-white'
                            : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.id)}
                            className="rounded border-slate-300 dark:border-slate-700 text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-xs font-semibold">{perm.label}</span>
                        </div>
                        <span className="text-[11px] font-urdu text-[var(--primary)]">{perm.urdu}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewSubUserOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm"
                >
                  Save Sub-User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
