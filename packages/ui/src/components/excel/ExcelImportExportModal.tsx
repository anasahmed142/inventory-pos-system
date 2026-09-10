// packages/ui/src/components/excel/ExcelImportExportModal.tsx
import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  Package,
  ShoppingCart,
  BookOpen,
  DollarSign,
  FileCheck,
  RefreshCw,
  Table,
  Plus
} from 'lucide-react';
import { ExcelDataService } from './excelHub';
import {
  useMasterDataStore,
  ProductRecord,
  KhataPartyRecord,
  OrderRecord,
  ExpenseRecord
} from '../../stores/masterDataStore';
import { useTenantBrandingStore } from '../../theming/tenantBrandingStore';

interface ExcelImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'products' | 'orders' | 'khata' | 'expenses';
}

export const ExcelImportExportModal: React.FC<ExcelImportExportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'products'
}) => {
  const profile = useTenantBrandingStore((s) => s.profile);
  const activeTenantId = profile?.tenantId || 'tenant-madina-01';

  const products = useMasterDataStore((s) => s.products.filter((p) => p.tenantId === activeTenantId || !p.tenantId));
  const orders = useMasterDataStore((s) => s.orders.filter((o) => o.tenantId === activeTenantId || !o.tenantId));
  const khataParties = useMasterDataStore((s) => s.khataParties.filter((p) => p.tenantId === activeTenantId || !p.tenantId));
  const khataEntries = useMasterDataStore((s) => s.khataEntries.filter((e) => e.tenantId === activeTenantId || !e.tenantId));
  const expenses = useMasterDataStore((s) => (s.expenses || []).filter((e) => e.tenantId === activeTenantId || !e.tenantId));

  const bulkAddProducts = useMasterDataStore((s) => s.bulkAddProducts);
  const bulkAddKhataParties = useMasterDataStore((s) => s.bulkAddKhataParties);

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'khata' | 'expenses'>(defaultTab);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'preview' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportStatus('idle');
    try {
      if (activeTab === 'products') {
        const parsed = await ExcelDataService.parseProductsFile(file, activeTenantId);
        setParsedItems(parsed);
        setImportStatus('preview');
        setStatusMessage(`Successfully parsed ${parsed.length} products from ${file.name}. Review below and confirm import.`);
      } else if (activeTab === 'khata') {
        const parsed = await ExcelDataService.parsePartiesFile(file, activeTenantId);
        setParsedItems(parsed);
        setImportStatus('preview');
        setStatusMessage(`Successfully parsed ${parsed.length} party accounts from ${file.name}. Review below and confirm import.`);
      }
    } catch (err: any) {
      setImportStatus('error');
      setStatusMessage(`Error parsing file: ${err.message || 'Invalid Excel format'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitImport = () => {
    if (!parsedItems.length) return;

    if (activeTab === 'products') {
      bulkAddProducts(parsedItems as ProductRecord[]);
      setImportStatus('success');
      setStatusMessage(`🎉 Successfully imported ${parsedItems.length} products into active catalog!`);
      setParsedItems([]);
    } else if (activeTab === 'khata') {
      bulkAddKhataParties(parsedItems as KhataPartyRecord[]);
      setImportStatus('success');
      setStatusMessage(`🎉 Successfully imported ${parsedItems.length} party accounts into Bahi-Khata!`);
      setParsedItems([]);
    }
  };

  const handleExportData = () => {
    if (activeTab === 'products') {
      ExcelDataService.exportProductsToExcel(products, `${profile?.name || 'Store'}_Products_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (activeTab === 'orders') {
      ExcelDataService.exportOrdersToExcel(orders, `${profile?.name || 'Store'}_Orders_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (activeTab === 'khata') {
      ExcelDataService.exportKhataToExcel(khataParties, khataEntries, `${profile?.name || 'Store'}_Khata_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else if (activeTab === 'expenses') {
      ExcelDataService.exportExpensesToExcel(expenses, `${profile?.name || 'Store'}_Expenses_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  const handleDownloadSample = () => {
    if (activeTab === 'products') {
      ExcelDataService.downloadProductsSampleTemplate();
    } else if (activeTab === 'khata') {
      ExcelDataService.downloadPartiesSampleTemplate();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl sm:rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] text-slate-900 dark:text-white transition-all">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-[#2b2b40] flex flex-wrap justify-between items-center gap-2 bg-slate-50/50 dark:bg-[#151521]/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Excel & CSV Bulk Data Hub</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Import / Export
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu">
                ایکسل کے ذریعے ہزاروں پراڈکٹس، کھاتہ دار، اور آرڈرز کی بیک وقت امپورٹ و ایکسپورٹ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 p-3 bg-slate-100 dark:bg-[#151521] border-b border-slate-200 dark:border-[#2b2b40] overflow-x-auto">
          {[
            { id: 'products', label: 'Products Catalog (پراڈکٹس)', icon: <Package size={14} />, count: products.length },
            { id: 'khata', label: 'Bahi-Khata Accounts (کھاتہ دار)', icon: <BookOpen size={14} />, count: khataParties.length },
            { id: 'orders', label: 'Orders & Sales (سیلز آرڈرز)', icon: <ShoppingCart size={14} />, count: orders.length },
            { id: 'expenses', label: 'Daily Roznamcha (روزنامچہ)', icon: <DollarSign size={14} />, count: expenses.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setParsedItems([]);
                setImportStatus('idle');
                setStatusMessage('');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#1e1e2d] text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Quick Action Matrix (Export, Template, Import) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Export Current Data */}
            <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <Download size={15} />
                  <span>Export Active Records</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  Download .XLSX Excel File
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  1-Click export of all active records formatted with headers, barcodes, and balance summaries.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all"
              >
                <Download size={14} />
                <span>Export to Excel Now</span>
              </button>
            </div>

            {/* Action 2: Download Blank Sample Template */}
            <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                  <Table size={15} />
                  <span>Sample Excel Structure</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  Download Sample Template
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Get pre-formatted spreadsheet columns and sample rows to fill in your store data easily.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                disabled={activeTab === 'orders' || activeTab === 'expenses'}
                className="w-full py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold transition-all disabled:opacity-50"
              >
                <Table size={14} />
                <span>Download Sample .XLSX</span>
              </button>
            </div>

            {/* Action 3: Upload & Ingest */}
            <div className="bg-slate-50 dark:bg-[#151521] border border-slate-200 dark:border-[#2b2b40] p-4 rounded-2xl flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                  <Upload size={15} />
                  <span>Bulk Upload & Ingest</span>
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                  Upload .XLSX / .CSV File
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select your spreadsheet. You will preview parsed rows before anything is saved.
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || activeTab === 'orders' || activeTab === 'expenses'}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                >
                  <Upload size={14} />
                  <span>{isProcessing ? 'Reading Spreadsheet...' : 'Choose Excel File'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-center space-x-2.5 text-xs font-bold ${
                importStatus === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : importStatus === 'error'
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              }`}
            >
              {importStatus === 'success' && <CheckCircle size={16} />}
              {importStatus === 'error' && <AlertCircle size={16} />}
              {importStatus === 'preview' && <FileCheck size={16} />}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Preview Table of Parsed Spreadsheet Data */}
          {importStatus === 'preview' && parsedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Data Preview ({parsedItems.length} rows ready to import):
                </div>
                <button
                  type="button"
                  onClick={handleCommitImport}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                >
                  <CheckCircle size={14} />
                  <span>Confirm & Commit All {parsedItems.length} Rows</span>
                </button>
              </div>

              <div className="border border-slate-200 dark:border-[#2b2b40] rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 dark:bg-[#151521] text-slate-700 dark:text-slate-300 sticky top-0 font-bold border-b border-slate-200 dark:border-[#2b2b40]">
                    {activeTab === 'products' ? (
                      <tr>
                        <th className="p-2.5">Barcode</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Urdu Name</th>
                        <th className="p-2.5">Category</th>
                        <th className="p-2.5 text-right">Cost</th>
                        <th className="p-2.5 text-right">Retail</th>
                        <th className="p-2.5 text-right">Stock</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="p-2.5">Party Name</th>
                        <th className="p-2.5">Urdu Name</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5 text-right">Opening Balance</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]/50 font-medium">
                    {parsedItems.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        {activeTab === 'products' ? (
                          <>
                            <td className="p-2 font-mono text-[11px] text-slate-500">{row.barcode}</td>
                            <td className="p-2 font-bold text-slate-900 dark:text-white">{row.name}</td>
                            <td className="p-2 font-urdu text-blue-600 dark:text-blue-400">{row.urduName}</td>
                            <td className="p-2 text-slate-500">{row.category}</td>
                            <td className="p-2 text-right font-mono">Rs. {row.costPrice?.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono font-bold text-emerald-600">Rs. {row.retailPrice?.toLocaleString()}</td>
                            <td className="p-2 text-right font-mono font-bold">{row.currentStock}</td>
                          </>
                        ) : (
                          <>
                            <td className="p-2 font-bold text-slate-900 dark:text-white">{row.name}</td>
                            <td className="p-2 font-urdu text-blue-600 dark:text-blue-400">{row.urduName}</td>
                            <td className="p-2 font-mono text-slate-500">{row.phone}</td>
                            <td className="p-2 capitalize">{row.partyType}</td>
                            <td className={`p-2 text-right font-mono font-bold ${row.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              Rs. {row.balance?.toLocaleString()}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#151521] border-t border-slate-200 dark:border-[#2b2b40] flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Enterprise Local Excel Parser • 100% Offline Compatible
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
