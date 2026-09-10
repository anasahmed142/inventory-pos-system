// packages/client-app/src/modules/pos/modes/MandiAgriPosView.tsx
import React, { useState } from 'react';
import { Truck, Calculator, Printer, Scale, CheckCircle2, BookOpen, Layers, Users, Sparkles } from 'lucide-react';
import {
  useTenantBrandingStore,
  useMasterDataStore,
  OrderRecord,
  KhataEntryRecord,
  AccountSearchCombobox,
  ProductSearchCombobox,
  UnifiedAccount,
  DocumentPrintModal
} from '@inventory/ui';

export const MandiAgriPosView: React.FC = () => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  const products = useMasterDataStore((s) => s.products);
  const addOrder = useMasterDataStore((s) => s.addOrder);
  const addKhataEntry = useMasterDataStore((s) => s.addKhataEntry);
  const addKhataParty = useMasterDataStore((s) => s.addKhataParty);
  const khataParties = useMasterDataStore((s) => s.khataParties);

  const [selectedGrower, setSelectedGrower] = useState<UnifiedAccount | null>(null);
  const [commodity, setCommodity] = useState('گندم (Wheat 2026 Season)');
  const [growerName, setGrowerName] = useState('حاجی ریاض احمد (زمیندار)');
  const [growerPhone, setGrowerPhone] = useState('0301-7654321');
  const [bagCount, setBagCount] = useState<number>(120);
  const [grossWeightKg, setGrossWeightKg] = useState<number>(6120);
  const [tarePerBagKg, setTarePerBagKg] = useState<number>(1.0);
  const [ratePerMann, setRatePerMann] = useState<number>(3900);
  const [arhatCommissionPct, setArhatCommissionPct] = useState<number>(1.5);
  const [mazdooriPerBag, setMazdooriPerBag] = useState<number>(35);
  const [kantaFee, setKantaFee] = useState<number>(200);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Document Print Modal State
  const [printedOrder, setPrintedOrder] = useState<OrderRecord | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const totalTareKg = bagCount * tarePerBagKg;
  const netWeightKg = Math.max(0, grossWeightKg - totalTareKg);
  const netMann = netWeightKg / 40.0;
  const grossValue = netMann * ratePerMann;
  const commission = (grossValue * arhatCommissionPct) / 100.0;
  const totalMazdoori = bagCount * mazdooriPerBag;
  const totalDeductions = commission + totalMazdoori + kantaFee;
  const finalPayable = Math.round(Math.max(0, grossValue - totalDeductions));

  const handleSaveMandiPayout = () => {
    const orderId = `MND-${Date.now().toString(36).toUpperCase()}`;

    // 1. Save Mandi Purchase Order
    const order: OrderRecord = {
      id: orderId,
      tenantId: activeTenantId,
      customerName: growerName,
      customerPhone: growerPhone,
      orderType: 'wholesale_dist',
      itemCount: bagCount,
      totalAmount: finalPayable,
      paidAmount: finalPayable,
      paymentMethod: 'Cash',
      dispatchStatus: 'delivered',
      date: new Date().toLocaleDateString(),
      items: [
        {
          id: `mi-1`,
          productName: `${commodity} (${bagCount} Bags, ${netWeightKg.toFixed(1)} KG, ${netMann.toFixed(2)} Mann)`,
          quantity: netMann,
          unitPrice: ratePerMann,
          total: grossValue
        }
      ]
    };

    addOrder(order);

    // 2. Ensure party exists or link
    let matchedParty = khataParties.find((p) => p.name === growerName || p.phone === growerPhone);
    let partyId = matchedParty?.id;

    if (!matchedParty) {
      partyId = `kp-grower-${Date.now().toString(36)}`;
      addKhataParty({
        id: partyId,
        tenantId: activeTenantId,
        name: growerName,
        urduName: growerName,
        phone: growerPhone,
        partyType: 'supplier',
        balance: 0,
        lastEntryDate: 'Today'
      });
    }

    // 3. Post Jama (Credit payable to grower)
    if (partyId) {
      const entry: KhataEntryRecord = {
        id: `ke-mandi-${Date.now().toString(36)}`,
        tenantId: activeTenantId,
        partyId,
        partyName: growerName,
        entryType: 'jama',
        amount: finalPayable,
        description: `Mandi Purchase: ${commodity} (${netMann.toFixed(2)} Mann, ${bagCount} Bags)`,
        urduDescription: `منڈی خریداری کانٹا: ${commodity} (${netMann.toFixed(2)} من، ${bagCount} بوری)`,
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      };
      addKhataEntry(entry);
    }

    setPrintedOrder(order);
    setToastMessage(`غلہ منڈی کانٹا پرچی محفوظ ہو گئی! Rs. ${finalPayable.toLocaleString()} زمیندار کے کھاتے میں جمع کر دی گئی۔`);
    setTimeout(() => setToastMessage(null), 4500);
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-[var(--bg-canvas)] text-[var(--text-main)] overflow-y-auto lg:overflow-hidden font-sans pb-16 md:pb-0">
      {/* Left Column: Mandi Weighment Calculation Matrix */}
      <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto space-y-4 md:space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base md:text-lg font-bold flex items-center space-x-2 text-slate-900 dark:text-white">
              <Scale className="text-amber-500" size={22} />
              <span>غلہ منڈی الیکٹرانک کانٹا و آڑھت خریداری (Mandi Kanta & Arhat Hub)</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Electronic scale weighing, 40 KG Mann calculation, Bardana tare deduction, Arhat commission %, and Farmer ledger sync.
            </p>
          </div>
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold flex items-center space-x-1.5">
            <span>⚖️ 1 MANN = 40.00 KG (من)</span>
          </span>
        </div>

        {toastMessage && (
          <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-bold animate-fade-in">
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Searchable Autocomplete Dropdowns for Farmer & Commodity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-4 shadow-sm">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Users size={14} className="text-amber-500" />
                <span>زمیندار / کاشتکار کا انتخاب (Farmer / Grower Search)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Bahi-Khata Linked</span>
            </label>
            <AccountSearchCombobox
              tenantId={activeTenantId}
              filterType="supplier"
              selectedAccountId={selectedGrower?.id}
              onSelectAccount={(acc) => {
                setSelectedGrower(acc);
                if (acc) {
                  setGrowerName(acc.name);
                  setGrowerPhone(acc.phone || '');
                }
              }}
              placeholder="Search farmer / zamindar name, phone, or village..."
            />
          </div>

          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-4 shadow-sm">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Layers size={14} className="text-blue-500" />
                <span>جنس / بیج کی ورائٹی (Commodity / Crop Search)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Mandi Catalog</span>
            </label>
            <ProductSearchCombobox
              products={products.filter((p) => p.tenantId === activeTenantId || !p.tenantId)}
              priceType="cost"
              onSelectProduct={(p) => {
                setCommodity(p.urduName ? `${p.name} (${p.urduName})` : p.name);
                if (p.costPrice) {
                  setRatePerMann(p.costPrice);
                }
              }}
              placeholder="Select crop (Wheat, Rice, Corn, Seed bags)..."
            />
          </div>
        </div>

        {/* 8-Parameter Electronic Scale Calculation Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm text-right">
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">جنس نام (Commodity)</label>
            <input
              type="text"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-2.5 text-xs text-right focus:border-[var(--primary)] outline-none text-slate-900 dark:text-slate-100 font-urdu"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">زمیندار نام (Grower Name)</label>
            <input
              type="text"
              value={growerName}
              onChange={(e) => setGrowerName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-2.5 text-xs text-right focus:border-[var(--primary)] outline-none text-slate-900 dark:text-slate-100 font-urdu"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">تعداد بوریاں (Bags Count)</label>
            <input
              type="number"
              value={bagCount}
              onChange={(e) => setBagCount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-2.5 text-xs font-mono font-bold focus:border-[var(--primary)] outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">مجموعی وزن کانٹا (Gross KG)</label>
            <input
              type="number"
              value={grossWeightKg}
              onChange={(e) => setGrossWeightKg(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-2.5 text-xs font-mono font-bold text-amber-600 dark:text-amber-400 focus:border-[var(--primary)] outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">کاٹ / بوری باردانہ (Tare/Bag KG)</label>
            <input
              type="number"
              step="0.1"
              value={tarePerBagKg}
              onChange={(e) => setTarePerBagKg(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-2.5 text-xs font-mono focus:border-[var(--primary)] outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">ریٹ فی من (Rate / 40 KG)</label>
            <input
              type="number"
              value={ratePerMann}
              onChange={(e) => setRatePerMann(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:border-[var(--primary)] outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">کمیشن آڑھت % (Arhat %)</label>
            <input
              type="number"
              step="0.1"
              value={arhatCommissionPct}
              onChange={(e) => setArhatCommissionPct(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-2.5 text-xs font-mono focus:border-[var(--primary)] outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">مزدوری فی بوری (Mazdoori/Bag)</label>
            <input
              type="number"
              value={mazdooriPerBag}
              onChange={(e) => setMazdooriPerBag(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-2.5 text-xs font-mono focus:border-[var(--primary)] outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Live Weight Slip Preview */}
        <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200/80 dark:border-[#2b2b40] rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Mandi Weighment Slip Breakdown / تفصیلی وزن پرچی
            </h3>
            {printedOrder && (
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center space-x-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl font-bold shadow-xs transition-all"
              >
                <Printer size={13} />
                <span>Print Official Slip (A4 / A5 / 80mm)</span>
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-50 dark:bg-[#151521] p-3 rounded-xl border border-slate-200 dark:border-[#2b2b40]">
              <span className="text-slate-400 block text-[10px]">صافی وزن (Net KG):</span>
              <strong className="text-slate-900 dark:text-white text-sm">{netWeightKg.toFixed(1)} KG</strong>
              <div className="text-[10px] text-slate-400 mt-0.5">باردانہ کٹوتی: -{totalTareKg.toFixed(1)} KG</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#151521] p-3 rounded-xl border border-slate-200 dark:border-[#2b2b40]">
              <span className="text-slate-400 block text-[10px]">کل وزن من (Net Mann):</span>
              <strong className="text-amber-600 dark:text-amber-400 text-sm">{netMann.toFixed(2)} من</strong>
              <div className="text-[10px] text-slate-400 mt-0.5">@ Rs. {ratePerMann}/من</div>
            </div>
            <div className="bg-slate-50 dark:bg-[#151521] p-3 rounded-xl border border-slate-200 dark:border-[#2b2b40]">
              <span className="text-slate-400 block text-[10px]">مجموعی مالیت (Gross):</span>
              <strong className="text-slate-900 dark:text-white text-sm">Rs. {Math.round(grossValue).toLocaleString()}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-[#151521] p-3 rounded-xl border border-slate-200 dark:border-[#2b2b40]">
              <span className="text-slate-400 block text-[10px]">کل کٹوتیاں (Deductions):</span>
              <strong className="text-rose-600 dark:text-rose-400 text-sm">Rs. {Math.round(totalDeductions).toLocaleString()}</strong>
              <div className="text-[10px] text-slate-400 mt-0.5">آڑھت + مزدوری + چونگی</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Payout Summary & Save */}
      <div className="w-full lg:w-[380px] bg-white dark:bg-[#1e1e2d] border-t lg:border-t-0 lg:border-l border-slate-200/80 dark:border-[#2b2b40] p-5 md:p-6 flex flex-col justify-between shadow-sm">
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-2xl p-5 text-right shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              صافی قابل ادائیگی رقم (Net Mandi Payout)
            </span>
            <div className="text-3xl md:text-4xl font-mono font-black text-slate-900 dark:text-white mt-1">
              Rs. {finalPayable.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-urdu mt-2">
              بنام: {growerName} ({netMann.toFixed(2)} من {commodity})
            </div>
          </div>

          {/* Deduction Breakdown Details */}
          <div className="bg-slate-50 dark:bg-[#151521] rounded-2xl p-4 border border-slate-200 dark:border-[#2b2b40] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Gross Valuation (مجموعی رقم):</span>
              <span className="font-bold text-slate-900 dark:text-white">Rs. {Math.round(grossValue).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Arhat Comm. ({arhatCommissionPct}% آڑھت):</span>
              <span className="text-rose-600 dark:text-rose-400">- Rs. {Math.round(commission).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Mazdoori ({bagCount} Bags پلے داری):</span>
              <span className="text-rose-600 dark:text-rose-400">- Rs. {totalMazdoori.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Kanta Fee (چونگی کانٹا):</span>
              <span className="text-rose-600 dark:text-rose-400">- Rs. {kantaFee.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-[#2b2b40] flex justify-between font-bold text-slate-900 dark:text-white text-sm">
              <span>Net Payable to Grower (صافی ادائیگی):</span>
              <span className="text-amber-600 dark:text-amber-400">Rs. {finalPayable.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          <button
            onClick={handleSaveMandiPayout}
            className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-xl text-xs md:text-sm shadow-sm flex items-center justify-center space-x-2 transition-all"
          >
            <Calculator size={16} />
            <span>Save Payout & Post to Khata (محفوظ کریں)</span>
          </button>
        </div>
      </div>

      {/* Official Printable Slip Modal */}
      {isPrintModalOpen && printedOrder && (
        <DocumentPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          order={printedOrder}
          initialMode="invoice"
        />
      )}
    </div>
  );
};