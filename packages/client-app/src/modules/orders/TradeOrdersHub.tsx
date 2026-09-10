// packages/client-app/src/modules/orders/TradeOrdersHub.tsx
import React, { useState } from 'react';
import {
  ShoppingCart,
  Truck,
  Package,
  Plus,
  Trash2,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Store,
  User,
  Phone,
  FileText,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Layers,
  Sparkles,
  X,
  PhoneCall,
  CheckCheck,
  FileSpreadsheet,
  Share2
} from 'lucide-react';
import {
  useMasterDataStore,
  useTenantBrandingStore,
  ProductRecord,
  OrderRecord,
  PurchaseOrderRecord,
  PurchaseOrderStatus,
  ProductSearchCombobox,
  AccountSearchCombobox,
  DocumentPrintModal,
  UnifiedAccount,
  ExcelDataService
} from '@inventory/ui';

interface SalesCartItem {
  id: string;
  productId: string;
  name: string;
  urduName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  discount: number;
  location: 'godown' | 'shop';
  total: number;
}

interface PurchaseCartItem {
  id: string;
  productId: string;
  name: string;
  urduName: string;
  category: string;
  quantity: number;
  unit: string;
  costPrice: number;
  targetLocation: 'godown' | 'shop';
  total: number;
}

export const TradeOrdersHub: React.FC = () => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  const products = useMasterDataStore((s) => s.products);
  const orders = useMasterDataStore((s) => s.orders);
  const purchaseOrders = useMasterDataStore((s) => s.purchaseOrders);
  const addOrder = useMasterDataStore((s) => s.addOrder);
  const addPurchaseOrder = useMasterDataStore((s) => s.addPurchaseOrder);
  const updatePurchaseOrderStatus = useMasterDataStore((s) => s.updatePurchaseOrderStatus);
  const updateDispatchStatus = useMasterDataStore((s) => s.updateDispatchStatus);

  const [activeTab, setActiveTab] = useState<'all_orders' | 'create_sales_order' | 'create_purchase_order'>('all_orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'sales' | 'purchases'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // -------------------------------------------------------------
  // SALES ORDER CREATION STATE
  // -------------------------------------------------------------
  const [selectedBuyer, setSelectedBuyer] = useState<UnifiedAccount | null>(null);
  const [salesItems, setSalesItems] = useState<SalesCartItem[]>([]);
  const [salesPaymentMethod, setSalesPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Udhaar Khata' | 'Cheque'>('Cash');
  const [salesPaidAmount, setSalesPaidAmount] = useState<number>(0);
  const [salesChallanNo, setSalesChallanNo] = useState(`CHAL-${Date.now().toString().slice(-5)}`);
  const [salesVehicleNo, setSalesVehicleNo] = useState('');
  const [salesDriverName, setSalesDriverName] = useState('');
  const [salesDriverPhone, setSalesDriverPhone] = useState('');
  const [salesDefaultLocation, setSalesDefaultLocation] = useState<'godown' | 'shop'>('godown');

  // -------------------------------------------------------------
  // PURCHASE ORDER CREATION STATE (With 5-Stage Lifecycle)
  // -------------------------------------------------------------
  const [selectedSupplier, setSelectedSupplier] = useState<UnifiedAccount | null>(null);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseCartItem[]>([]);
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'Payable Khata' | 'Cheque'>('Cash');
  const [purchaseDefaultLocation, setPurchaseDefaultLocation] = useState<'godown' | 'shop'>('godown');
  const [purchaseInitialStatus, setPurchaseInitialStatus] = useState<PurchaseOrderStatus>('order_placed');
  const [purchaseSupplierRef, setPurchaseSupplierRef] = useState('');

  // -------------------------------------------------------------
  // PRINT PREVIEW MODAL STATE
  // -------------------------------------------------------------
  const [viewingOrder, setViewingOrder] = useState<OrderRecord | null>(null);
  const [viewingPO, setViewingPO] = useState<PurchaseOrderRecord | null>(null);
  const [modalMode, setModalMode] = useState<'challan' | 'invoice' | null>(null);

  // Filter and compute statistics
  const tenantOrders = orders.filter((o) => o.tenantId === activeTenantId || !o.tenantId);
  const tenantPOs = (purchaseOrders || []).filter((p) => p.tenantId === activeTenantId || !p.tenantId);

  const totalSalesVolume = tenantOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPurchaseVolume = tenantPOs.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const activeDispatchedCount = tenantOrders.filter((o) => o.dispatchStatus === 'dispatched').length;
  const pendingOrdersCount = tenantOrders.filter((o) => o.dispatchStatus === 'pending').length;

  // Add product to Sales Order
  const handleAddProductToSales = (p: ProductRecord) => {
    const existingIndex = salesItems.findIndex((it) => it.productId === p.id && it.location === salesDefaultLocation);
    const rate = p.wholesalePrice || p.retailPrice;

    if (existingIndex > -1) {
      const copy = [...salesItems];
      copy[existingIndex].quantity += 1;
      copy[existingIndex].total = copy[existingIndex].quantity * copy[existingIndex].unitPrice;
      setSalesItems(copy);
    } else {
      const newItem: SalesCartItem = {
        id: `si-${Date.now()}-${Math.random()}`,
        productId: p.id,
        name: p.name,
        urduName: p.urduName,
        category: p.category,
        quantity: 1,
        unit: p.unit || 'Bags',
        unitPrice: rate,
        discount: 0,
        location: salesDefaultLocation,
        total: rate
      };
      setSalesItems([newItem, ...salesItems]);
    }
  };

  // Add product to Purchase Order
  const handleAddProductToPurchase = (p: ProductRecord) => {
    const existingIndex = purchaseItems.findIndex((it) => it.productId === p.id && it.targetLocation === purchaseDefaultLocation);
    const cost = p.costPrice || Math.round(p.retailPrice * 0.85);

    if (existingIndex > -1) {
      const copy = [...purchaseItems];
      copy[existingIndex].quantity += 1;
      copy[existingIndex].total = copy[existingIndex].quantity * copy[existingIndex].costPrice;
      setPurchaseItems(copy);
    } else {
      const newItem: PurchaseCartItem = {
        id: `pi-${Date.now()}-${Math.random()}`,
        productId: p.id,
        name: p.name,
        urduName: p.urduName,
        category: p.category,
        quantity: 1,
        unit: p.unit || 'Bags',
        costPrice: cost,
        targetLocation: purchaseDefaultLocation,
        total: cost
      };
      setPurchaseItems([newItem, ...purchaseItems]);
    }
  };

  // Compute Sales Subtotal & Grand Total
  const salesSubtotal = salesItems.reduce((acc, it) => acc + it.total, 0);
  const purchaseSubtotal = purchaseItems.reduce((acc, it) => acc + it.total, 0);

  // Submit Sales Order
  const handleSaveSalesOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (salesItems.length === 0) {
      alert('Please add at least one product to the sales order.');
      return;
    }

    const orderId = `SO-${Date.now().toString(36).toUpperCase()}`;
    const newOrder: OrderRecord = {
      id: orderId,
      tenantId: activeTenantId,
      invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
      customerName: selectedBuyer?.name || 'Walk-in Wholesale Buyer',
      customerPhone: selectedBuyer?.phone || '0300-0000000',
      partyId: selectedBuyer?.id,
      partyName: selectedBuyer?.name,
      partyType: 'wholesale_buyer',
      orderType: 'wholesale_dist',
      itemCount: salesItems.length,
      totalAmount: salesSubtotal,
      paidAmount: salesPaidAmount || (salesPaymentMethod === 'Udhaar Khata' ? 0 : salesSubtotal),
      remainingDues: Math.max(0, salesSubtotal - (salesPaidAmount || (salesPaymentMethod === 'Udhaar Khata' ? 0 : salesSubtotal))),
      paymentMethod: salesPaymentMethod,
      dispatchStatus: 'in_godown',
      dispatchLocation: salesDefaultLocation,
      deliveryChallanNo: salesChallanNo,
      vehicleNumber: salesVehicleNo || 'LES-1234',
      driverName: salesDriverName || 'Mohammad Aslam',
      driverPhone: salesDriverPhone || '0300-9876543',
      date: new Date().toLocaleDateString(),
      items: salesItems.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: `${it.name} (${it.urduName})`,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
        location: it.location
      }))
    };

    addOrder(newOrder);

    // Open delivery challan preview
    setViewingOrder(newOrder);
    setViewingPO(null);
    setModalMode('challan');

    // Reset sales order form
    setSalesItems([]);
    setSalesVehicleNo('');
    setSalesDriverName('');
    setSalesDriverPhone('');
    setActiveTab('all_orders');
  };

  // Submit Purchase Order with 5-Stage Procurement Lifecycle
  const handleSavePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaseItems.length === 0) {
      alert('Please add at least one product to the purchase inward order.');
      return;
    }

    const poId = `PO-${Date.now().toString(36).toUpperCase()}`;
    const newPO: PurchaseOrderRecord = {
      id: poId,
      tenantId: activeTenantId,
      orderNumber: poId,
      supplierId: selectedSupplier?.id || 'sup-gen',
      supplierName: selectedSupplier?.name || 'Upstream Seed Mill',
      supplierUrduName: selectedSupplier?.urduName,
      supplierPhone: selectedSupplier?.phone,
      items: purchaseItems.map((it) => ({
        productId: it.productId,
        productName: it.name,
        productUrduName: it.urduName,
        quantity: it.quantity,
        costPrice: it.costPrice,
        total: it.total,
        targetLocation: it.targetLocation
      })),
      totalAmount: purchaseSubtotal,
      paidAmount: purchaseSubtotal,
      paymentMethod: purchasePaymentMethod,
      status: purchaseInitialStatus,
      targetLocation: purchaseDefaultLocation,
      date: new Date().toLocaleDateString(),
      notes: purchaseSupplierRef ? `Supplier Ref: ${purchaseSupplierRef}` : undefined
    };

    addPurchaseOrder(newPO);

    // Open PO preview
    setViewingPO(newPO);
    setViewingOrder(null);
    setModalMode('invoice');

    // Reset form
    setPurchaseItems([]);
    setPurchaseSupplierRef('');
    setActiveTab('all_orders');
  };

  const getPurchaseStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'order_placed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">📞 Order Placed (آرڈر دیا گیا)</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">🤝 Confirmed (تصدیق شدہ)</span>;
      case 'on_the_way':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">🚚 On the Way (گاڑی روانہ)</span>;
      case 'received_godown':
      case 'received':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">🏢 In Godown (گودام میں وصول)</span>;
      case 'received_shop':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300">🏪 In Shop (دکان پر وصول)</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Cancelled</span>;
    }
  };

  return (
    <div className="flex-1 bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col p-3 sm:p-5 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 md:pb-4 border-b border-slate-200 dark:border-[#2b2b40]">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm shrink-0">
              <Truck size={18} />
            </div>
            <div>
              <h1 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
                <span>Universal Trade & Orders Hub</span>
                <span className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-bold">
                  B2B & Retail
                </span>
              </h1>
              <p className="text-[11px] md:text-xs text-slate-400 font-urdu">
                خریداری، تھوک سیلز آرڈرز، ڈلیوری چالان و گیٹ پاس مینجمنٹ
              </p>
            </div>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('create_sales_order')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
              activeTab === 'create_sales_order'
                ? 'bg-purple-600 text-white shadow-purple-500/20'
                : 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-600 hover:text-white'
            }`}
          >
            <ShoppingCart size={14} />
            <span>+ 🛒 Sell to Buyer (نیا سیل آرڈر)</span>
          </button>

          <button
            onClick={() => setActiveTab('create_purchase_order')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
              activeTab === 'create_purchase_order'
                ? 'bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-600 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>+ 📥 Buy from Supplier (خریداری آرڈر)</span>
          </button>

          <button
            onClick={() => setActiveTab('all_orders')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border shadow-sm ${
              activeTab === 'all_orders'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-[#1e1e2d] border-slate-200 dark:border-[#2b2b40] text-slate-700 dark:text-slate-300 hover:border-blue-500'
            }`}
          >
            <FileText size={14} />
            <span>📋 Orders Ledger (لسٹ)</span>
          </button>

          <button
            type="button"
            onClick={() => ExcelDataService.exportOrdersToExcel(tenantOrders, `${profile?.name || 'Store'}_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`)}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-200 dark:border-[#2b2b40] bg-white dark:bg-[#1e1e2d] text-slate-700 dark:text-slate-300 hover:text-emerald-500 shadow-sm"
            title="Export Orders & Invoices to Excel"
          >
            <FileSpreadsheet size={14} className="text-emerald-500" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Total Sales Volume */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400">Total Sales Volume (کل سیلز)</div>
            <div className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono mt-1">
              Rs. {totalSalesVolume.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{tenantOrders.length} Completed Orders</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
            <ShoppingCart size={18} />
          </div>
        </div>

        {/* Total Purchase Inward */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400">Total Purchases (خریداری مال)</div>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
              Rs. {totalPurchaseVolume.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">{tenantPOs.length} Procurement Orders</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
            <Package size={18} />
          </div>
        </div>

        {/* Dispatched Consignments */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400">In-Transit / Dispatched (روانہ)</div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
              {activeDispatchedCount} Vehicles
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">With Delivery Gate Passes</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
            <Truck size={18} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400">Pending Orders (زیرِ انتظار)</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1">
              {pendingOrdersCount} Orders
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Ready for packing & loading</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ALL ORDERS LEDGER                                 */}
      {/* ========================================================= */}
      {activeTab === 'all_orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1e1e2d] p-3 rounded-2xl border border-slate-200 dark:border-[#2b2b40] shadow-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#151521]'
                }`}
              >
                All Records ({tenantOrders.length + tenantPOs.length})
              </button>
              <button
                onClick={() => setOrderFilter('sales')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderFilter === 'sales'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#151521]'
                }`}
              >
                Sales Orders (سیلز) ({tenantOrders.length})
              </button>
              <button
                onClick={() => setOrderFilter('purchases')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  orderFilter === 'purchases'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#151521]'
                }`}
              >
                Purchases Inward (خریداری) ({tenantPOs.length})
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Order #, Party, Driver..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200 dark:border-[#2b2b40] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#151521] border-b border-slate-200 dark:border-[#2b2b40] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Order / Doc #</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Party & Contact</th>
                    <th className="py-3 px-4">Items / Sacks</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Procurement / Dispatch Lifecycle</th>
                    <th className="py-3 px-4 text-right">3-Format Print</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]/60">
                  {/* Sales Orders */}
                  {(orderFilter === 'all' || orderFilter === 'sales') &&
                    tenantOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-[#151521]/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <div>{o.invoiceNo || o.id}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{o.date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                            Wholesale Sale
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{o.customerName || o.partyName}</div>
                          <div className="text-[11px] text-slate-400">{o.customerPhone || 'Counter'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {o.items?.length || o.itemCount || 1} Products
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize">
                          <span className="inline-flex items-center text-slate-600 dark:text-slate-300 font-medium">
                            {o.dispatchLocation === 'godown' ? (
                              <Building2 size={13} className="mr-1 text-blue-500" />
                            ) : (
                              <Store size={13} className="mr-1 text-emerald-500" />
                            )}
                            {o.dispatchLocation || 'Godown'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          Rs. {o.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {o.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={o.dispatchStatus}
                            onChange={(e) => updateDispatchStatus(o.id, e.target.value as any)}
                            className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none ${
                              o.dispatchStatus === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : o.dispatchStatus === 'dispatched'
                                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                : o.dispatchStatus === 'in_godown'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                                : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            <option value="pending">⏳ Pending (زیرِ کارروائی)</option>
                            <option value="in_godown">🏢 In Godown (گودام میں لوڈنگ)</option>
                            <option value="in_shop">🏪 In Shop (دکان پر تیار)</option>
                            <option value="dispatched">🚚 Dispatched (گاڑی روانہ)</option>
                            <option value="delivered">✅ Delivered (پہنچ گیا)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setViewingOrder(o);
                                setViewingPO(null);
                                setModalMode('challan');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-colors flex items-center space-x-1"
                              title="Print Delivery Challan & Gate Pass"
                            >
                              <Truck size={12} />
                              <span>Challan</span>
                            </button>
                            <button
                              onClick={() => {
                                setViewingOrder(o);
                                setViewingPO(null);
                                setModalMode('invoice');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
                              title="Print Invoice"
                            >
                              <Printer size={12} />
                              <span>Invoice</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {/* Purchase Inward Orders with 5-Stage Procurement Lifecycle */}
                  {(orderFilter === 'all' || orderFilter === 'purchases') &&
                    tenantPOs.map((po) => (
                      <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-[#151521]/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          <div>{po.orderNumber}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{po.date}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            Purchase Inward
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{po.supplierName}</div>
                          <div className="text-[11px] text-slate-400 font-urdu">{po.supplierUrduName || 'سپلائر'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {po.items.length} Products ({po.items.reduce((s, it) => s + it.quantity, 0)} Units)
                          </span>
                        </td>
                        <td className="py-3 px-4 capitalize">
                          <span className="inline-flex items-center text-slate-600 dark:text-slate-300 font-medium">
                            {po.targetLocation === 'godown' ? (
                              <Building2 size={13} className="mr-1 text-blue-500" />
                            ) : (
                              <Store size={13} className="mr-1 text-emerald-500" />
                            )}
                            {po.targetLocation || 'Godown'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          Rs. {po.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {po.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={po.status}
                            onChange={(e) => updatePurchaseOrderStatus(po.id, e.target.value as PurchaseOrderStatus)}
                            className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none ${
                              po.status === 'received_godown' || po.status === 'received'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : po.status === 'received_shop'
                                ? 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800'
                                : po.status === 'on_the_way'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800'
                                : po.status === 'confirmed'
                                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                : 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300'
                            }`}
                          >
                            <option value="order_placed">📞 Order Placed (آرڈر دیا گیا)</option>
                            <option value="confirmed">🤝 Confirmed (تصدیق شدہ)</option>
                            <option value="on_the_way">🚚 On the Way (گاڑی روانہ)</option>
                            <option value="received_godown">🏢 In Godown (گودام وصول - اسٹاک جمع)</option>
                            <option value="received_shop">🏪 In Shop (دکان وصول - اسٹاک جمع)</option>
                            <option value="cancelled">❌ Cancelled (منسوخ)</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setViewingPO(po);
                              setViewingOrder(null);
                              setModalMode('invoice');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-600 hover:text-white transition-colors flex items-center space-x-1 ml-auto"
                          >
                            <Printer size={12} />
                            <span>GRN Bill</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: CREATE WHOLESALE SALES ORDER                      */}
      {/* ========================================================= */}
      {activeTab === 'create_sales_order' && (
        <form onSubmit={handleSaveSalesOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Product Selection & Multi-Product Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Customer / Buyer Account Combobox */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Select Buyer Vendor / Customer Account (خریدار یا کھاتہ دار منتخب کریں) *
              </label>
              <AccountSearchCombobox
                filterType="customer_buyer"
                tenantId={activeTenantId}
                selectedAccountId={selectedBuyer?.id}
                onSelectAccount={(acc) => setSelectedBuyer(acc)}
                placeholder="Search Buyer or Customer by name, Urdu, phone..."
              />
            </div>

            {/* Step 2: Searchable Product Dropdown */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Search & Add Multiple Products to Sales Bill (پروڈکٹس تلاش کریں اور شامل کریں) *
                </label>
                {/* Stock Source Toggle */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-slate-400">Deduct Stock From:</span>
                  <button
                    type="button"
                    onClick={() => setSalesDefaultLocation('godown')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      salesDefaultLocation === 'godown'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🏢 Godown (گودام)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSalesDefaultLocation('shop')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      salesDefaultLocation === 'shop'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🏪 Shop (دکان)
                  </button>
                </div>
              </div>

              {/* Product Combobox */}
              <ProductSearchCombobox
                products={products.filter((p) => p.tenantId === activeTenantId || !p.tenantId)}
                priceType="wholesale"
                onSelectProduct={handleAddProductToSales}
                placeholder="Type product name (e.g. Wheat Seed, Rice, Olper) or scan barcode..."
              />

              {/* Cart Table */}
              {salesItems.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-[#2b2b40] text-center text-slate-400 text-xs">
                  <ShoppingCart size={24} className="mx-auto mb-2 opacity-50" />
                  No products added yet. Use the search bar above to add products to this wholesale order.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-[#2b2b40] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[520px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#151521] border-b border-slate-200 dark:border-[#2b2b40] text-slate-500 dark:text-slate-400 font-bold">
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 text-center">Location</th>
                        <th className="py-2.5 px-3 text-center">Quantity</th>
                        <th className="py-2.5 px-3 text-right">Rate (Rs.)</th>
                        <th className="py-2.5 px-3 text-right">Total (Rs.)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]/60">
                      {salesItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-[#151521]/30">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400 font-urdu">{item.urduName}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <select
                              value={item.location}
                              onChange={(e) => {
                                const copy = [...salesItems];
                                copy[idx].location = e.target.value as any;
                                setSalesItems(copy);
                              }}
                              className="text-[10px] font-bold py-1 px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2b2b40]"
                            >
                              <option value="godown">🏢 Godown</option>
                              <option value="shop">🏪 Shop</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 1;
                                const copy = [...salesItems];
                                copy[idx].quantity = val;
                                copy[idx].total = val * copy[idx].unitPrice;
                                setSalesItems(copy);
                              }}
                              className="w-16 text-center py-1 px-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const copy = [...salesItems];
                                copy[idx].unitPrice = val;
                                copy[idx].total = copy[idx].quantity * val;
                                setSalesItems(copy);
                              }}
                              className="w-20 text-right py-1 px-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                            Rs. {item.total.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSalesItems(salesItems.filter((_, i) => i !== idx))}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Payment, Logistics & Final Order Generation */}
          <div className="space-y-4">
            {/* Logistics & Delivery Details */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Truck size={14} className="text-purple-500" />
                <span>3. Gate Pass & Dispatch Logistics</span>
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Challan / Gate Pass #
                </label>
                <input
                  type="text"
                  value={salesChallanNo}
                  onChange={(e) => setSalesChallanNo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Vehicle / Truck # (گاڑی کا نمبر)
                </label>
                <input
                  type="text"
                  value={salesVehicleNo}
                  onChange={(e) => setSalesVehicleNo(e.target.value)}
                  placeholder="e.g. LES-4820 / Mazda Truck"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Driver Name (ڈرائیور)
                  </label>
                  <input
                    type="text"
                    value={salesDriverName}
                    onChange={(e) => setSalesDriverName(e.target.value)}
                    placeholder="e.g. Mohammad Aslam"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Driver Phone (فون)
                  </label>
                  <input
                    type="text"
                    value={salesDriverPhone}
                    onChange={(e) => setSalesDriverPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Payment & Order Summary */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSign size={14} className="text-emerald-500" />
                <span>4. Payment & Billing Terms</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSalesPaymentMethod('Cash')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border ${
                    salesPaymentMethod === 'Cash'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600'
                      : 'border-slate-200 dark:border-[#2b2b40] text-slate-600'
                  }`}
                >
                  💵 Cash (نقد)
                </button>
                <button
                  type="button"
                  onClick={() => setSalesPaymentMethod('Udhaar Khata')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border ${
                    salesPaymentMethod === 'Udhaar Khata'
                      ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-500 text-rose-600'
                      : 'border-slate-200 dark:border-[#2b2b40] text-slate-600'
                  }`}
                >
                  📖 Udhaar Khata (ادھار)
                </button>
                <button
                  type="button"
                  onClick={() => setSalesPaymentMethod('Bank Transfer')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border ${
                    salesPaymentMethod === 'Bank Transfer'
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600'
                      : 'border-slate-200 dark:border-[#2b2b40] text-slate-600'
                  }`}
                >
                  🏦 1Link Bank
                </button>
                <button
                  type="button"
                  onClick={() => setSalesPaymentMethod('Cheque')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border ${
                    salesPaymentMethod === 'Cheque'
                      ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-600'
                      : 'border-slate-200 dark:border-[#2b2b40] text-slate-600'
                  }`}
                >
                  📝 Cheque (چیک)
                </button>
              </div>

              {/* Bill Totals */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#2b2b40] space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Total Items:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{salesItems.length} Products</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1">
                  <span>Grand Total:</span>
                  <span className="font-mono text-purple-600 dark:text-purple-400">
                    Rs. {salesSubtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={salesItems.length === 0}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
              >
                <CheckCircle2 size={16} />
                <span>Create Sales Order & Print Challan</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 3: CREATE PURCHASE INWARD ORDER (5-STAGE LIFECYCLE)   */}
      {/* ========================================================= */}
      {activeTab === 'create_purchase_order' && (
        <form onSubmit={handleSavePurchaseOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Supplier Selection & Multi-Product Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Step 1: Supplier Combobox */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Select Supplier Vendor (سپلائر کمپنی / امپورٹر منتخب کریں) *
              </label>
              <AccountSearchCombobox
                filterType="supplier"
                tenantId={activeTenantId}
                selectedAccountId={selectedSupplier?.id}
                onSelectAccount={(acc) => setSelectedSupplier(acc)}
                placeholder="Search Supplier by name, Urdu, phone..."
              />
            </div>

            {/* Step 2: Searchable Product Dropdown */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  2. Search & Add Products to Purchase Inward (خریداری آئٹمز شامل کریں) *
                </label>
                {/* Storage Target Toggle */}
                <div className="flex items-center space-x-1.5 text-xs">
                  <span className="text-slate-400">Store Received Goods In:</span>
                  <button
                    type="button"
                    onClick={() => setPurchaseDefaultLocation('godown')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      purchaseDefaultLocation === 'godown'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🏢 Godown (گودام)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurchaseDefaultLocation('shop')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                      purchaseDefaultLocation === 'shop'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    🏪 Shop (دکان)
                  </button>
                </div>
              </div>

              {/* Product Combobox */}
              <ProductSearchCombobox
                products={products.filter((p) => p.tenantId === activeTenantId || !p.tenantId)}
                priceType="cost"
                onSelectProduct={handleAddProductToPurchase}
                placeholder="Type product name or scan barcode to add to purchase inward..."
              />

              {/* Purchase Cart Table */}
              {purchaseItems.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-[#2b2b40] text-center text-slate-400 text-xs">
                  <Package size={24} className="mx-auto mb-2 opacity-50" />
                  No products added yet. Use the search bar above to add products to this inward purchase.
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-[#2b2b40] rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[520px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#151521] border-b border-slate-200 dark:border-[#2b2b40] text-slate-500 dark:text-slate-400 font-bold">
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 text-center">Store In</th>
                        <th className="py-2.5 px-3 text-center">Inward Qty</th>
                        <th className="py-2.5 px-3 text-right">Cost Price (Rs.)</th>
                        <th className="py-2.5 px-3 text-right">Total (Rs.)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]/60">
                      {purchaseItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-[#151521]/30">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 dark:text-white">{item.name}</div>
                            <div className="text-[11px] text-slate-400 font-urdu">{item.urduName}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <select
                              value={item.targetLocation}
                              onChange={(e) => {
                                const copy = [...purchaseItems];
                                copy[idx].targetLocation = e.target.value as any;
                                setPurchaseItems(copy);
                              }}
                              className="text-[10px] font-bold py-1 px-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2b2b40]"
                            >
                              <option value="godown">🏢 Godown</option>
                              <option value="shop">🏪 Shop</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 1;
                                const copy = [...purchaseItems];
                                copy[idx].quantity = val;
                                copy[idx].total = val * copy[idx].costPrice;
                                setPurchaseItems(copy);
                              }}
                              className="w-16 text-center py-1 px-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.costPrice}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const copy = [...purchaseItems];
                                copy[idx].costPrice = val;
                                copy[idx].total = copy[idx].quantity * val;
                                setPurchaseItems(copy);
                              }}
                              className="w-20 text-right py-1 px-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-lg font-mono font-bold"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                            Rs. {item.total.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setPurchaseItems(purchaseItems.filter((_, i) => i !== idx))}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inward Details, Initial Lifecycle Status & Submit */}
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <FileText size={14} className="text-amber-500" />
                <span>3. Supplier Procurement Lifecycle</span>
              </h3>

              {/* Initial Lifecycle Stage */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Procurement Stage (آرڈر کی موجودہ حالت)
                </label>
                <select
                  value={purchaseInitialStatus}
                  onChange={(e) => setPurchaseInitialStatus(e.target.value as PurchaseOrderStatus)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="order_placed">📞 Called & Placed Order with Supplier (آرڈر دیا گیا)</option>
                  <option value="confirmed">🤝 Supplier Confirmed & Seed Reserved (تصدیق شدہ)</option>
                  <option value="on_the_way">🚚 Dispatched / On the Way (گاڑی میں مال روانہ ہے)</option>
                  <option value="received_godown">🏢 Already Received & Stored in Godown (گودام میں جمع)</option>
                  <option value="received_shop">🏪 Already Received & Stored at Shop (دکان پر جمع)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Supplier Invoice / Bilty Reference #
                </label>
                <input
                  type="text"
                  value={purchaseSupplierRef}
                  onChange={(e) => setPurchaseSupplierRef(e.target.value)}
                  placeholder="e.g. BILTY-8849 / INV-901"
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                  Payment Terms
                </label>
                <select
                  value={purchasePaymentMethod}
                  onChange={(e) => setPurchasePaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="Cash">💵 Cash Payout (فوری نقد ادائیگی)</option>
                  <option value="Bank Transfer">🏦 1Link Bank Transfer</option>
                  <option value="Payable Khata">📖 Supplier Payable Khata (کھاتہ ادھار)</option>
                  <option value="Cheque">📝 Cheque</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <ShieldCheck size={13} />
                  <span>Procurement Lifecycle:</span>
                </div>
                <p>
                  You can track when the supplier is called, when the batch is on the way, and advance to "Received" to automatically increment inventory stock.
                </p>
              </div>

              {/* Bill Totals */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#2b2b40] space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Total Inward Items:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{purchaseItems.length} Products</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 dark:text-white pt-1">
                  <span>Total Purchase Cost:</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">
                    Rs. {purchaseSubtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={purchaseItems.length === 0}
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
              >
                <CheckCircle2 size={16} />
                <span>Save Purchase Inward Order</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* UNIVERSAL 3-TIER PRINT MODAL (A4, A5, 80MM THERMAL)       */}
      {/* ========================================================= */}
      {modalMode && (viewingOrder || viewingPO) && (
        <DocumentPrintModal
          isOpen={true}
          onClose={() => {
            setModalMode(null);
            setViewingOrder(null);
            setViewingPO(null);
          }}
          order={viewingOrder}
          purchaseOrder={viewingPO}
          initialMode={modalMode}
          initialFormat="a4_full"
        />
      )}
    </div>
  );
};
