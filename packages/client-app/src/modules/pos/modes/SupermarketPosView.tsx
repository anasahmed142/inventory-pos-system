// packages/client-app/src/modules/pos/modes/SupermarketPosView.tsx
import React, { useState } from 'react';
import {
  ShoppingCart,
  Banknote,
  CreditCard,
  Trash2,
  Plus,
  Minus,
  Barcode,
  CheckCircle2,
  Sparkles,
  Printer,
  X,
  QrCode,
  Search,
  Building2,
  Store,
  User,
  Phone,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import {
  useTenantBrandingStore,
  useMasterDataStore,
  OrderRecord,
  KhataEntryRecord,
  ProductRecord,
  ProductSearchCombobox,
  AccountSearchCombobox,
  UnifiedAccount
} from '@inventory/ui';

interface CartLine {
  id: string;
  productId?: string;
  barcode?: string;
  name: string;
  urduName: string;
  category?: string;
  qty: number;
  rate: number;
  discount: number;
  location: 'godown' | 'shop';
  total: number;
}

export const SupermarketPosView: React.FC = () => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  const products = useMasterDataStore((s) => s.products);
  const addOrder = useMasterDataStore((s) => s.addOrder);
  const addKhataEntry = useMasterDataStore((s) => s.addKhataEntry);

  const tenantProducts = products.filter((p) => p.tenantId === activeTenantId || !p.tenantId);

  // Cart & Account States
  const [selectedAccount, setSelectedAccount] = useState<UnifiedAccount | null>(null);
  const [items, setItems] = useState<CartLine[]>([
    {
      id: '1',
      barcode: '896400112233',
      name: 'Olper Milk 1L Tetra Pak',
      urduName: 'اولپرز دودھ ۱ لیٹر',
      category: 'Dairy',
      qty: 2,
      rate: 290,
      discount: 0,
      location: 'shop',
      total: 580
    },
    {
      id: '2',
      barcode: '896400223344',
      name: 'Shan Special Biryani Masala',
      urduName: 'شان بریانی مصالحہ',
      category: 'Spices',
      qty: 1,
      rate: 140,
      discount: 0,
      location: 'shop',
      total: 140
    }
  ]);

  const [barcodeInput, setBarcodeInput] = useState('');
  const [tenderCash, setTenderCash] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'jazzcash' | 'udhaar_khata'>('cash');
  const [activePriceTier, setActivePriceTier] = useState<'retail' | 'wholesale'>('retail');
  const [defaultDeductLocation, setDefaultDeductLocation] = useState<'shop' | 'godown'>('shop');
  const [includeGst, setIncludeGst] = useState<boolean>(true);
  const [lastScanned, setLastScanned] = useState<string>('Ready for Barcode Wedge Scanner or Search Dropdown...');
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  // Totals Calculation
  const subtotal = items.reduce((acc, it) => acc + it.total, 0);
  const gst = includeGst ? Number((subtotal * 0.18).toFixed(2)) : 0;
  const grandTotal = Math.round(subtotal + gst);
  const changeDue = Math.max(0, tenderCash - grandTotal);

  // Add Product via Searchable Dropdown
  const handleSelectProductFromCombobox = (product: ProductRecord) => {
    const rate = activePriceTier === 'wholesale' ? (product.wholesalePrice || product.retailPrice) : product.retailPrice;
    const existingIndex = items.findIndex((it) => it.productId === product.id && it.location === defaultDeductLocation);

    if (existingIndex > -1) {
      const copy = [...items];
      copy[existingIndex].qty += 1;
      copy[existingIndex].total = copy[existingIndex].qty * copy[existingIndex].rate;
      setItems(copy);
      setLastScanned(`Qty incremented for: ${product.name}`);
    } else {
      const newItem: CartLine = {
        id: `c-${Date.now()}-${Math.random()}`,
        productId: product.id,
        barcode: product.barcode,
        name: product.name,
        urduName: product.urduName,
        category: product.category,
        qty: 1,
        rate,
        discount: 0,
        location: defaultDeductLocation,
        total: rate
      };
      setItems([newItem, ...items]);
      setLastScanned(`Added: ${product.name}`);
    }
  };

  // Add Product via Barcode Wedge Scanner
  const handleBarcodeAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const barcode = barcodeInput.trim();

    const matchedProduct = tenantProducts.find((p) => p.barcode === barcode);
    const existingIndex = items.findIndex((i) => i.barcode === barcode && i.location === defaultDeductLocation);

    if (existingIndex > -1) {
      const copy = [...items];
      copy[existingIndex].qty += 1;
      copy[existingIndex].total = copy[existingIndex].qty * copy[existingIndex].rate;
      setItems(copy);
      setLastScanned(`Qty incremented for: ${copy[existingIndex].name}`);
    } else if (matchedProduct) {
      handleSelectProductFromCombobox(matchedProduct);
    } else {
      const newItem: CartLine = {
        id: Date.now().toString(),
        barcode,
        name: `Scanned Retail Item (${barcode})`,
        urduName: 'اسکین شدہ آئٹم',
        qty: 1,
        rate: 220,
        discount: 0,
        location: defaultDeductLocation,
        total: 220
      };
      setItems([newItem, ...items]);
      setLastScanned(`Added: ${newItem.name}`);
    }
    setBarcodeInput('');
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((it) => {
          if (it.id === id) {
            const newQty = Math.max(1, it.qty + delta);
            return { ...it, qty: newQty, total: newQty * it.rate };
          }
          return it;
        })
        .filter((it) => it.qty > 0)
    );
  };

  const updateRate = (id: string, newRate: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return { ...it, rate: newRate, total: it.qty * newRate };
        }
        return it;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setLastScanned('Cart cleared.');
  };

  // Complete Checkout
  const handleCompleteSale = () => {
    if (items.length === 0) return;

    const orderId = `INV-${Date.now().toString().slice(-6)}`;
    const isUdhaar = paymentMethod === 'udhaar_khata';

    const order: OrderRecord = {
      id: `ord-${Date.now()}`,
      tenantId: activeTenantId,
      invoiceNo: orderId,
      customerName: selectedAccount?.name || 'Walk-in Cash Customer',
      customerPhone: selectedAccount?.phone || '0300-0000000',
      partyId: selectedAccount?.id,
      partyName: selectedAccount?.name,
      orderType: 'retail_pos',
      itemCount: items.length,
      totalAmount: grandTotal,
      paidAmount: isUdhaar ? 0 : grandTotal,
      remainingDues: isUdhaar ? grandTotal : 0,
      paymentMethod: isUdhaar ? 'Udhaar Khata' : paymentMethod.toUpperCase(),
      fbrInvoiceNumber: `FBR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      dispatchStatus: 'delivered',
      dispatchLocation: defaultDeductLocation,
      date: new Date().toLocaleDateString(),
      items: items.map((it) => ({
        id: it.id,
        productId: it.productId,
        productName: `${it.name} (${it.urduName})`,
        quantity: it.qty,
        unitPrice: it.rate,
        total: it.total,
        location: it.location
      }))
    };

    // Save Order
    addOrder(order);

    // If Udhaar, post to Khata
    if (isUdhaar && selectedAccount && selectedAccount.id !== 'walk-in-cash') {
      const entry: KhataEntryRecord = {
        id: `ke-${Date.now().toString(36)}`,
        tenantId: activeTenantId,
        partyId: selectedAccount.id,
        partyName: selectedAccount.name,
        entryType: 'naam',
        amount: grandTotal,
        description: `POS Bill #${orderId} (${items.length} items)`,
        urduDescription: `پی او ایس بل #${orderId} (${items.map((i) => i.urduName).join(', ')})`,
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      };
      addKhataEntry(entry);
    }

    setCompletedOrder(order);
    setItems([]);
    setLastScanned(`Order #${orderId} completed successfully!`);
  };

  return (
    <div className="flex-1 bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col p-3 sm:p-4 md:p-5 space-y-3 md:space-y-4 overflow-y-auto lg:overflow-hidden pb-16 md:pb-0 min-h-0">
      {/* Top Bar: Customer Account Selector & Price Tier Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Customer / Party Combobox */}
        <div className="md:col-span-7">
          <AccountSearchCombobox
            filterType="customer_buyer"
            tenantId={activeTenantId}
            selectedAccountId={selectedAccount?.id}
            onSelectAccount={(acc) => setSelectedAccount(acc)}
            placeholder="Search customer account by name, Urdu, or phone..."
          />
        </div>

        {/* Rate Tier & Location Deduct Selector */}
        <div className="md:col-span-5 flex items-center justify-end space-x-2 bg-white dark:bg-[#1e1e2d] p-1.5 rounded-xl border border-slate-200 dark:border-[#2b2b40] shadow-xs">
          {/* Retail vs Wholesale Rate */}
          <div className="flex items-center bg-slate-100 dark:bg-[#151521] p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => setActivePriceTier('retail')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activePriceTier === 'retail'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Retail Rate
            </button>
            <button
              onClick={() => setActivePriceTier('wholesale')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                activePriceTier === 'wholesale'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Wholesale Rate
            </button>
          </div>

          {/* Stock Source */}
          <div className="flex items-center bg-slate-100 dark:bg-[#151521] p-0.5 rounded-lg text-xs font-bold">
            <button
              onClick={() => setDefaultDeductLocation('shop')}
              className={`px-2 py-1 rounded-md transition-all flex items-center space-x-1 ${
                defaultDeductLocation === 'shop'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Deduct stock from Shop Front Counter"
            >
              <Store size={12} />
              <span>Shop</span>
            </button>
            <button
              onClick={() => setDefaultDeductLocation('godown')}
              className={`px-2 py-1 rounded-md transition-all flex items-center space-x-1 ${
                defaultDeductLocation === 'godown'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Deduct stock from Godown Warehouse"
            >
              <Building2 size={12} />
              <span>Godown</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main POS Interface Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
        {/* Left Column: Product Search Combobox + Barcode Scanner + Multi-Product Cart Table */}
        <div className="lg:col-span-8 flex flex-col space-y-3 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl p-4 shadow-xs overflow-hidden">
          {/* Dual Search Header: Searchable Dropdown & Barcode Scanner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
            {/* Searchable Combobox */}
            <div className="md:col-span-8">
              <ProductSearchCombobox
                products={tenantProducts}
                priceType={activePriceTier}
                onSelectProduct={handleSelectProductFromCombobox}
                placeholder="🔍 Search product catalog (English, Urdu, SKU)..."
              />
            </div>

            {/* Quick Barcode Wedge Input */}
            <form onSubmit={handleBarcodeAdd} className="md:col-span-4 relative flex items-center">
              <Barcode size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan Barcode..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-mono font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </form>
          </div>

          {/* Telemetry Bar */}
          <div className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-[#151521] px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-[#2b2b40] text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-2 truncate">
              <Sparkles size={13} className="text-blue-500 shrink-0" />
              <span className="truncate">{lastScanned}</span>
            </div>
            <div className="flex items-center space-x-3 shrink-0 font-medium">
              <span>Items in Bill: <b className="text-slate-900 dark:text-white">{items.length}</b></span>
              {items.length > 0 && (
                <button onClick={clearCart} className="text-rose-500 hover:underline font-bold">
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Cart Table */}
          <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-[#2b2b40] rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-50 dark:bg-[#151521] border-b border-slate-200 dark:border-[#2b2b40] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Product Item</th>
                  <th className="py-2.5 px-3 text-center">Stock Source</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price (Rs.)</th>
                  <th className="py-2.5 px-3 text-right">Total (Rs.)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]/50">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <ShoppingCart size={32} className="mx-auto mb-2 opacity-30 text-blue-500" />
                      <div className="font-bold">POS Cart is Empty</div>
                      <div className="text-[11px] text-slate-400">Use the searchable dropdown or scan a barcode to add products.</div>
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-50/60 dark:hover:bg-[#151521]/40 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{it.name}</div>
                        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                          <span className="font-urdu text-slate-500 dark:text-slate-300">{it.urduName}</span>
                          {it.barcode && <span className="font-mono">#{it.barcode}</span>}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {it.location === 'godown' ? '🏢 Godown' : '🏪 Shop'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQty(it.id, -1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-[#1e1e2d] text-slate-700 dark:text-slate-300 font-bold hover:text-rose-500"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-slate-900 dark:text-white">
                            {it.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(it.id, 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white dark:bg-[#1e1e2d] text-slate-700 dark:text-slate-300 font-bold hover:text-blue-500"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          value={it.rate}
                          onChange={(e) => updateRate(it.id, Number(e.target.value) || 0)}
                          className="w-16 text-right py-0.5 px-1 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded font-mono font-bold text-xs"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        Rs. {it.total.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => removeItem(it.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Checkout, Net Payable & Tender Actions */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl p-4 shadow-xs space-y-4">
          <div className="space-y-3">
            {/* Customer Status Banner */}
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <User size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedAccount?.name || 'Walk-in Cash Customer'}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">
                Bal: Rs. {Math.abs(selectedAccount?.balance || 0).toLocaleString()}
              </span>
            </div>

            {/* Bill Calculations */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#2b2b40] text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal ({items.reduce((s, it) => s + it.qty, 0)} Units)</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">Rs. {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeGst}
                    onChange={(e) => setIncludeGst(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0"
                  />
                  <span>Sales Tax GST (18%)</span>
                </label>
                <span className="font-mono font-bold text-slate-900 dark:text-white">Rs. {gst.toLocaleString()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Net Payable:
                </span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Payment Mode (ادائیگی طریقہ)
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-600'
                      : 'border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Banknote size={14} />
                  <span>💵 Cash (نقد)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('udhaar_khata')}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === 'udhaar_khata'
                      ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-500 text-rose-600'
                      : 'border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <BookOpen size={14} />
                  <span>📖 Udhaar (کھاتہ)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600'
                      : 'border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard size={14} />
                  <span>💳 Card POS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`py-2 px-2 rounded-xl border flex items-center justify-center space-x-1.5 transition-all ${
                    paymentMethod === 'jazzcash'
                      ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-600'
                      : 'border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <QrCode size={14} />
                  <span>📱 Jazz/Easy</span>
                </button>
              </div>
            </div>

            {/* Cash Tendering Details */}
            {paymentMethod === 'cash' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Tender Cash (وصول نقد):</span>
                  <div className="flex space-x-1">
                    {[500, 1000, 5000].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setTenderCash(val)}
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] hover:bg-blue-100 hover:text-blue-600"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="number"
                  value={tenderCash}
                  onChange={(e) => setTenderCash(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white"
                />
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-500">Change Due (باقیہ واپسی):</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    Rs. {changeDue.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Checkout Submit Button */}
          <button
            type="button"
            disabled={items.length === 0}
            onClick={handleCompleteSale}
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
          >
            <CheckCircle2 size={18} />
            <span>Complete Sale & Print Receipt (بل پرنٹ کریں)</span>
          </button>
        </div>
      </div>

      {/* Completed Sale Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#2b2b40]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sale Completed!</h3>
                  <div className="text-[11px] text-slate-400">Order #{completedOrder.invoiceNo}</div>
                </div>
              </div>
              <button
                onClick={() => setCompletedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Receipt Content */}
            <div className="mt-4 p-4 bg-slate-50 dark:bg-[#151521] rounded-xl border border-slate-200 dark:border-[#2b2b40] space-y-3 font-mono text-xs">
              <div className="text-center pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                <div className="font-bold text-sm">{profile?.name || 'Inventory System'}</div>
                <div className="text-[10px] text-slate-400">{profile?.address || 'Pakistan'}</div>
                <div className="text-[10px] text-slate-400">NTN: {profile?.ntnStrn || '3201456-7'}</div>
              </div>

              <div className="space-y-1">
                {completedOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate w-36">{it.productName} x{it.quantity}</span>
                    <span className="font-bold">Rs. {it.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1">
                <div className="flex justify-between font-black text-sm">
                  <span>Grand Total:</span>
                  <span>Rs. {completedOrder.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Method:</span>
                  <span>{completedOrder.paymentMethod}</span>
                </div>
                {completedOrder.fbrInvoiceNumber && (
                  <div className="flex justify-between text-[10px] text-blue-600">
                    <span>FBR POSID:</span>
                    <span>{completedOrder.fbrInvoiceNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-[#2b2b40] mt-4">
              <button
                type="button"
                onClick={() => setCompletedOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center space-x-1"
              >
                <Printer size={13} />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};