// packages/ui/src/components/combobox/AccountSearchCombobox.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Search, User, Phone, MapPin, Plus, Check, ChevronDown, UserCheck, ShieldCheck, X } from 'lucide-react';
import { KhataPartyRecord, VendorRecord, useMasterDataStore } from '../../stores/masterDataStore';

export interface UnifiedAccount {
  id: string;
  name: string;
  urduName: string;
  phone: string;
  city?: string;
  accountType: 'customer' | 'wholesale_buyer' | 'supplier' | 'beopari' | 'zamindar';
  balance: number; // +ve Dr/Receivable or Payable
  source: 'khata' | 'vendor';
}

export interface AccountSearchComboboxProps {
  selectedAccountId?: string;
  filterType?: 'all' | 'customer_buyer' | 'supplier';
  onSelectAccount: (account: UnifiedAccount) => void;
  placeholder?: string;
  tenantId?: string;
  className?: string;
}

export const AccountSearchCombobox: React.FC<AccountSearchComboboxProps> = ({
  selectedAccountId,
  filterType = 'all',
  onSelectAccount,
  placeholder = 'Select or search customer / party / supplier account...',
  tenantId = 'tenant-madina-01',
  className = ''
}) => {
  const khataParties = useMasterDataStore((s) => s.khataParties);
  const vendors = useMasterDataStore((s) => s.vendors);
  const addKhataParty = useMasterDataStore((s) => s.addKhataParty);
  const addVendor = useMasterDataStore((s) => s.addVendor);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyUrdu, setNewPartyUrdu] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newPartyCity, setNewPartyCity] = useState('');
  const [newPartyType, setNewPartyType] = useState<'customer' | 'wholesale_buyer' | 'supplier'>('customer');

  const containerRef = useRef<HTMLDivElement>(null);

  // Unify accounts from Khata and Vendors
  const allAccounts: UnifiedAccount[] = [
    {
      id: 'walk-in-cash',
      name: 'Walk-in Cash Customer (عام گاہک)',
      urduName: 'عام نقد خریدار',
      phone: '0300-0000000',
      city: 'Local Counter',
      accountType: 'customer',
      balance: 0,
      source: 'khata'
    },
    ...khataParties
      .filter((p) => p.tenantId === tenantId || !p.tenantId)
      .map((p) => ({
        id: p.id,
        name: p.name,
        urduName: p.urduName,
        phone: p.phone,
        city: 'Local',
        accountType: p.partyType === 'supplier' ? ('supplier' as const) : ('customer' as const),
        balance: p.balance,
        source: 'khata' as const
      })),
    ...(vendors || [])
      .filter((v) => v.tenantId === tenantId || !v.tenantId)
      .map((v) => ({
        id: v.id,
        name: v.name,
        urduName: v.urduName,
        phone: v.phone,
        city: v.city,
        accountType: v.vendorType === 'supplier' ? ('supplier' as const) : ('wholesale_buyer' as const),
        balance: v.balance,
        source: 'vendor' as const
      }))
  ];

  // Filter based on filterType
  const filteredByType = allAccounts.filter((acc) => {
    if (filterType === 'customer_buyer') {
      return acc.accountType === 'customer' || acc.accountType === 'wholesale_buyer' || acc.id === 'walk-in-cash';
    }
    if (filterType === 'supplier') {
      return acc.accountType === 'supplier';
    }
    return true;
  });

  const searchedAccounts = filteredByType.filter((acc) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      acc.name.toLowerCase().includes(q) ||
      (acc.urduName && acc.urduName.includes(q)) ||
      (acc.phone && acc.phone.includes(q)) ||
      (acc.city && acc.city.toLowerCase().includes(q))
    );
  });

  const selectedAccount = allAccounts.find((a) => a.id === selectedAccountId) || allAccounts[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (account: UnifiedAccount) => {
    onSelectAccount(account);
    setIsOpen(false);
    setQuery('');
  };

  const handleCreateQuickParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;

    if (newPartyType === 'supplier' || newPartyType === 'wholesale_buyer') {
      const newVendorRecord: VendorRecord = {
        id: `v-${Date.now().toString(36)}`,
        tenantId,
        name: newPartyName.trim(),
        urduName: newPartyUrdu.trim() || newPartyName.trim(),
        phone: newPartyPhone.trim() || '0300-0000000',
        city: newPartyCity.trim() || 'Pakistan',
        vendorType: newPartyType === 'supplier' ? 'supplier' : 'buyer',
        balance: 0
      };
      addVendor(newVendorRecord);
      const unified: UnifiedAccount = {
        id: newVendorRecord.id,
        name: newVendorRecord.name,
        urduName: newVendorRecord.urduName,
        phone: newVendorRecord.phone,
        city: newVendorRecord.city,
        accountType: newPartyType,
        balance: 0,
        source: 'vendor'
      };
      handleSelect(unified);
    } else {
      const newPartyRecord: KhataPartyRecord = {
        id: `kp-${Date.now().toString(36)}`,
        tenantId,
        name: newPartyName.trim(),
        urduName: newPartyUrdu.trim() || newPartyName.trim(),
        phone: newPartyPhone.trim() || '0300-0000000',
        partyType: 'customer',
        balance: 0,
        lastEntryDate: 'New'
      };
      addKhataParty(newPartyRecord);
      const unified: UnifiedAccount = {
        id: newPartyRecord.id,
        name: newPartyRecord.name,
        urduName: newPartyRecord.urduName,
        phone: newPartyRecord.phone,
        city: 'Local',
        accountType: 'customer',
        balance: 0,
        source: 'khata'
      };
      handleSelect(unified);
    }

    setIsQuickAddOpen(false);
    setNewPartyName('');
    setNewPartyUrdu('');
    setNewPartyPhone('');
  };

  const getAccountBadge = (acc: UnifiedAccount) => {
    switch (acc.accountType) {
      case 'supplier':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Supplier / سپلائر</span>;
      case 'wholesale_buyer':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">Wholesale Buyer / تھوک خریدار</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">Customer / کھاتہ دار</span>;
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Selected Account Trigger Card */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
            <User size={16} />
          </div>
          <div className="text-left truncate">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                {selectedAccount?.name || 'Walk-in Cash Customer'}
              </span>
              {selectedAccount && getAccountBadge(selectedAccount)}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400 truncate">
              <span className="font-urdu text-slate-500 dark:text-slate-300">{selectedAccount?.urduName}</span>
              {selectedAccount?.phone && (
                <span className="flex items-center space-x-0.5 font-mono">
                  <Phone size={10} />
                  <span>{selectedAccount.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 pl-2 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Ledger Balance</div>
            <div
              className={`text-xs font-mono font-bold ${
                (selectedAccount?.balance || 0) > 0
                  ? 'text-rose-500'
                  : (selectedAccount?.balance || 0) < 0
                  ? 'text-emerald-500'
                  : 'text-slate-400'
              }`}
            >
              Rs. {Math.abs(selectedAccount?.balance || 0).toLocaleString()}{' '}
              {(selectedAccount?.balance || 0) > 0 ? '(Dr / ادھار)' : (selectedAccount?.balance || 0) < 0 ? '(Cr / ایڈوانس)' : 'Nil'}
            </div>
          </div>
          <ChevronDown size={16} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-[#2b2b40]/50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Header */}
          <div className="p-2.5 bg-slate-50 dark:bg-[#151521] sticky top-0 z-10 space-y-2 border-b border-slate-100 dark:border-[#2b2b40]">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-slate-400" />
              <input
                type="text"
                value={query}
                autoFocus
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-lg text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {searchedAccounts.length} Accounts Found
              </span>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(true)}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
              >
                <Plus size={12} />
                <span>+ Add New Party / Customer</span>
              </button>
            </div>
          </div>

          {/* List of Accounts */}
          {searchedAccounts.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-xs text-slate-400 mb-2">No account found matching "{query}"</div>
              <button
                type="button"
                onClick={() => {
                  setNewPartyName(query);
                  setIsQuickAddOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-xs"
              >
                + Create "{query}" Now
              </button>
            </div>
          ) : (
            searchedAccounts.map((acc) => {
              const isSelected = acc.id === selectedAccount?.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelect(acc)}
                  className={`px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-50 dark:hover:bg-[#151521] text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <User size={13} />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-xs truncate">{acc.name}</span>
                        {getAccountBadge(acc)}
                      </div>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                        <span className="font-urdu text-slate-500 dark:text-slate-300">{acc.urduName}</span>
                        <span>•</span>
                        <span>{acc.phone}</span>
                        {acc.city && <span>• {acc.city}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-mono font-bold ${
                        acc.balance > 0 ? 'text-rose-500' : acc.balance < 0 ? 'text-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      Rs. {Math.abs(acc.balance).toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {acc.balance > 0 ? 'Dr (ادھار)' : acc.balance < 0 ? 'Cr (جمع)' : 'Nil'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Quick Add Party Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#2b2b40]">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Add New Customer / Party
                  </h3>
                  <div className="text-xs text-slate-400 font-urdu">نیا کھاتہ دار یا خریدار / سپلائر شامل کریں</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickParty} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Type (کھاتے کی قسم)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPartyType('customer')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newPartyType === 'customer'
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Customer (گاہک)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPartyType('wholesale_buyer')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newPartyType === 'wholesale_buyer'
                        ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Buyer (خریدار)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPartyType('supplier')}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                      newPartyType === 'supplier'
                        ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 text-amber-600 dark:text-amber-400'
                        : 'border-slate-200 dark:border-[#2b2b40] text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Supplier (سپلائر)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Party / Business Name (نام) *
                </label>
                <input
                  type="text"
                  required
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  placeholder="e.g. Al-Madina Seed Agency"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Urdu Name (اردو نام)
                  </label>
                  <input
                    type="text"
                    value={newPartyUrdu}
                    onChange={(e) => setNewPartyUrdu(e.target.value)}
                    placeholder="المدینہ سیڈ ایجنسی"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-urdu text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone (فون نمبر)
                  </label>
                  <input
                    type="text"
                    value={newPartyPhone}
                    onChange={(e) => setNewPartyPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City / Market (شہر / مارکیٹ)
                </label>
                <input
                  type="text"
                  value={newPartyCity}
                  onChange={(e) => setNewPartyCity(e.target.value)}
                  placeholder="e.g. Grain Market, Faisalabad"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-[#2b2b40]">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
                >
                  Save & Select Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
