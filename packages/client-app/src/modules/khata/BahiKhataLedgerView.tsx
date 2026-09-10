// packages/client-app/src/modules/khata/BahiKhataLedgerView.tsx
import React, { useState } from 'react';
import { BookOpen, Plus, Search, Share2, ArrowDownLeft, ArrowUpRight, User, Phone, Wallet, Calendar, Trash2 } from 'lucide-react';
import { PartyType, LedgerEntryType } from '@inventory/shared-types';
import { useTenantBrandingStore } from '@inventory/ui';
import { useMasterDataStore, KhataPartyRecord, KhataEntryRecord } from '../../stores/useMasterDataStore';

export const BahiKhataLedgerView: React.FC = () => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  // Persistent Master Store
  const allParties = useMasterDataStore((s) => s.khataParties);
  const allEntries = useMasterDataStore((s) => s.khataEntries);
  const addKhataParty = useMasterDataStore((s) => s.addKhataParty);
  const deleteKhataParty = useMasterDataStore((s) => s.deleteKhataParty);
  const addKhataEntry = useMasterDataStore((s) => s.addKhataEntry);
  const deleteKhataEntry = useMasterDataStore((s) => s.deleteKhataEntry);

  const parties = allParties.filter((p) => p.tenantId === activeTenantId || !p.tenantId);
  const entries = allEntries.filter((e) => e.tenantId === activeTenantId || !e.tenantId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[0]?.id || '');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const selectedParty = parties.find((p) => p.id === selectedPartyId) || parties[0] || null;

  // New Party Modal State
  const [isNewPartyOpen, setIsNewPartyOpen] = useState(false);
  const [newParty, setNewParty] = useState<{
    name: string;
    urduName: string;
    phone: string;
    partyType: PartyType;
    initialBalance: number;
  }>({
    name: '',
    urduName: '',
    phone: '',
    partyType: 'customer',
    initialBalance: 0
  });

  // Post Entry Modal State
  const [isPostingModalOpen, setIsPostingModalOpen] = useState(false);
  const [postAmount, setPostAmount] = useState('');
  const [postType, setPostType] = useState<LedgerEntryType>('naam');
  const [postDesc, setPostDesc] = useState('');
  const [postUrduDesc, setPostUrduDesc] = useState('');

  const filteredParties = parties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.urduName.includes(searchQuery) ||
      p.phone.includes(searchQuery)
  );

  const totalReceivables = parties.filter((p) => p.balance > 0).reduce((acc, p) => acc + p.balance, 0);
  const totalPayables = Math.abs(parties.filter((p) => p.balance < 0).reduce((acc, p) => acc + p.balance, 0));

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParty.name) return;
    const p: KhataPartyRecord = {
      id: `kp-${Date.now().toString(36)}`,
      tenantId: activeTenantId,
      name: newParty.name,
      urduName: newParty.urduName || newParty.name,
      phone: newParty.phone || '0300-0000000',
      partyType: newParty.partyType,
      balance: Number(newParty.initialBalance) || 0,
      lastEntryDate: 'Today'
    };

    addKhataParty(p);
    setSelectedPartyId(p.id);
    setMobileView('detail');
    setIsNewPartyOpen(false);
    setNewParty({ name: '', urduName: '', phone: '', partyType: 'customer', initialBalance: 0 });
  };

  const handleRecordTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParty || !postAmount) return;
    const amountNum = parseFloat(postAmount);

    const entry: KhataEntryRecord = {
      id: `ke-${Date.now().toString(36)}`,
      tenantId: activeTenantId,
      partyId: selectedParty.id,
      partyName: selectedParty.name,
      entryType: postType,
      amount: amountNum,
      description: postDesc || (postType === 'naam' ? 'Udhaar Sale' : 'Cash Received'),
      urduDescription: postUrduDesc || (postType === 'naam' ? 'ادھار مال دیا' : 'رقم موصول ہوئی'),
      date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    };

    addKhataEntry(entry);
    setIsPostingModalOpen(false);
    setPostAmount('');
    setPostDesc('');
    setPostUrduDesc('');
  };

  const handleShareWhatsApp = (party: KhataPartyRecord) => {
    const isReceivable = party.balance >= 0;
    const balanceText = `Rs. ${Math.abs(party.balance).toLocaleString()}`;
    const statusText = isReceivable ? 'واجب الوصول (باقی رقم)' : 'واجب الاداء (جمع شدہ رقم)';
    const text = `محترم جناب ${party.name} صاحب!%0Aآپ کے کھاتے کا موجودہ بیلنس ${balanceText} (${statusText}) ہے۔%0Aشکریہ!`;
    const cleanPhone = party.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/92${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  const selectedPartyEntries = entries
    .filter((e) => e.partyId === selectedParty?.id)
    .sort((a, b) => b.id.localeCompare(a.id));

  return (
    <div className="flex-1 bg-[var(--bg-canvas)] text-[var(--text-main)] flex flex-col overflow-hidden font-sans">
      {/* Top Ledger Header & Aggregate Metrics */}
      <div className="bg-[var(--bg-card)] border-b border-slate-200/80 dark:border-[#2b2b40] p-4 md:p-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="text-[var(--primary)]" size={24} />
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                روایتی ڈیجیٹل بہی کھاتہ (Bahi-Khata Ledger)
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Double-entry customer, buyer & supplier credit tracking with instant WhatsApp slips.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            {/* Total Receivables (Naam) */}
            <div className="bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-3 md:px-5 md:py-3 text-right">
              <div className="text-[10px] md:text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center justify-end space-x-1">
                <ArrowUpRight size={13} />
                <span>کل ادھار وصولی (Naam)</span>
              </div>
              <div className="text-base md:text-lg font-mono font-black text-slate-900 dark:text-white">
                Rs. {totalReceivables.toLocaleString()}
              </div>
            </div>

            {/* Total Payables (Jama) */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-3 md:px-5 md:py-3 text-right">
              <div className="text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-end space-x-1">
                <ArrowDownLeft size={13} />
                <span>کل واجب الاداء (Jama)</span>
              </div>
              <div className="text-base md:text-lg font-mono font-black text-slate-900 dark:text-white">
                Rs. {totalPayables.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-7xl mx-auto w-full p-3 md:p-6 gap-4 md:gap-5">
        {/* Left Column: Party Directory (Hidden on mobile if viewing details) */}
        <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] flex flex-col overflow-hidden shadow-sm ${
          mobileView === 'detail' ? 'hidden md:flex' : 'flex'
        }`}>
          <div className="p-3 md:p-4 border-b border-slate-200/80 dark:border-[#2b2b40] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Khata Accounts ({filteredParties.length})
              </span>
              <button
                onClick={() => setIsNewPartyOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm flex items-center space-x-1 transition-all"
              >
                <Plus size={13} />
                <span>+ New Account</span>
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search party (Name / Phone)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2b2b40] p-2 space-y-1">
            {filteredParties.map((p) => {
              const isSelected = selectedParty?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedPartyId(p.id);
                    setMobileView('detail');
                  }}
                  className={`w-full p-3 rounded-xl text-left transition-all flex justify-between items-center ${
                    isSelected
                      ? 'bg-[var(--primary-subtle)] border border-[var(--primary)]/30'
                      : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30 border border-transparent'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">{p.name}</div>
                    <div className="text-xs text-[var(--primary)] font-urdu mt-0.5">{p.urduName}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.phone}</div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`font-mono font-extrabold text-xs md:text-sm ${
                        p.balance >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      Rs. {Math.abs(p.balance).toLocaleString()}
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        p.balance >= 0 ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      }`}
                    >
                      {p.balance >= 0 ? 'نام (Naam)' : 'جمع (Jama)'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Party Ledger & Actions (Full width on mobile when in detail mode) */}
        {selectedParty ? (
          <div className={`flex-1 bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] flex flex-col overflow-y-auto shadow-sm p-4 md:p-6 justify-between ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}>
            <div>
              {/* Mobile Back Button */}
              <div className="md:hidden mb-3 pb-2 border-b border-slate-100 dark:border-[#2b2b40]">
                <button
                  onClick={() => setMobileView('list')}
                  className="flex items-center space-x-1 text-xs font-bold text-blue-500 hover:text-blue-600"
                >
                  <span>← Back to Accounts (کھاتہ دار لسٹ)</span>
                </button>
              </div>

              <div className="flex flex-wrap justify-between items-start pb-5 border-b border-slate-200/80 dark:border-[#2b2b40] gap-4">
                <div className="flex items-start space-x-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">{selectedParty.name}</h2>
                      <span className="bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold border border-slate-200 dark:border-[#2b2b40]">
                        {selectedParty.partyType}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete party account "${selectedParty.name}"?`)) {
                            deleteKhataParty(selectedParty.id);
                            setSelectedPartyId('');
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Party Account"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-sm md:text-base text-[var(--primary)] font-urdu font-bold mt-1">
                      {selectedParty.urduName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1 flex items-center space-x-2">
                      <Phone size={13} className="text-slate-400" />
                      <span>{selectedParty.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-3.5 text-right">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase block">
                    موجودہ کھاتہ بیلنس (Current Net Balance)
                  </span>
                  <div
                    className={`text-2xl md:text-3xl font-mono font-black mt-1 ${
                      selectedParty.balance >= 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    Rs. {Math.abs(selectedParty.balance).toLocaleString()}
                  </div>
                  <span className="text-xs font-bold font-urdu text-slate-500 dark:text-slate-400">
                    {selectedParty.balance >= 0 ? 'واجب الوصول (نام)' : 'واجب الاداء (جمع)'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap space-x-0 sm:space-x-3 gap-2 sm:gap-0 my-5">
                <button
                  onClick={() => {
                    setPostType('naam');
                    setIsPostingModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                >
                  <ArrowUpRight size={15} />
                  <span>نام لکھیں (Debit / ادھار دیا)</span>
                </button>

                <button
                  onClick={() => {
                    setPostType('jama');
                    setIsPostingModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                >
                  <ArrowDownLeft size={15} />
                  <span>جمع کریں (Credit / رقم موصول ہوئی)</span>
                </button>

                <button
                  onClick={() => handleShareWhatsApp(selectedParty)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Share2 size={14} />
                  <span>WhatsApp Slip</span>
                </button>
              </div>

              {/* Chronological Transaction History */}
              <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl p-4 space-y-2.5">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  حالیہ کھاتہ اندراجات (Transaction History)
                </div>
                <div className="divide-y divide-slate-200 dark:divide-[#2b2b40] text-xs max-h-56 overflow-y-auto">
                  {selectedPartyEntries.length > 0 ? (
                    selectedPartyEntries.map((entry) => (
                      <div key={entry.id} className="py-2.5 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{entry.description}</div>
                          <div className="text-[11px] text-[var(--primary)] font-urdu">{entry.urduDescription}</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div
                              className={`font-mono font-bold ${
                                entry.entryType === 'naam' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {entry.entryType === 'naam' ? '+ ' : '- '}
                              Rs. {entry.amount.toLocaleString()} ({entry.entryType === 'naam' ? 'نام' : 'جمع'})
                            </div>
                            <div className="text-[10px] text-slate-400">{entry.date}</div>
                          </div>
                          <button
                            onClick={() => deleteKhataEntry(entry.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                            title="Delete Transaction Entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No transactions recorded yet for this account.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 text-center text-[11px] text-slate-400">
              Double-Entry ACID Guaranteed Ledger • Persistent Local Database
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-white dark:bg-[#1e1e2d] rounded-2xl border border-slate-200/80 dark:border-[#2b2b40] flex items-center justify-center text-slate-400 text-sm">
            Select a Khata account or click "+ New Account" to view transactions.
          </div>
        )}
      </div>

      {/* MODAL: NEW KHATA ACCOUNT */}
      {isNewPartyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <User size={18} className="text-[var(--primary)]" />
              <span>نیا کھاتہ دار اکاؤنٹ بنائیں (New Account)</span>
            </h3>

            <form onSubmit={handleCreateParty} className="space-y-4">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Account Holder Name (English)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Haji Munir Ahmed"
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Urdu Name (اردو نام)</label>
                <input
                  type="text"
                  placeholder="مثلاً حاجی منیر احمد"
                  value={newParty.urduName}
                  onChange={(e) => setNewParty({ ...newParty, urduName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 text-right font-urdu outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newParty.phone}
                    onChange={(e) => setNewParty({ ...newParty, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Account Type</label>
                  <select
                    value={newParty.partyType}
                    onChange={(e) => setNewParty({ ...newParty, partyType: e.target.value as PartyType })}
                    className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                  >
                    <option value="customer">Customer (گاہک)</option>
                    <option value="supplier">Supplier (سپلائر)</option>
                    <option value="zamindar">Zamindar / Grower (زمیندار)</option>
                    <option value="beopari">Beopari (بیوپاری)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Starting Balance (Rs.)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={newParty.initialBalance}
                  onChange={(e) => setNewParty({ ...newParty, initialBalance: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPartyOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSACTION POSTING */}
      {isPostingModalOpen && selectedParty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen size={18} className="text-[var(--primary)]" />
              <span>کھاتہ میں نیا اندراج (Post Transaction)</span>
            </h3>
            <div className="text-xs text-[var(--primary)] font-bold">{selectedParty.name} ({selectedParty.urduName})</div>

            <form onSubmit={handleRecordTransaction} className="space-y-4">
              <div className="flex rounded-xl bg-slate-100 dark:bg-[#151521] p-1 border border-slate-200 dark:border-[#2b2b40]">
                <button
                  type="button"
                  onClick={() => setPostType('naam')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    postType === 'naam' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  نام لکھیں (Debit / ادھار مال)
                </button>
                <button
                  type="button"
                  onClick={() => setPostType('jama')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    postType === 'jama' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  جمع کریں (Credit / ادائیگی)
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Amount / رقم (Rs.)</label>
                <input
                  type="number"
                  required
                  placeholder="0.00"
                  value={postAmount}
                  onChange={(e) => setPostAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3.5 py-2.5 text-base font-mono font-bold text-slate-900 dark:text-slate-100 focus:border-[var(--primary)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Remarks (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Cash recovery at shop"
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:border-[var(--primary)] outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Remarks (اردو تفصیل)</label>
                <input
                  type="text"
                  placeholder="مثلاً دوکان پر نقد وصولی"
                  value={postUrduDesc}
                  onChange={(e) => setPostUrduDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 text-right font-urdu focus:border-[var(--primary)] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPostingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#151521] text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-sm"
                >
                  Save Entry / محفوظ کریں
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
