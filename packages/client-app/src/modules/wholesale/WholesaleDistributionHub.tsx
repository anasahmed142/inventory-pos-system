// packages/client-app/src/modules/wholesale/WholesaleDistributionHub.tsx
import React, { useState } from 'react';
import {
  Package,
  Truck,
  Users,
  ShoppingCart,
  ArrowRightLeft,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Phone,
  Printer,
  FileText,
  DollarSign,
  Layers,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Warehouse,
  Store,
  Clock,
  Check
} from 'lucide-react';
import {
  useTenantBrandingStore,
  useMasterDataStore,
  ProductRecord,
  VendorRecord,
  PurchaseOrderRecord,
  OrderRecord,
  KhataEntryRecord,
  ProductSearchCombobox,
  AccountSearchCombobox,
  UnifiedAccount
} from '@inventory/ui';

type WholesaleTab = 'products' | 'vendors' | 'sales_order' | 'purchase_order' | 'dispatch_tracking';

export const WholesaleDistributionHub: React.FC = () => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  // Master Data Store
  const allProducts = useMasterDataStore((s) => s.products);
  const allVendors = useMasterDataStore((s) => s.vendors || []);
  const allOrders = useMasterDataStore((s) => s.orders || []);
  const allPurchaseOrders = useMasterDataStore((s) => s.purchaseOrders || []);

  const addProduct = useMasterDataStore((s) => s.addProduct);
  const updateProduct = useMasterDataStore((s) => s.updateProduct);
  const transferStockLocation = useMasterDataStore((s) => s.transferStockLocation);
  const addVendor = useMasterDataStore((s) => s.addVendor);
  const addPurchaseOrder = useMasterDataStore((s) => s.addPurchaseOrder);
  const addOrder = useMasterDataStore((s) => s.addOrder);
  const updateDispatchStatus = useMasterDataStore((s) => s.updateDispatchStatus);
  const addKhataEntry = useMasterDataStore((s) => s.addKhataEntry);

  const products = allProducts.filter((p) => p.tenantId === activeTenantId || !p.tenantId);
  const vendors = allVendors.filter((v) => v.tenantId === activeTenantId || !v.tenantId);
  const suppliers = vendors.filter((v) => v.vendorType === 'supplier');
  const buyers = vendors.filter((v) => v.vendorType === 'buyer');
  const wholesaleOrders = allOrders.filter((o) => o.tenantId === activeTenantId || !o.tenantId);
  const purchaseOrders = allPurchaseOrders.filter((po) => po.tenantId === activeTenantId || !po.tenantId);

  const [activeTab, setActiveTab] = useState<WholesaleTab>('products');
  const [productSearch, setProductSearch] = useState('');
  const [vendorFilter, setVendorFilter] = useState<'all' | 'supplier' | 'buyer'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [isNewVendorOpen, setIsNewVendorOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferProd, setTransferProd] = useState<ProductRecord | null>(null);
  const [transferQty, setTransferQty] = useState<number>(10);
  const [transferDirection, setTransferDirection] = useState<'godown_to_shop' | 'shop_to_godown'>('godown_to_shop');

  // Printable Challan Modal
  const [printingOrder, setPrintingOrder] = useState<OrderRecord | null>(null);

  // Quick Purchase Trigger State (Pre-filled from low stock)
  const [quickPurchaseProduct, setQuickPurchaseProduct] = useState<ProductRecord | null>(null);

  // Sales Order Builder State
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(buyers[0]?.id || '');
  const [salesItems, setSalesItems] = useState<Array<{
    productId: string;
    productName: string;
    productUrduName: string;
    quantity: number;
    unitPrice: number;
    location: 'godown' | 'shop';
    availableStock: number;
  }>>([]);
  const [salesPaymentType, setSalesPaymentType] = useState<'cash' | 'bank' | 'udhaar'>('bank');
  const [salesVehicle, setSalesVehicle] = useState('LES-8842 (Mazda)');
  const [salesDriver, setSalesDriver] = useState('Muhammad Boota (0302-1122334)');

  // Purchase Order Builder State
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [poItems, setPoItems] = useState<Array<{
    productId: string;
    productName: string;
    productUrduName: string;
    quantity: number;
    costPrice: number;
    targetLocation: 'godown' | 'shop';
  }>>([]);
  const [poPaymentMethod, setPoPaymentMethod] = useState<'cash' | 'bank' | 'supplier_khata'>('bank');
  const [poNotes, setPoNotes] = useState('Seasonal restock order');

  // New Product Form State
  const [newProd, setNewProd] = useState<Partial<ProductRecord>>({
    name: '',
    urduName: '',
    category: 'Seeds & Agri',
    costPrice: 5000,
    wholesalePrice: 5500,
    retailPrice: 6000,
    godownStock: 50,
    shopStock: 10,
    minThreshold: 15,
    unit: 'Bag (50kg)'
  });

  // New Vendor Form State
  const [newVendor, setNewVendor] = useState<Partial<VendorRecord>>({
    name: '',
    urduName: '',
    phone: '',
    city: 'Lahore',
    vendorType: 'supplier',
    category: 'Seeds & Agri',
    balance: 0,
    creditLimit: 500000
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.urduName.includes(productSearch) ||
      p.barcode.includes(productSearch)
  );

  const lowStockProducts = products.filter((p) => {
    const total = (p.godownStock ?? p.currentStock) + (p.shopStock ?? 0);
    return total <= p.minThreshold;
  });

  const totalGodownStockBags = products.reduce((acc, p) => acc + (p.godownStock ?? p.currentStock), 0);
  const totalShopStockBags = products.reduce((acc, p) => acc + (p.shopStock ?? 0), 0);
  const totalInventoryValue = products.reduce(
    (acc, p) => acc + p.costPrice * ((p.godownStock ?? p.currentStock) + (p.shopStock ?? 0)),
    0
  );

  // 1. Stock Transfer Action
  const handleExecuteTransfer = () => {
    if (!transferProd || transferQty <= 0) return;
    const from = transferDirection === 'godown_to_shop' ? 'godown' : 'shop';
    const to = transferDirection === 'godown_to_shop' ? 'shop' : 'godown';

    transferStockLocation(transferProd.id, from, to, transferQty);
    showToast(`Transferred ${transferQty} ${transferProd.unit} of "${transferProd.name}" from ${from.toUpperCase()} to ${to.toUpperCase()}!`);
    setIsTransferModalOpen(false);
  };

  // 2. Quick Reorder Trigger from Low Stock Alert
  const handleTriggerReorder = (prod: ProductRecord) => {
    setQuickPurchaseProduct(prod);
    const supplier = suppliers.find((s) => s.id === prod.preferredSupplierId) || suppliers[0];
    if (supplier) setSelectedSupplierId(supplier.id);

    setPoItems([
      {
        productId: prod.id,
        productName: prod.name,
        productUrduName: prod.urduName,
        quantity: prod.minThreshold * 2 || 50,
        costPrice: prod.costPrice,
        targetLocation: 'godown'
      }
    ]);
    setActiveTab('purchase_order');
  };

  // 3. Save Wholesale Sales Order (Deducts stock & creates Challan)
  const handleCreateSalesOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesItems.length === 0) {
      alert('Please add at least one product item to the order.');
      return;
    }

    const buyer = buyers.find((b) => b.id === selectedBuyerId) || buyers[0];
    const totalAmount = salesItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
    const orderId = `WHL-${Date.now().toString(36).toUpperCase()}`;
    const challanNo = `CHL-${Math.floor(10000 + Math.random() * 90000)}`;

    const order: OrderRecord = {
      id: orderId,
      tenantId: activeTenantId,
      invoiceNo: `INV-${orderId}`,
      partyId: buyer?.id,
      partyName: buyer?.name || 'Wholesale Buyer',
      partyType: 'wholesale_buyer',
      customerName: buyer?.name || 'Wholesale Buyer',
      customerPhone: buyer?.phone || '0300-0000000',
      orderType: 'wholesale_dist',
      itemCount: salesItems.reduce((acc, it) => acc + it.quantity, 0),
      totalAmount,
      paidAmount: salesPaymentType === 'udhaar' ? 0 : totalAmount,
      remainingDues: salesPaymentType === 'udhaar' ? totalAmount : 0,
      paymentMethod: salesPaymentType === 'cash' ? 'Cash' : salesPaymentType === 'bank' ? 'Bank Transfer (1Link)' : 'Udhaar Khata',
      dispatchStatus: 'in_godown',
      dispatchLocation: salesItems[0]?.location || 'godown',
      deliveryChallanNo: challanNo,
      vehicleNumber: salesVehicle,
      driverName: salesDriver.split('(')[0].trim(),
      driverPhone: salesDriver.includes('(') ? salesDriver.split('(')[1].replace(')', '') : '',
      date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      items: salesItems.map((it, idx) => ({
        id: `si-${idx + 1}`,
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.quantity * it.unitPrice,
        location: it.location
      }))
    };

    addOrder(order);

    // If Udhaar, add Khata entry
    if (salesPaymentType === 'udhaar' && buyer) {
      addKhataEntry({
        id: `ke-sale-${Date.now().toString(36)}`,
        tenantId: activeTenantId,
        partyId: buyer.id,
        partyName: buyer.name,
        entryType: 'naam',
        amount: totalAmount,
        description: `Wholesale Order #${orderId} (Challan: ${challanNo})`,
        urduDescription: `ہول سیل بل #${orderId} (ڈلیوری چالان: ${challanNo})`,
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
    }

    setPrintingOrder(order);
    setSalesItems([]);
    showToast(`Wholesale Order #${orderId} created! Stock deducted & Challan #${challanNo} ready.`);
    setActiveTab('dispatch_tracking');
  };

  // 4. Save Purchase Order (Adds stock into Godown / Shop)
  const handleSavePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0) {
      alert('Please add at least one product item to restock.');
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];
    const totalAmount = poItems.reduce((acc, it) => acc + it.quantity * it.costPrice, 0);
    const poNumber = `PO-${Date.now().toString(36).toUpperCase()}`;

    const po: PurchaseOrderRecord = {
      id: `po-${Date.now().toString(36)}`,
      tenantId: activeTenantId,
      orderNumber: poNumber,
      supplierId: supplier?.id || 'vnd-sup-default',
      supplierName: supplier?.name || 'Supplier Vendor',
      supplierUrduName: supplier?.urduName,
      supplierPhone: supplier?.phone,
      items: poItems.map((it) => ({
        ...it,
        total: it.quantity * it.costPrice
      })),
      totalAmount,
      paidAmount: poPaymentMethod === 'supplier_khata' ? 0 : totalAmount,
      paymentMethod: poPaymentMethod === 'cash' ? 'Cash' : poPaymentMethod === 'bank' ? 'Bank Transfer' : 'Supplier Credit Khata',
      status: 'received', // Auto-receive and increase stock immediately
      targetLocation: poItems[0]?.targetLocation || 'godown',
      date: `Today, ${new Date().toLocaleDateString()}`,
      notes: poNotes
    };

    addPurchaseOrder(po);

    // If Credit Khata, post Jama to supplier
    if (poPaymentMethod === 'supplier_khata' && supplier) {
      addKhataEntry({
        id: `ke-po-${Date.now().toString(36)}`,
        tenantId: activeTenantId,
        partyId: supplier.id,
        partyName: supplier.name,
        entryType: 'jama',
        amount: totalAmount,
        description: `Purchase Inward Order #${poNumber}`,
        urduDescription: `خریداری مال بل #${poNumber}`,
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      });
    }

    setPoItems([]);
    showToast(`Purchase Order #${poNumber} received! Stock added to ${po.targetLocation.toUpperCase()} & Supplier Khata updated.`);
    setActiveTab('products');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-canvas)] text-[var(--text-main)] font-sans overflow-y-auto pb-16 md:pb-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-3 text-xs md:text-sm font-bold animate-bounce">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Wholesale Hub Header */}
      <div className="bg-white dark:bg-[#1e1e2d] border-b border-slate-200/80 dark:border-[#2b2b40] px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-subtle)] border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
              <Truck size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
                  Wholesale, Seed & Commodity Distribution Hub
                </h1>
                <span className="bg-[var(--primary-subtle)] text-[var(--primary)] text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  B2B Trade Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu mt-0.5">
                تھوک خریدار و سپلائرز، گودام و دکان اسٹاک، ڈلیوری چالان اور آرڈر فالو اپ
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center space-x-2.5">
            <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] px-3.5 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">گودام اسٹاک (Godown)</div>
              <div className="text-sm md:text-base font-mono font-black text-[var(--primary)]">{totalGodownStockBags.toLocaleString()} Bags</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] px-3.5 py-1.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">دکان اسٹاک (Shop)</div>
              <div className="text-sm md:text-base font-mono font-black text-emerald-600 dark:text-emerald-400">{totalShopStockBags.toLocaleString()} Bags</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] px-3.5 py-1.5 rounded-xl text-center hidden lg:block">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">اسٹاک مالیت (Value)</div>
              <div className="text-sm md:text-base font-mono font-black text-slate-900 dark:text-white">Rs. {totalInventoryValue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* 5-Step Layman Workflow Tabs */}
        <div className="max-w-7xl mx-auto flex items-center space-x-2 mt-4 pt-3 border-t border-slate-100 dark:border-[#2b2b40] overflow-x-auto">
          {[
            { id: 'products', labelEn: '1. Products & Stock', labelUr: 'پروڈکٹس و گودام اسٹاک', icon: <Package size={15} /> },
            { id: 'vendors', labelEn: '2. Vendors & Partners', labelUr: 'سپلائرز و خریدار پارٹیز', icon: <Users size={15} /> },
            { id: 'sales_order', labelEn: '3. Sell to Buyer (Sale)', labelUr: 'خریدار کو فروخت و بل', icon: <ShoppingCart size={15} /> },
            { id: 'purchase_order', labelEn: '4. Buy from Supplier', labelUr: 'سپلائر سے خریداری', icon: <ArrowDownLeft size={15} /> },
            { id: 'dispatch_tracking', labelEn: '5. Dispatch & Follow-up', labelUr: 'آرڈرز و ڈلیوری فالو اپ', icon: <Truck size={15} /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as WholesaleTab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--primary)] text-white shadow-sm'
                    : 'bg-slate-50 dark:bg-[#151521] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#2b2b40]'
                }`}
              >
                {tab.icon}
                <span>{tab.labelEn}</span>
                <span className="text-[11px] font-urdu opacity-80">({tab.labelUr})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Routed Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full space-y-6">

        {/* ========================================================================= */}
        {/* TAB 1: PRODUCTS & GODOWN / SHOP STOCK */}
        {/* ========================================================================= */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Low Stock Warning Banner with 1-Click Reorder Action */}
            {lowStockProducts.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Low Stock Alert: {lowStockProducts.length} Product(s) Running Out of Stock!
                    </div>
                    <div className="text-xs text-amber-700 dark:text-amber-400 font-urdu">
                      بیج یا پروڈکٹس کا اسٹاک کم ہو گیا ہے۔ سپلائر کو نیا خریداری آرڈر بھیجیں۔
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {lowStockProducts.map((lp) => (
                    <button
                      key={lp.id}
                      onClick={() => handleTriggerReorder(lp)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition-all"
                    >
                      <span>Reorder {lp.name.split(' ')[0]}</span>
                      <span className="text-[10px] font-urdu">(خریدیں)</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Catalog Action Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search Seed, Variety, Fertilizer, Barcode..."
                  className="w-full bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)] shadow-sm"
                />
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setIsNewProductOpen(true)}
                  className="px-4 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2 transition-all"
                >
                  <Plus size={16} />
                  <span>+ Add New Product / Seed Variety</span>
                </button>
              </div>
            </div>

            {/* Product & Stock Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p) => {
                const godown = p.godownStock ?? p.currentStock;
                const shop = p.shopStock ?? 0;
                const total = godown + shop;
                const isLow = total <= p.minThreshold;

                return (
                  <div
                    key={p.id}
                    className={`bg-white dark:bg-[#1e1e2d] border rounded-2xl p-5 shadow-sm space-y-4 transition-all ${
                      isLow ? 'border-amber-400/60 dark:border-amber-500/40' : 'border-slate-200/80 dark:border-[#2b2b40]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          {p.category} • [{p.barcode}]
                        </span>
                        <h3 className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white mt-0.5">
                          {p.name}
                        </h3>
                        <p className="text-xs text-[var(--primary)] font-urdu font-bold mt-0.5">{p.urduName}</p>
                      </div>

                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isLow ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </div>

                    {/* Stock Locations Matrix */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-[#151521] p-3 rounded-xl border border-slate-200 dark:border-[#2b2b40] text-center font-mono">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">گودام (Godown)</div>
                        <div className="text-sm font-black text-[var(--primary)]">{godown}</div>
                        <div className="text-[9px] text-slate-400">{p.unit}</div>
                      </div>
                      <div className="border-x border-slate-200 dark:border-[#2b2b40]">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">دکان (Shop)</div>
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">{shop}</div>
                        <div className="text-[9px] text-slate-400">{p.unit}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">کل (Total)</div>
                        <div className={`text-sm font-black ${isLow ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                          {total}
                        </div>
                        <div className="text-[9px] text-slate-400">Min: {p.minThreshold}</div>
                      </div>
                    </div>

                    {/* Pricing Tiers */}
                    <div className="flex justify-between items-center text-xs font-mono pt-1">
                      <div>
                        <span className="text-slate-400 text-[10px] block">خرید قیمت (Cost):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">Rs. {p.costPrice.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[var(--primary)] text-[10px] font-bold block">تھوک ریٹ (Wholesale):</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">Rs. {p.wholesalePrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Action Buttons: Stock Transfer & Buy Reorder */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-[#2b2b40]">
                      <button
                        onClick={() => {
                          setTransferProd(p);
                          setTransferQty(10);
                          setIsTransferModalOpen(true);
                        }}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-[#151521] hover:bg-slate-200 dark:hover:bg-[#252536] text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <ArrowRightLeft size={13} />
                        <span>Move Stock (ٹرانسفر)</span>
                      </button>

                      <button
                        onClick={() => handleTriggerReorder(p)}
                        className="p-2 rounded-xl bg-[var(--primary-subtle)] hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <ArrowDownLeft size={13} />
                        <span>Buy Restock (خریدیں)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VENDORS & PARTNERS (SUPPLIERS & BUYERS) */}
        {/* ========================================================================= */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center bg-white dark:bg-[#1e1e2d] p-1 rounded-xl border border-slate-200 dark:border-[#2b2b40] shadow-sm">
                {[
                  { id: 'all', label: 'All Partners (تمام پارٹیز)' },
                  { id: 'supplier', label: 'Suppliers / مال خریدنے کے ذرائع (3)' },
                  { id: 'buyer', label: 'Buyers / تھوک خریدار (3)' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setVendorFilter(f.id as any)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      vendorFilter === f.id
                        ? 'bg-[var(--primary)] text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsNewVendorOpen(true)}
                className="px-4 py-2.5 bg-[var(--primary)] hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-2 transition-all"
              >
                <Plus size={16} />
                <span>+ Register New Supplier / Buyer Partner</span>
              </button>
            </div>

            {/* Vendors Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {vendors
                .filter((v) => (vendorFilter === 'all' ? true : v.vendorType === vendorFilter))
                .map((v) => {
                  const isSupplier = v.vendorType === 'supplier';
                  return (
                    <div
                      key={v.id}
                      className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                              isSupplier
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {isSupplier ? '🏢 Supplier (جہاں سے خریدتے ہیں)' : '🤝 Buyer (جس کو بیچتے ہیں)'}
                          </span>
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1.5">{v.name}</h3>
                          <p className="text-xs text-[var(--primary)] font-urdu font-bold mt-0.5">{v.urduName}</p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 font-mono">
                        <div className="flex items-center space-x-2">
                          <Phone size={13} className="text-slate-400" />
                          <span>{v.phone}</span>
                        </div>
                        <div>📍 {v.address || v.city}</div>
                        {v.ntn && <div>📜 NTN: {v.ntn}</div>}
                      </div>

                      <div className="bg-slate-50 dark:bg-[#151521] p-3 rounded-xl border border-slate-200 dark:border-[#2b2b40] flex justify-between items-center font-mono">
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {isSupplier ? 'کمپنی کے ذمہ واجب الاداء:' : 'گاہک کے ذمہ واجب الوصول:'}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            v.balance > 0 ? (isSupplier ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400') : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          Rs. {v.balance.toLocaleString()}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-[#2b2b40]">
                        {isSupplier ? (
                          <button
                            onClick={() => {
                              setSelectedSupplierId(v.id);
                              setActiveTab('purchase_order');
                            }}
                            className="w-full py-2 rounded-xl bg-indigo-50 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                          >
                            <ArrowDownLeft size={14} />
                            <span>Create Restock Purchase Order (خریداری بل بنائیں)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedBuyerId(v.id);
                              setActiveTab('sales_order');
                            }}
                            className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                          >
                            <ShoppingCart size={14} />
                            <span>Create Wholesale Sales Order (تھوک مال فروخت کریں)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: WHOLESALE SALES ORDER (SELL TO BUYER) */}
        {/* ========================================================================= */}
        {activeTab === 'sales_order' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Order Details & Product Picker */}
            <div className="lg:col-span-2 space-y-6">
              {/* Buyer Vendor Selection Card */}
              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Users size={16} className="text-[var(--primary)]" />
                    <span>Select Buyer Partner / خریدار بیوپاری منتخب کریں</span>
                  </h2>
                  <span className="text-xs text-[var(--primary)] font-urdu font-bold">تھوک گاہک</span>
                </div>

                <AccountSearchCombobox
                  filterType="customer_buyer"
                  tenantId={activeTenantId}
                  selectedAccountId={selectedBuyerId}
                  onSelectAccount={(acc) => setSelectedBuyerId(acc.id)}
                  placeholder="Search buyer vendor or customer account by name, Urdu, phone..."
                />
              </div>

              {/* Add Items to Wholesale Sale */}
              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Package size={16} className="text-[var(--primary)]" />
                    <span>Search & Add Products to Wholesale Order (اسٹاک سے مال شامل کریں)</span>
                  </h3>
                </div>

                <ProductSearchCombobox
                  products={products}
                  priceType="wholesale"
                  onSelectProduct={(p) => {
                    const godown = p.godownStock ?? p.currentStock;
                    const existing = salesItems.find((it) => it.productId === p.id && it.location === 'godown');
                    if (existing) {
                      setSalesItems(
                        salesItems.map((it) =>
                          it.productId === p.id && it.location === 'godown'
                            ? { ...it, quantity: it.quantity + 1 }
                            : it
                        )
                      );
                    } else {
                      setSalesItems([
                        ...salesItems,
                        {
                          productId: p.id,
                          productName: p.name,
                          productUrduName: p.urduName,
                          quantity: 1,
                          unitPrice: p.wholesalePrice || p.retailPrice,
                          location: 'godown',
                          availableStock: godown
                        }
                      ]);
                    }
                  }}
                  placeholder="Type product name (e.g. Basmati Rice, Wheat Seed) or scan barcode..."
                />
              </div>

              {/* Order Cart Items Table */}
              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Selected Order Lines ({salesItems.length})</span>
                  <span className="text-xs text-slate-400 font-mono">Challan Items</span>
                </h3>

                {salesItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No items selected yet. Click "+ From Godown" or "+ From Shop" above to add products.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-[#2b2b40]">
                    {salesItems.map((it, idx) => (
                      <div key={idx} className="py-3 flex flex-wrap justify-between items-center gap-2 text-xs">
                        <div className="flex-1 min-w-[200px]">
                          <div className="font-bold text-slate-900 dark:text-white">{it.productName}</div>
                          <div className="text-[11px] text-[var(--primary)] font-urdu">{it.productUrduName}</div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300">
                            Source: {it.location.toUpperCase()}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400 text-[11px]">Qty:</span>
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) => {
                                const q = Math.max(1, parseInt(e.target.value) || 1);
                                setSalesItems(salesItems.map((item, i) => (i === idx ? { ...item, quantity: q } : item)));
                              }}
                              className="w-16 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg px-2 py-1 text-center font-mono font-bold text-xs"
                            />
                          </div>

                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400 text-[11px]">Rate:</span>
                            <input
                              type="number"
                              value={it.unitPrice}
                              onChange={(e) => {
                                const r = parseFloat(e.target.value) || 0;
                                setSalesItems(salesItems.map((item, i) => (i === idx ? { ...item, unitPrice: r } : item)));
                              }}
                              className="w-24 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg px-2 py-1 font-mono font-bold text-xs text-right"
                            />
                          </div>

                          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 w-24 text-right">
                            Rs. {(it.quantity * it.unitPrice).toLocaleString()}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSalesItems(salesItems.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Wholesale Checkout & Gate Pass Parameters */}
            <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-6 shadow-sm space-y-5 h-fit">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#2b2b40] pb-3">
                Order Billing & Delivery Challan
              </h2>

              {/* Total Summary */}
              <div className="bg-slate-50 dark:bg-[#151521] p-4 rounded-2xl border border-slate-200 dark:border-[#2b2b40] text-right font-mono">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">کل بل (Net Amount):</span>
                <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                  Rs. {salesItems.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0).toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  Total Bags/Items: {salesItems.reduce((acc, it) => acc + it.quantity, 0)}
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1.5">
                  Payment Collection Mode / طریقہ ادائیگی
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bank', label: '1Link Bank', urdu: 'بینک ٹرانسفر' },
                    { id: 'cash', label: 'Cash Counter', urdu: 'نقد رقم' },
                    { id: 'udhaar', label: 'Buyer Khata', urdu: 'ادھار کھاتہ' }
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setSalesPaymentType(pm.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs transition-all ${
                        salesPaymentType === pm.id
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div>{pm.label}</div>
                      <div className="text-[10px] font-urdu opacity-80">{pm.urdu}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Gate Pass / Logistics Follow-up */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-[#2b2b40]">
                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Vehicle Number / گاڑی نمبر (Gate Pass)
                  </label>
                  <input
                    type="text"
                    value={salesVehicle}
                    onChange={(e) => setSalesVehicle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                    Driver Name & Phone / ڈرائیور رابطہ
                  </label>
                  <input
                    type="text"
                    value={salesDriver}
                    onChange={(e) => setSalesDriver(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>

              {/* Dispatch Action Button */}
              <button
                type="button"
                onClick={handleCreateSalesOrder}
                disabled={salesItems.length === 0}
                className="w-full py-3 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-white rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <Truck size={18} />
                <span>Save Wholesale Order & Print Challan</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: PURCHASE RESTOCK ORDER (BUY FROM SUPPLIER) */}
        {/* ========================================================================= */}
        {activeTab === 'purchase_order' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Supplier Selection */}
              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Building2 size={16} className="text-indigo-600" />
                    <span>Select Supplier Partner / سپلائر و بیج کمپنی</span>
                  </h2>
                  <span className="text-xs text-indigo-600 font-urdu font-bold">خریداری سپلائر</span>
                </div>

                <AccountSearchCombobox
                  filterType="supplier"
                  tenantId={activeTenantId}
                  selectedAccountId={selectedSupplierId}
                  onSelectAccount={(acc) => setSelectedSupplierId(acc.id)}
                  placeholder="Search supplier or agricultural company by name, Urdu, phone..."
                />
              </div>

              {/* Restock Items List Builder */}
              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                    <Package size={16} className="text-indigo-600" />
                    <span>Search & Add Products to Restock Order (اسٹاک خریداری فہرست)</span>
                  </h3>
                </div>

                <ProductSearchCombobox
                  products={products}
                  priceType="cost"
                  onSelectProduct={(p) => {
                    const exists = poItems.find((it) => it.productId === p.id);
                    if (exists) {
                      setPoItems(
                        poItems.map((it) => (it.productId === p.id ? { ...it, quantity: it.quantity + 1 } : it))
                      );
                    } else {
                      setPoItems([
                        ...poItems,
                        {
                          productId: p.id,
                          productName: p.name,
                          productUrduName: p.urduName,
                          quantity: 1,
                          costPrice: p.costPrice || Math.round((p.wholesalePrice || p.retailPrice) * 0.85),
                          targetLocation: 'godown'
                        }
                      ]);
                    }
                  }}
                  placeholder="Type product name to restock or scan barcode..."
                />
              </div>

              {/* PO Lines Table */}
              <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Purchase Inward Items ({poItems.length})</span>
                  <span className="text-xs text-slate-400 font-mono">Stock Inward</span>
                </h3>

                {poItems.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No items added to purchase order yet. Click "+ Add" on any product above.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-[#2b2b40]">
                    {poItems.map((it, idx) => (
                      <div key={idx} className="py-3 flex flex-wrap justify-between items-center gap-2 text-xs">
                        <div className="flex-1 min-w-[180px]">
                          <div className="font-bold text-slate-900 dark:text-white">{it.productName}</div>
                          <div className="text-[11px] text-indigo-600 font-urdu">{it.productUrduName}</div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400 text-[11px]">Qty:</span>
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) => {
                                const q = Math.max(1, parseInt(e.target.value) || 1);
                                setPoItems(poItems.map((item, i) => (i === idx ? { ...item, quantity: q } : item)));
                              }}
                              className="w-16 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg px-2 py-1 text-center font-mono font-bold text-xs"
                            />
                          </div>

                          <div className="flex items-center space-x-1">
                            <span className="text-slate-400 text-[11px]">Cost:</span>
                            <input
                              type="number"
                              value={it.costPrice}
                              onChange={(e) => {
                                const c = parseFloat(e.target.value) || 0;
                                setPoItems(poItems.map((item, i) => (i === idx ? { ...item, costPrice: c } : item)));
                              }}
                              className="w-24 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg px-2 py-1 font-mono font-bold text-xs text-right"
                            />
                          </div>

                          <select
                            value={it.targetLocation}
                            onChange={(e) => {
                              setPoItems(
                                poItems.map((item, i) =>
                                  i === idx ? { ...item, targetLocation: e.target.value as any } : item
                                )
                              );
                            }}
                            className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg px-2 py-1 text-xs font-mono"
                          >
                            <option value="godown">Store in Godown</option>
                            <option value="shop">Store in Shop</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => setPoItems(poItems.filter((_, i) => i !== idx))}
                            className="text-rose-500 hover:text-rose-700 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: PO Checkout & Auto-Stock Receipt */}
            <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-6 shadow-sm space-y-5 h-fit">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-[#2b2b40] pb-3">
                Purchase Order Inward & Stock
              </h2>

              <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900 text-right font-mono">
                <span className="text-xs text-indigo-700 dark:text-indigo-300 uppercase">خریداری کل لاگت:</span>
                <div className="text-3xl font-black text-indigo-950 dark:text-indigo-100 mt-1">
                  Rs. {poItems.reduce((acc, it) => acc + it.quantity * it.costPrice, 0).toLocaleString()}
                </div>
                <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                  Total Inward Bags: {poItems.reduce((acc, it) => acc + it.quantity, 0)}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1.5">
                  Payment to Supplier / ادائیگی کا طریقہ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bank', label: '1Link Bank' },
                    { id: 'cash', label: 'Cash Paid' },
                    { id: 'supplier_khata', label: 'Supplier Khata' }
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPoPaymentMethod(pm.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs transition-all ${
                        poPaymentMethod === pm.id
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Private Order Notes / ریمارکس
                </label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={handleSavePurchaseOrder}
                disabled={poItems.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <ArrowDownLeft size={18} />
                <span>Receive Order & Auto-Add to Stock</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DISPATCH & ORDER FOLLOW-UP */}
        {/* ========================================================================= */}
        {activeTab === 'dispatch_tracking' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Wholesale Orders & Dispatch Follow-Up (آرڈرز و ڈلیوری فالو اپ)
                </h2>
                <p className="text-xs text-slate-500 font-urdu mt-0.5">
                  معلوم کریں کہ کون سا آرڈر گودام میں ہے، دکان پر ہے، یا گاڑی میں خریدار کو بھیج دیا گیا ہے
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--primary)] bg-[var(--primary-subtle)] px-3 py-1 rounded-full">
                Total Orders: {wholesaleOrders.length}
              </span>
            </div>

            {/* Orders List with Status Advancement */}
            <div className="space-y-4">
              {wholesaleOrders.map((ord) => {
                const status = ord.dispatchStatus || 'pending';

                return (
                  <div
                    key={ord.id}
                    className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center font-mono font-bold text-sm">
                          📦
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">{ord.customerName}</span>
                            <span className="text-xs font-mono text-slate-400">[{ord.invoiceNo || ord.id}]</span>
                            {ord.deliveryChallanNo && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300">
                                Challan: {ord.deliveryChallanNo}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            {ord.date} • Phone: {ord.customerPhone}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-right font-mono">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">بل رقم (Amount):</span>
                          <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                            Rs. {ord.totalAmount.toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => setPrintingOrder(ord)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-[#151521] hover:bg-slate-200 dark:hover:bg-[#252536] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all"
                        >
                          <Printer size={14} />
                          <span>Print Challan / Gate Pass</span>
                        </button>
                      </div>
                    </div>

                    {/* Order Line Items */}
                    {ord.items && ord.items.length > 0 && (
                      <div className="bg-slate-50 dark:bg-[#151521] p-3 rounded-xl border border-slate-200 dark:border-[#2b2b40] text-xs font-mono space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                            <span>• {it.productName} (x{it.quantity})</span>
                            <span className="font-bold">Rs. {it.total.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Logistics Tracking Badges & 1-Click Status Stepper */}
                    <div className="pt-3 border-t border-slate-100 dark:border-[#2b2b40] flex flex-wrap justify-between items-center gap-3">
                      <div className="text-xs text-slate-500 font-mono">
                        {ord.vehicleNumber && <span>🚛 Vehicle: <strong>{ord.vehicleNumber}</strong></span>}
                        {ord.driverName && <span className="ml-3">👤 Driver: <strong>{ord.driverName}</strong></span>}
                      </div>

                      {/* Status Stepper Buttons */}
                      <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-[#151521] p-1 rounded-xl border border-slate-200 dark:border-[#2b2b40]">
                        {[
                          { id: 'pending', label: 'Pending (زیرِ کارروائی)' },
                          { id: 'in_godown', label: 'In Godown (گودام)' },
                          { id: 'in_shop', label: 'In Shop (دکان)' },
                          { id: 'dispatched', label: 'Dispatched (روانہ)' },
                          { id: 'delivered', label: 'Delivered (وصول)' }
                        ].map((st) => {
                          const isCurrent = status === st.id;
                          return (
                            <button
                              key={st.id}
                              onClick={() => {
                                updateDispatchStatus(ord.id, st.id as any);
                                showToast(`Order status updated to: ${st.label}`);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                isCurrent
                                  ? 'bg-[var(--primary)] text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {st.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: STOCK TRANSFER (GODOWN ➔ SHOP) */}
      {/* ========================================================================= */}
      {isTransferModalOpen && transferProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#2b2b40] pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <ArrowRightLeft size={18} className="text-[var(--primary)]" />
                <span>Transfer Stock Location (اسٹاک منتقلی)</span>
              </h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">{transferProd.name}</div>
              <div className="text-xs text-[var(--primary)] font-urdu font-bold mt-0.5">{transferProd.urduName}</div>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#151521] p-2.5 rounded-xl border border-slate-200 dark:border-[#2b2b40] mt-3 text-center text-xs font-mono">
                <div>Godown: <strong>{transferProd.godownStock ?? transferProd.currentStock} {transferProd.unit}</strong></div>
                <div>Shop Counter: <strong>{transferProd.shopStock ?? 0} {transferProd.unit}</strong></div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Transfer Direction / منتقلی کی سمت
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransferDirection('godown_to_shop')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      transferDirection === 'godown_to_shop'
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40]'
                    }`}
                  >
                    🏢 Godown ➔ 🏪 Shop
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferDirection('shop_to_godown')}
                    className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                      transferDirection === 'shop_to_godown'
                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                        : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40]'
                    }`}
                  >
                    🏪 Shop ➔ 🏢 Godown
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Transfer Quantity / تعداد ({transferProd.unit})
                </label>
                <input
                  type="number"
                  min={1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3.5 py-2 text-xs font-mono font-bold outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-[#2b2b40]">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-500 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTransfer}
                className="px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-extrabold shadow-sm hover:opacity-90"
              >
                Execute Stock Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD NEW PRODUCT / SEED VARIETY */}
      {/* ========================================================================= */}
      {isNewProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#2b2b40] pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Package size={18} className="text-[var(--primary)]" />
                <span>Add Product / Seed Variety (نیا بیج و پروڈکٹ)</span>
              </h3>
              <button onClick={() => setIsNewProductOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Product Name (English)</label>
                <input
                  type="text"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Hybrid Corn Seed Pioneer 30Y87"
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Product Name (Urdu / اردو نام)</label>
                <input
                  type="text"
                  value={newProd.urduName}
                  onChange={(e) => setNewProd({ ...newProd, urduName: e.target.value })}
                  placeholder="مثال: ہائبرڈ مکئی کا بیج پائنیر 30Y87"
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-urdu text-right outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <input
                  type="text"
                  value={newProd.category}
                  onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Unit (بوری / من / کاٹن)</label>
                <input
                  type="text"
                  value={newProd.unit}
                  onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Cost Price (خرید قیمت)</label>
                <input
                  type="number"
                  value={newProd.costPrice}
                  onChange={(e) => setNewProd({ ...newProd, costPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--primary)] block mb-1">Wholesale Rate (تھوک قیمت)</label>
                <input
                  type="number"
                  value={newProd.wholesalePrice}
                  onChange={(e) => setNewProd({ ...newProd, wholesalePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-mono font-bold outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Initial Godown Stock (گودام)</label>
                <input
                  type="number"
                  value={newProd.godownStock}
                  onChange={(e) => setNewProd({ ...newProd, godownStock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Initial Shop Stock (دکان)</label>
                <input
                  type="number"
                  value={newProd.shopStock}
                  onChange={(e) => setNewProd({ ...newProd, shopStock: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-mono outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-[#2b2b40]">
              <button
                type="button"
                onClick={() => setIsNewProductOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newProd.name) return;
                  addProduct({
                    id: `p-${Date.now().toString(36)}`,
                    tenantId: activeTenantId,
                    name: newProd.name,
                    urduName: newProd.urduName || newProd.name,
                    category: newProd.category || 'Seeds',
                    barcode: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
                    costPrice: Number(newProd.costPrice) || 0,
                    retailPrice: Number(newProd.retailPrice) || 0,
                    wholesalePrice: Number(newProd.wholesalePrice) || 0,
                    currentStock: (Number(newProd.godownStock) || 0) + (Number(newProd.shopStock) || 0),
                    godownStock: Number(newProd.godownStock) || 0,
                    shopStock: Number(newProd.shopStock) || 0,
                    minThreshold: Number(newProd.minThreshold) || 10,
                    unit: newProd.unit || 'Bag'
                  });
                  setIsNewProductOpen(false);
                  showToast(`Product "${newProd.name}" saved!`);
                }}
                className="px-5 py-2 bg-[var(--primary)] text-white text-xs font-extrabold rounded-xl shadow-sm hover:opacity-90"
              >
                Save Product & Initialize Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGISTER NEW VENDOR / PARTNER */}
      {/* ========================================================================= */}
      {isNewVendorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#2b2b40] pb-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Users size={18} className="text-[var(--primary)]" />
                <span>Register Partner (نیا سپلائر یا خریدار)</span>
              </h3>
              <button onClick={() => setIsNewVendorOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Partner Type / پارٹنر کی قسم</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewVendor({ ...newVendor, vendorType: 'supplier' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      newVendor.vendorType === 'supplier'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40]'
                    }`}
                  >
                    🏢 Supplier (جہاں سے خریدتے ہیں)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewVendor({ ...newVendor, vendorType: 'buyer' })}
                    className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                      newVendor.vendorType === 'buyer'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-[#151521] border-slate-200 dark:border-[#2b2b40]'
                    }`}
                  >
                    🤝 Buyer (جس کو مال بیچتے ہیں)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Partner Name (English)</label>
                <input
                  type="text"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                  placeholder="e.g. Sahiwal Agri Seed Dealers"
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Urdu Name (اردو نام)</label>
                <input
                  type="text"
                  value={newVendor.urduName}
                  onChange={(e) => setNewVendor({ ...newVendor, urduName: e.target.value })}
                  placeholder="مثال: ساہیوال ایگری سیڈ ڈیلرز"
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-urdu text-right outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 font-mono outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">City</label>
                  <input
                    type="text"
                    value={newVendor.city}
                    onChange={(e) => setNewVendor({ ...newVendor, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-[#2b2b40]">
              <button
                type="button"
                onClick={() => setIsNewVendorOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newVendor.name) return;
                  addVendor({
                    id: `vnd-${Date.now().toString(36)}`,
                    tenantId: activeTenantId,
                    name: newVendor.name,
                    urduName: newVendor.urduName || newVendor.name,
                    phone: newVendor.phone || '0300-0000000',
                    city: newVendor.city || 'Lahore',
                    vendorType: newVendor.vendorType || 'buyer',
                    category: newVendor.category || 'Agri',
                    balance: 0,
                    creditLimit: 500000,
                    lastOrderDate: 'New'
                  });
                  setIsNewVendorOpen(false);
                  showToast(`Partner "${newVendor.name}" registered!`);
                }}
                className="px-5 py-2 bg-[var(--primary)] text-white text-xs font-extrabold rounded-xl shadow-sm hover:opacity-90"
              >
                Save Partner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRINTABLE WHOLESALE GATE PASS & DELIVERY CHALLAN */}
      {/* ========================================================================= */}
      {printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex justify-between items-center border-b pb-3 text-sans">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                <FileText size={18} className="text-blue-600" />
                <span>Wholesale Gate Pass & Delivery Challan (ڈلیوری چالان)</span>
              </h3>
              <button onClick={() => setPrintingOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {/* Printable Thermal/A5 Format */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="text-center border-b pb-2">
                <div className="font-extrabold text-base">{profile?.name}</div>
                <div className="text-xs font-urdu">{profile?.urduName}</div>
                <div className="text-[10px] text-slate-500">NTN: {profile?.ntnStrn || '3201456-7'} • Phone: {profile?.phone}</div>
                <div className="text-[11px] font-bold text-blue-600 mt-1">WHOLESALE DISPATCH & GATE PASS</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>Challan No: <strong>{printingOrder.deliveryChallanNo || 'CHL-001'}</strong></div>
                <div className="text-right">Date: <strong>{printingOrder.date}</strong></div>
                <div>Buyer: <strong>{printingOrder.customerName}</strong></div>
                <div className="text-right">Vehicle: <strong>{printingOrder.vehicleNumber || 'LES-9921'}</strong></div>
                <div>Driver: <strong>{printingOrder.driverName || 'Muhammad Boota'}</strong></div>
                <div className="text-right">Payment: <strong>{printingOrder.paymentMethod}</strong></div>
              </div>

              <table className="w-full text-left border-collapse text-[11px] mt-2">
                <thead>
                  <tr className="border-b border-t bg-slate-200/60">
                    <th className="py-1">Item / Variety</th>
                    <th className="py-1 text-center">Qty</th>
                    <th className="py-1 text-right">Rate</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {printingOrder.items?.map((it, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="py-1">{it.productName}</td>
                      <td className="py-1 text-center font-bold">{it.quantity}</td>
                      <td className="py-1 text-right">Rs. {it.unitPrice}</td>
                      <td className="py-1 text-right font-bold">Rs. {it.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right pt-2 text-sm font-black border-t">
                Total Net Amount: Rs. {printingOrder.totalAmount.toLocaleString()}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 text-[10px] text-center border-t text-slate-500">
                <div className="border-t border-dashed pt-1">Warehouse Incharge Signature</div>
                <div className="border-t border-dashed pt-1">Driver / Receiver Signature</div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-700 flex items-center space-x-2"
              >
                <Printer size={14} />
                <span>Print Gate Pass (پرنٹ چالان)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
