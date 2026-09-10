// packages/ui/src/components/expenses/DailyExpenseRoznamchaModal.tsx
import React, { useState } from 'react';
import {
  DollarSign,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  FileSpreadsheet,
  Share2,
  Calendar,
  Layers,
  X,
  Receipt,
  Wallet,
  CheckCircle,
  Truck,
  Coffee,
  Zap,
  Building,
  Wrench
} from 'lucide-react';
import {
  useMasterDataStore,
  ExpenseRecord
} from '../../stores/masterDataStore';
import { useTenantBrandingStore } from '../../theming/tenantBrandingStore';
import { ExcelDataService } from '../excel/excelHub';
import { sanitizePakistaniPhoneNumber } from '../whatsapp/whatsappService';

interface DailyExpenseRoznamchaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyExpenseRoznamchaModal: React.FC<DailyExpenseRoznamchaModalProps> = ({
  isOpen,
  onClose
}) => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  const allExpenses = useMasterDataStore((s) => (s.expenses || []).filter((e) => e.tenantId === activeTenantId || !e.tenantId));
  const addExpense = useMasterDataStore((s) => s.addExpense);
  const deleteExpense = useMasterDataStore((s) => s.deleteExpense);

  const orders = useMasterDataStore((s) => s.orders.filter((o) => o.tenantId === activeTenantId || !o.tenantId));

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<{
    category: ExpenseRecord['category'];
    title: string;
    urduTitle: string;
    amount: string;
    paidTo: string;
    paymentMethod: ExpenseRecord['paymentMethod'];
    receiptNo: string;
    notes: string;
  }>({
    category: 'Labor / Mazdoori',
    title: '',
    urduTitle: '',
    amount: '',
    paidTo: '',
    paymentMethod: 'Cash',
    receiptNo: '',
    notes: ''
  });

  if (!isOpen) return null;

  // Financial Metrics
  const totalSalesRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const estimatedCogs = totalSalesRevenue * 0.85; // Approx 85% COGS benchmark for wholesale/retail
  const grossProfit = totalSalesRevenue - estimatedCogs;
  const totalExpenses = allExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const netStoreProfit = grossProfit - totalExpenses;

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.title || !newExpense.amount) return;

    const exp: ExpenseRecord = {
      id: `exp-${Date.now().toString(36)}`,
      tenantId: activeTenantId,
      category: newExpense.category,
      title: newExpense.title,
      urduTitle: newExpense.urduTitle || newExpense.title,
      amount: parseFloat(newExpense.amount) || 0,
      paidTo: newExpense.paidTo || 'Counter Cash',
      paymentMethod: newExpense.paymentMethod,
      receiptNo: newExpense.receiptNo || `VOC-${Math.floor(1000 + Math.random() * 9000)}`,
      date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      notes: newExpense.notes
    };

    addExpense(exp);
    setIsAddOpen(false);
    setNewExpense({
      category: 'Labor / Mazdoori',
      title: '',
      urduTitle: '',
      amount: '',
      paidTo: '',
      paymentMethod: 'Cash',
      receiptNo: '',
      notes: ''
    });
  };

  const handleExportExcel = () => {
    ExcelDataService.exportExpensesToExcel(
      allExpenses,
      `${profile?.name || 'Store'}_Roznamcha_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const handleShareWhatsApp = () => {
    const dateStr = new Date().toLocaleDateString('en-GB');
    const msg = `*${(profile?.name || 'STORE').toUpperCase()}*
📊 *DAILY ROZNAMCHA & EXPENSE CLOSING / روزنامچہ*
━━━━━━━━━━━━━━━━━━━━
📅 *Date:* ${dateStr}
💵 *Today's Revenue / کل سیل:* Rs. ${totalSalesRevenue.toLocaleString()}
💸 *Total Expenses / کل اخراجات:* Rs. ${totalExpenses.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
📈 *Estimated Gross Margin:* Rs. ${grossProfit.toLocaleString()}
💰 *NET STORE PROFIT (خالص بچت):* *Rs. ${netStoreProfit.toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━
*Recent Expense Entries:*
${allExpenses.slice(0, 5).map((e) => `• ${e.title}: Rs. ${e.amount.toLocaleString()}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━
_Automated Daily Roznamcha Ledger_`;

    const phone = sanitizePakistaniPhoneNumber(profile?.phone || '');
    const url = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const getCategoryIcon = (cat: ExpenseRecord['category']) => {
    switch (cat) {
      case 'Labor / Mazdoori':
        return <Truck size={14} className="text-amber-500" />;
      case 'Tea / Refreshment':
        return <Coffee size={14} className="text-orange-500" />;
      case 'Electricity':
        return <Zap size={14} className="text-yellow-500" />;
      case 'Rent':
        return <Building size={14} className="text-blue-500" />;
      default:
        return <Receipt size={14} className="text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] text-slate-900 dark:text-white transition-all">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-[#2b2b40] flex flex-wrap justify-between items-center gap-2 bg-slate-50/50 dark:bg-[#151521]/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <DollarSign size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Daily Expenses & Roznamcha</span>
                <span className="text-[10px] uppercase font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20">
                  خالص یومیہ بچت
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu">
                دکان و گودام کے روزمرہ اخراجات (مزدوری، کرایہ، چائے، بجلی) اور خالص نفع کا کھاتہ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#2b2b40] text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 transition-colors"
              title="Export to Excel"
            >
              <FileSpreadsheet size={14} className="text-emerald-500" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              title="Share Roznamcha via WhatsApp"
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-slate-100/70 dark:bg-[#151521] border-b border-slate-200 dark:border-[#2b2b40]">
          <div className="bg-white dark:bg-[#1e1e2d] p-3 rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Gross Sales</span>
            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">
              Rs. {totalSalesRevenue.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e2d] p-3 rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Gross Margin (~15%)</span>
            <div className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400 font-mono mt-0.5">
              Rs. {grossProfit.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e2d] p-3 rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-rose-500 block">Total Daily Expenses</span>
            <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
              -Rs. {totalExpenses.toLocaleString()}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e1e2d] p-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Net Store Profit (خالص بچت)</span>
            <div className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              Rs. {netStoreProfit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Content & List Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Expense Records ({allExpenses.length} entries)
            </div>
            <button
              type="button"
              onClick={() => setIsAddOpen(!isAddOpen)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Plus size={14} />
              <span>{isAddOpen ? 'Cancel' : 'Record New Expense (نیا خرچہ)'}</span>
            </button>
          </div>

          {/* New Expense Entry Form */}
          {isAddOpen && (
            <form
              onSubmit={handleSaveExpense}
              className="p-4 bg-slate-50 dark:bg-[#151521] border border-amber-500/30 rounded-2xl space-y-3 animate-fade-in"
            >
              <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1.5">
                <Receipt size={14} />
                <span>Add Expense Voucher / روزنامچہ واؤچر اندراج</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Expense Category / مد</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Labor / Mazdoori">Labor / Mazdoori (مزدوری)</option>
                    <option value="Freight / Transport">Freight / Transport (کرایہ گاڑی)</option>
                    <option value="Tea / Refreshment">Tea / Refreshment (چائے خرچہ)</option>
                    <option value="Electricity">Electricity / WAPDA (بجلی بل)</option>
                    <option value="Rent">Shop / Godown Rent (دکان کرایہ)</option>
                    <option value="Maintenance">Repair / Maintenance (مرمت)</option>
                    <option value="Other">Other Miscellaneous (متفرق)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Title / تفصیل (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Loading Mazdoori 50 bags"
                    value={newExpense.title}
                    onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">اردو تفصیل</label>
                  <input
                    type="text"
                    placeholder="مثلاً لوڈنگ مزدوری 50 بوریاں"
                    value={newExpense.urduTitle}
                    onChange={(e) => setNewExpense({ ...newExpense, urduTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-urdu text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Amount (Rs.) / رقم</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2500"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Paid To / وصول کنندہ</label>
                  <input
                    type="text"
                    placeholder="e.g. Ustad Aslam"
                    value={newExpense.paidTo}
                    onChange={(e) => setNewExpense({ ...newExpense, paidTo: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">Payment Method</label>
                  <select
                    value={newExpense.paymentMethod}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Cash">Cash (نقد)</option>
                    <option value="Bank Transfer">Bank Transfer (بینک)</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Easypaisa">Easypaisa</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1"
                  >
                    <CheckCircle size={14} />
                    <span>Save Voucher</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Expense Entries Table */}
          <div className="border border-slate-200 dark:border-[#2b2b40] rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 dark:bg-[#151521] text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#2b2b40]">
                  <tr>
                    <th className="p-3">Category / مد</th>
                    <th className="p-3">Description / تفصیل</th>
                    <th className="p-3">Paid To</th>
                    <th className="p-3">Method</th>
                    <th className="p-3 text-right">Amount (Rs.)</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]/50 font-medium">
                  {allExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-400">
                        No expense records added yet. Click "Record New Expense" above.
                      </td>
                    </tr>
                  ) : (
                    allExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(exp.category)}
                            <span className="font-bold">{exp.category}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{exp.title}</div>
                          {exp.urduTitle && <div className="text-[11px] font-urdu text-blue-600 dark:text-blue-400">{exp.urduTitle}</div>}
                          <div className="text-[10px] text-slate-400">{exp.date} • Ref: {exp.receiptNo || 'N/A'}</div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300">{exp.paidTo || 'Cash'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {exp.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                          Rs. {exp.amount.toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#151521] border-t border-slate-200 dark:border-[#2b2b40] flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Daily Roznamcha • Real-time Profit & Loss Ledger
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
