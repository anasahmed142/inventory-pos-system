// packages/client-app/src/modules/pos/modes/KiryanaPosView.tsx
import React, { useState } from 'react';
import { useWeightScale } from '@inventory/hardware';
import { BookOpen, Share2, Scale, CheckCircle2, User, Phone, Plus, ShoppingCart, Printer, Trash2 } from 'lucide-react';
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

export const KiryanaPosView: React.FC = () => {
  const scale = useWeightScale({ protocol: 'yaohua_a12', baudRate: 9600, mockMode: true });
  const profile = useTenantBrandingStore((s) => s.profile);
  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  const products = useMasterDataStore((s) => s.products);
  const addKhataEntry = useMasterDataStore((s) => s.addKhataEntry);
  const addOrder = useMasterDataStore((s) => s.addOrder);

  const tenantProducts = products.filter((p) => p.tenantId === activeTenantId || !p.tenantId);

  const [selectedCustomer, setSelectedCustomer] = useState<UnifiedAccount | null>(null);
  const [cart, setCart] = useState<
    Array<{ id: string; nameUr: string; nameEn: string; weightKg: number; rate: number; total: number }>
  >([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const staples = [
    { id: '1', nameUr: 'چینی صافی', nameEn: 'White Sugar', rate: 140, tag: 'Sugar' },
    { id: '2', nameUr: 'سپر باسمتی چاول', nameEn: 'Super Basmati Rice', rate: 340, tag: 'Rice' },
    { id: '3', nameUr: 'چکی خالص آٹا', nameEn: 'Chakki Fresh Aata', rate: 125, tag: 'Flour' },
    { id: '4', nameUr: 'دال چنا اسپیشل', nameEn: 'Daal Chana Special', rate: 260, tag: 'Pulses' },
    { id: '5', nameUr: 'دال مونگ دھلی', nameEn: 'Daal Moong Dhuli', rate: 290, tag: 'Pulses' },
    { id: '6', nameUr: 'کھلا کوکنگ آئل', nameEn: 'Cooking Oil (Loose)', rate: 460, tag: 'Oil' }
  ];

  const grams = Math.round(scale.weightKg * 1000);
  const pao = (scale.weightKg / 0.25).toFixed(1);

  const handleAddStapleToCart = (item: typeof staples[0]) => {
    const effectiveWeight = scale.weightKg > 0 ? scale.weightKg : 1.0;
    const lineTotal = Math.round(effectiveWeight * item.rate);
    const line = {
      id: `kl-${Date.now()}-${Math.random()}`,
      nameUr: item.nameUr,
      nameEn: item.nameEn,
      weightKg: effectiveWeight,
      rate: item.rate,
      total: lineTotal
    };
    setCart((prev) => [line, ...prev]);
  };

  const handleSelectProductFromCombobox = (p: ProductRecord) => {
    const effectiveWeight = scale.weightKg > 0 ? scale.weightKg : 1.0;
    const rate = p.retailPrice;
    const lineTotal = Math.round(effectiveWeight * rate);
    const line = {
      id: `kl-${Date.now()}-${Math.random()}`,
      nameUr: p.urduName || p.name,
      nameEn: p.name,
      weightKg: effectiveWeight,
      rate,
      total: lineTotal
    };
    setCart((prev) => [line, ...prev]);
  };

  const totalCartAmount = cart.reduce((acc, it) => acc + it.total, 0);

  const handleSaveCashSale = () => {
    if (cart.length === 0) return;
    const orderId = `KIR-${Date.now().toString(36).toUpperCase()}`;

    const order: OrderRecord = {
      id: orderId,
      tenantId: activeTenantId,
      customerName: selectedCustomer?.name || 'Walk-in Kiryana Customer',
      customerPhone: selectedCustomer?.phone || '0300-0000000',
      partyId: selectedCustomer?.id,
      partyName: selectedCustomer?.name,
      orderType: 'retail_pos',
      itemCount: cart.length,
      totalAmount: totalCartAmount,
      paidAmount: totalCartAmount,
      paymentMethod: 'Cash',
      dispatchStatus: 'delivered',
      date: new Date().toLocaleDateString(),
      items: cart.map((c) => ({
        id: c.id,
        productName: `${c.nameEn} (${c.nameUr}) - ${c.weightKg.toFixed(2)} KG`,
        quantity: c.weightKg,
        unitPrice: c.rate,
        total: c.total
      }))
    };

    addOrder(order);
    setToastMessage(`Cash sale of Rs. ${totalCartAmount.toLocaleString()} saved to disk!`);
    setCart([]);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePostToUdhaarKhata = () => {
    if (cart.length === 0 || !selectedCustomer || selectedCustomer.id === 'walk-in-cash') {
      alert('Please select a valid customer account to post to Udhaar Khata.');
      return;
    }

    const entry: KhataEntryRecord = {
      id: `ke-${Date.now().toString(36)}`,
      tenantId: activeTenantId,
      partyId: selectedCustomer.id,
      partyName: selectedCustomer.name,
      entryType: 'naam',
      amount: totalCartAmount,
      description: `Kiryana Udhaar Sale (${cart.map((c) => c.nameUr).join(', ')})`,
      urduDescription: `کریانہ راشن ادھار خریداری (${cart.map((c) => c.nameUr).join(', ')})`,
      date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    addKhataEntry(entry);
    setToastMessage(`Posted Rs. ${totalCartAmount.toLocaleString()} to ${selectedCustomer.name}'s Udhaar Khata!`);
    setCart([]);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const sendWhatsAppBill = () => {
    if (!selectedCustomer) return;
    const text = `محترم ${selectedCustomer.name} صاحب! آپ کا آج کا کریانہ بل موصول ہوا۔ سابقہ بقایا: Rs. ${selectedCustomer.balance}۔ انوینٹری سسٹم پر بل اپڈیٹ کر دیا گیا ہے۔ شکریہ!`;
    window.open(`https://wa.me/92${selectedCustomer.phone.replace(/^0/, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-[var(--bg-canvas)] text-[var(--text-main)] overflow-y-auto lg:overflow-hidden font-sans pb-16 md:pb-0">
      {/* Left Column: Product Search Combobox + Quick Staples Cards */}
      <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto space-y-4">
        {/* Customer Account Combobox */}
        <div className="bg-white dark:bg-[#1e1e2d] p-3 rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] shadow-xs">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Customer / Khata Account (گاہک کا کھاتہ منتخب کریں)
          </label>
          <AccountSearchCombobox
            filterType="customer_buyer"
            tenantId={activeTenantId}
            selectedAccountId={selectedCustomer?.id}
            onSelectAccount={(acc) => setSelectedCustomer(acc)}
            placeholder="Search customer account by name, Urdu, or phone..."
          />
        </div>

        {/* Searchable Product Dropdown */}
        <div className="bg-white dark:bg-[#1e1e2d] p-3 rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] shadow-xs">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Search & Add Product from Catalog (پروڈکٹ تلاش کریں)
          </label>
          <ProductSearchCombobox
            products={tenantProducts}
            priceType="retail"
            onSelectProduct={handleSelectProductFromCombobox}
            placeholder="Search packaged items, spices, pulses, rice..."
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base md:text-lg font-bold flex items-center space-x-2 text-slate-900 dark:text-white">
            <Scale className="text-blue-500" size={20} />
            <span>کھلا کریانہ و وزنی اشیاء (Quick Pick Staples)</span>
          </h2>
          <span className="text-xs bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-bold">
            Live Rate Card • Click to Weigh & Add
          </span>
        </div>

        {toastMessage && (
          <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 6 Quick Staples Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {staples.map((item) => {
            const calculatedCost = (scale.weightKg > 0 ? scale.weightKg * item.rate : item.rate).toFixed(2);
            return (
              <button
                key={item.id}
                onClick={() => handleAddStapleToCart(item)}
                className="bg-white dark:bg-[#1e1e2d] hover:border-blue-500 border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-4 text-right flex flex-col justify-between transition-all hover:scale-[1.01] shadow-xs group cursor-pointer"
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    Rs. {item.rate}/KG
                  </span>
                  <span className="text-base md:text-lg font-bold font-urdu text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">
                    {item.nameUr}
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#2b2b40] flex justify-between items-baseline w-full">
                  <span className="text-xs text-slate-500 dark:text-slate-400">{item.nameEn}</span>
                  <span className="text-xs font-extrabold font-mono text-blue-600 dark:text-blue-400">
                    {scale.weightKg > 0 ? `Rs. ${calculatedCost}` : `1 KG = Rs. ${item.rate}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Cart Lines */}
        {cart.length > 0 && (
          <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Weighed & Scanned Items in Bill ({cart.length})
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-[#2b2b40]">
              {cart.map((c, idx) => (
                <div key={c.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white font-urdu text-sm">{c.nameUr}</span>
                    <span className="text-slate-400 font-mono ml-2">({c.weightKg.toFixed(3)} KG @ Rs. {c.rate}/KG)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">Rs. {c.total.toLocaleString()}</span>
                    <button
                      type="button"
                      onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                      className="text-rose-500 hover:text-rose-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Live Scale & Khata Ledger */}
      <div className="w-full lg:w-[380px] bg-white dark:bg-[#1e1e2d] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-[#2b2b40] p-5 md:p-6 flex flex-col justify-between shadow-sm">
        <div className="space-y-4">
          {/* Live Electronic Scale Indicator */}
          <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-2xl p-5 text-center shadow-xs">
            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest block">
              الیکٹرانک کانٹا (Live Scale Indicator)
            </span>
            <div className="text-4xl md:text-5xl font-mono font-black text-slate-900 dark:text-white mt-2">
              {scale.weightKg.toFixed(3)} <span className="text-lg text-blue-500 font-bold">KG</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-[#2b2b40] text-xs font-mono text-slate-600 dark:text-slate-300">
              <div className="bg-white dark:bg-[#1e1e2d] p-1.5 rounded-lg border border-slate-200 dark:border-[#2b2b40]">
                {grams} Grams (گرام)
              </div>
              <div className="bg-white dark:bg-[#1e1e2d] p-1.5 rounded-lg border border-slate-200 dark:border-[#2b2b40]">
                {pao} Pao (پاؤ)
              </div>
            </div>
          </div>

          {/* Active Khata Customer Info */}
          <div className="bg-slate-50 dark:bg-[#151521] rounded-2xl p-4 border border-slate-200 dark:border-[#2b2b40] text-right shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                کھاتہ دار پروفائل
              </span>
              <span className="text-xs text-slate-400 font-mono">{selectedCustomer?.phone || 'Cash Counter'}</span>
            </div>

            <div className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white">
              {selectedCustomer?.name || 'Walk-in Cash Customer'}
            </div>
            <div className="text-xs text-slate-400 font-urdu mt-0.5">{selectedCustomer?.urduName}</div>

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-[#2b2b40] flex justify-between items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">موجودہ بقایا کھاتہ:</span>
              <span className="text-base font-mono font-bold text-rose-600 dark:text-rose-400">
                Rs. {Math.abs(selectedCustomer?.balance || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Net Bill Card */}
          <div className="bg-slate-50 dark:bg-[#151521] p-4 rounded-2xl border border-slate-200 dark:border-[#2b2b40] text-right">
            <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">Current Weighed Bill / کل بل:</span>
            <div className="text-3xl font-mono font-black text-blue-600 dark:text-blue-400 mt-1">
              Rs. {totalCartAmount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSaveCashSale}
              disabled={cart.length === 0}
              className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            >
              <ShoppingCart size={14} />
              <span>نقد بل (Cash Sale)</span>
            </button>

            <button
              onClick={handlePostToUdhaarKhata}
              disabled={cart.length === 0}
              className="py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            >
              <BookOpen size={14} />
              <span>ادھار کھاتہ (Udhaar)</span>
            </button>
          </div>

          <button
            onClick={sendWhatsAppBill}
            disabled={!selectedCustomer}
            className="w-full py-2.5 bg-slate-100 dark:bg-[#151521] hover:bg-slate-200 dark:hover:bg-[#2b2b40] text-emerald-700 dark:text-emerald-400 font-bold rounded-xl text-xs border border-slate-200 dark:border-[#2b2b40] flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
          >
            <Share2 size={14} />
            <span>Send WhatsApp Bill (واٹس ایپ رسید)</span>
          </button>
        </div>
      </div>
    </div>
  );
};