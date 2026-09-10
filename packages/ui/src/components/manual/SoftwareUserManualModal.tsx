// packages/ui/src/components/manual/SoftwareUserManualModal.tsx
import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle,
  ShoppingCart,
  Store,
  Truck,
  Scale,
  Warehouse,
  FileSpreadsheet,
  Printer,
  Crown,
  KeyRound,
  FileText,
  DollarSign,
  HelpCircle,
  Share2,
  X,
  ChevronRight,
  Layers,
  Sparkles,
  Barcode
} from 'lucide-react';

interface SoftwareUserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChapter?: string;
}

export const SoftwareUserManualModal: React.FC<SoftwareUserManualModalProps> = ({
  isOpen,
  onClose,
  initialChapter = 'overview'
}) => {
  const [selectedChapter, setSelectedChapter] = useState(initialChapter);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const chapters = [
    {
      id: 'overview',
      title: '1. Getting Started & Personas',
      urdu: 'تعارف اور لاگ ان طریقہ کار',
      icon: <Sparkles size={16} className="text-amber-500" />
    },
    {
      id: 'supermarket_pos',
      title: '2. Supermarket POS & FBR Digital POS',
      urdu: 'سپر مارکیٹ کاؤنٹر و ایف بی آر بلنگ',
      icon: <ShoppingCart size={16} className="text-blue-500" />
    },
    {
      id: 'kiryana_shop',
      title: '3. Kiryana Counter & Loose Weighing',
      urdu: 'کریانہ کاؤنٹر اور وزنی اشیاء فروخت',
      icon: <Store size={16} className="text-emerald-500" />
    },
    {
      id: 'wholesale_trade',
      title: '4. Wholesale Trade & 5-Stage Procurement',
      urdu: 'ہول سیل آرڈرز اور 5 مرحلہ وار خریداری',
      icon: <Truck size={16} className="text-purple-500" />
    },
    {
      id: 'mandi_kanta',
      title: '5. Galla Mandi Kanta & 40kg Mann Math',
      urdu: 'غلہ منڈی کانٹا، من حساب اور آڑھت کمیشن',
      icon: <Scale size={16} className="text-indigo-500" />
    },
    {
      id: 'bahi_khata',
      title: '6. Bahi-Khata Ledger & WhatsApp Alerts',
      urdu: 'بہی کھاتہ ادھار، نام/جمع اور واٹس ایپ',
      icon: <BookOpen size={16} className="text-teal-500" />
    },
    {
      id: 'excel_hub',
      title: '7. Excel / CSV Bulk Data Ingestion',
      urdu: 'ایکسل امپورٹ اور ایکسپورٹ',
      icon: <FileSpreadsheet size={16} className="text-emerald-500" />
    },
    {
      id: 'printing_studio',
      title: '8. 3-Format Printing & Barcode Studio',
      urdu: 'پرنٹنگ (A4, A5, 80mm) اور بارکوڈ لیبلز',
      icon: <Printer size={16} className="text-rose-500" />
    },
    {
      id: 'daily_expenses',
      title: '9. Daily Roznamcha & Profit Calculation',
      urdu: 'روزنامچہ اخراجات اور خالص یومیہ نفع',
      icon: <DollarSign size={16} className="text-amber-500" />
    },
    {
      id: 'saas_admin',
      title: '10. SaaS HQ & Multi-Company Admin',
      urdu: 'کمپنی و برانچ ایڈمن پینل',
      icon: <Crown size={16} className="text-yellow-500" />
    },
    {
      id: 'shortcuts',
      title: '11. Keyboard Shortcuts & Hardware',
      urdu: 'کی بورڈ شارٹ کٹس اور ہارڈ ویئر',
      icon: <KeyRound size={16} className="text-slate-500" />
    }
  ];

  const filteredChapters = chapters.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.urdu.includes(searchQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl sm:rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] text-slate-900 dark:text-white transition-all">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-[#2b2b40] flex flex-wrap justify-between items-center gap-2 bg-slate-50/50 dark:bg-[#151521]/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Official User Manual & Operational Guide</span>
                <span className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                  باقاعدہ رہنمائی
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-urdu">
                سافٹ ویئر کے تمام ماڈیولز استعمال کرنے کا طریقہ، ویڈیوز اور رہنمائی
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

        {/* Master / Detail Manual Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Navigation Sidebar */}
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#2b2b40] p-3 sm:p-4 bg-slate-50/60 dark:bg-[#151521]/60 flex flex-col max-h-[35vh] md:max-h-none overflow-y-auto">
            {/* Search Input */}
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guide (مثلاً کانٹا، بل، واٹس ایپ)..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-xl text-xs text-slate-900 dark:text-white outline-none"
              />
            </div>

            {/* Chapters Navigation List */}
            <div className="space-y-1 overflow-y-auto flex-1">
              {filteredChapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapter(ch.id)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between ${
                    selectedChapter === ch.id
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="shrink-0">{ch.icon}</div>
                    <div className="truncate">
                      <div className="text-xs truncate">{ch.title}</div>
                      <div className={`text-[10px] font-urdu truncate ${selectedChapter === ch.id ? 'text-blue-100' : 'text-slate-400'}`}>
                        {ch.urdu}
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={14} className={`shrink-0 ${selectedChapter === ch.id ? 'text-white' : 'text-slate-400'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Right Chapter Reader View */}
          <div className="md:col-span-8 p-4 sm:p-6 overflow-y-auto max-h-[60vh] md:max-h-none space-y-6 text-slate-800 dark:text-slate-200">
            {/* CHAPTER 1: OVERVIEW */}
            {selectedChapter === 'overview' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-blue-500">Chapter 1</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Getting Started & 1-Click Role Logins (تعارف اور لاگ ان)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    Welcome to the **Enterprise Multi-Mode Inventory, POS, Wholesale & Grain Market Platform**. The software is built with strict multi-tenant isolation, 100% offline persistence, and automated FBR/Tax compliance.
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 p-3.5 rounded-2xl space-y-2">
                    <div className="font-bold text-blue-700 dark:text-blue-300">
                      🔑 1-Click Quick Demo Personas Available on Login Screen:
                    </div>
                    <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                      <li><strong>Supermarket Cashier:</strong> Launches instant barcode retail terminal with USIN/FBR QR.</li>
                      <li><strong>Wholesale Order Desk:</strong> Direct access to 5-stage procurement lifecycle & dispatch challans.</li>
                      <li><strong>Galla Mandi Kanta Operator:</strong> Opens electronic weighing scale & 40kg Mann calculations.</li>
                      <li><strong>Kiryana Store Cashier:</strong> Quick counter with loose pulses/sugar weight calculations.</li>
                      <li><strong>Company Store Owner:</strong> Product catalog management, staff permissions, and branding studio.</li>
                      <li><strong>SaaS Platform Master:</strong> Headquarters for all registered stores and subscription fees.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* CHAPTER 2: SUPERMARKET POS */}
            {selectedChapter === 'supermarket_pos' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-blue-500">Chapter 2</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Supermarket POS & FBR Digital POS Billing (سپر مارکیٹ و ایف بی آر بلنگ)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    The Supermarket POS terminal is engineered for high-throughput barcode scanning with sub-millisecond response times:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li><strong>Product Selection:</strong> Scan barcode via handheld USB scanner or use the searchable dropdown with instant keyboard navigation (Arrow Up/Down + Enter).</li>
                    <li><strong>Customer Account / Walk-in:</strong> Default is "Walk-in Cash Customer". You can select any existing customer or click "+" to register a customer instantly.</li>
                    <li><strong>Checkout:</strong> Press <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">[F12]</code> or click "Complete Sale & Print".</li>
                    <li><strong>FBR QR Verification:</strong> Automatically generates compliant USIN and QR codes on 80mm thermal receipts.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* CHAPTER 3: KIRYANA */}
            {selectedChapter === 'kiryana_shop' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-emerald-500">Chapter 3</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Kiryana Store Counter & Loose Items Weighing (کریانہ دکان اور وزنی اشیاء)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    Designed specifically for grocery stores selling loose un-barcoded goods (Sugar, Flour, Pulses, Ghee, Spices):
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Fractional Quantities:</strong> Enter weights in Kg or Grams/Pao (e.g. 0.25 kg = 1 Pao / پاؤ, 0.5 kg = آدھا کلو).</li>
                    <li><strong>Quick-Touch Catalog:</strong> High-frequency daily items are displayed as colored tiles for instant 1-tap cart addition.</li>
                    <li><strong>Customer Udhaar / Cash:</strong> Split payments between counter cash and direct posting to the customer's Bahi-Khata balance.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CHAPTER 4: WHOLESALE TRADE */}
            {selectedChapter === 'wholesale_trade' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-purple-500">Chapter 4</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Wholesale Distribution & 5-Stage Procurement Lifecycle (ہول سیل آرڈرز و خریداری)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    Wholesale distribution operates via formal purchase orders from suppliers and sales orders to buyer vendors:
                  </p>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl space-y-2">
                    <div className="font-bold text-purple-700 dark:text-purple-300">
                      📦 5-Stage Supplier Procurement Inward Lifecycle:
                    </div>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li><strong>Order Placed (آرڈر درج):</strong> Purchase order drafted for seed/fertilizer manufacturer.</li>
                      <li><strong>Supplier Confirmed (آرڈر کنفرم):</strong> Supplier acknowledges stock dispatch date.</li>
                      <li><strong>Goods In-Transit (مال راستے میں):</strong> Goods on truck/transport with Bilty #.</li>
                      <li><strong>Received at Godown/Shop (گودام میں وصولی):</strong> Stock verified and automatically added to warehouse inventory.</li>
                      <li><strong>Invoiced & Khata Settled (انوائس و کھاتہ):</strong> Supplier Bahi-Khata updated with payable balance.</li>
                    </ol>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white mt-2">
                    🚚 Delivery Challan vs Commercial Tax Invoice:
                  </div>
                  <p>
                    <strong>Delivery Challan:</strong> Official transport document showing quantities and vehicle info without displaying commercial item prices.<br />
                    <strong>Commercial Invoice:</strong> Complete tax bill showing unit rates, discounts, GST, and payment status.
                  </p>
                </div>
              </div>
            )}

            {/* CHAPTER 5: MANDI KANTA */}
            {selectedChapter === 'mandi_kanta' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-indigo-500">Chapter 5</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Galla Mandi Seeds, Electronic Kanta & 40kg Mann Math (غلہ منڈی کانٹا و من حساب)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    Agricultural grain markets use specialized mathematical deductions:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>40 Kg Mann Conversion:</strong> Rate is calculated per 40kg Mann (من), with automatic fractional conversion for surplus kilograms (e.g. 52 Mann 25 Kg).</li>
                    <li><strong>Bardana Tare Deduction (کاٹ و باردانہ):</strong> Automatically subtracts jute/plastic bag weight (e.g. 1.2 kg per bag) before calculating net payable weight.</li>
                    <li><strong>Arhat Commission (آڑھت کمیشن):</strong> Configurable commission percentage (e.g. 1.5% to 2%) deducted on gross yield.</li>
                    <li><strong>Labor / Mazdoori (مزدوری پلے داری):</strong> Automatic deduction for unloading and weighing labor.</li>
                    <li><strong>Farmer / Beopari Khata:</strong> Net proceeds posted directly to the grower's Bahi-Khata ledger.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CHAPTER 6: BAHI-KHATA */}
            {selectedChapter === 'bahi_khata' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-teal-500">Chapter 6</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Bahi-Khata Ledger, Debit/Credit Vouchers & WhatsApp Alerts (بہی کھاتہ ادھار)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    The traditional Pakistani Bahi-Khata ledger modernized with instant digital transparency:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Naam / Debit (نام وصولی):</strong> Goods sold on credit to customer or money given.</li>
                    <li><strong>Jama / Credit (جمع ادائیگی):</strong> Cash or bank transfer payment received from customer.</li>
                    <li><strong>1-Click WhatsApp Reminder:</strong> Click the WhatsApp icon on any account to send a personalized Urdu balance reminder with total outstanding balance.</li>
                    <li><strong>Master-Detail Split View:</strong> View all accounts on the left with live balance indicators (Receivable vs Payable) and full chronological transaction history on the right.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CHAPTER 7: EXCEL HUB */}
            {selectedChapter === 'excel_hub' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-emerald-500">Chapter 7</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Excel & CSV Bulk Data Ingestion Hub (ایکسل امپورٹ و ایکسپورٹ)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    Migrate 5,000+ products or existing accounts into the system in seconds:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Open <strong>"Excel Hub"</strong> from the top header or Company Admin dashboard.</li>
                    <li>Click <strong>"Download Sample .XLSX"</strong> to get pre-formatted spreadsheet columns.</li>
                    <li>Fill your product list (Barcode, Name, Urdu Name, Cost, Retail, Wholesale, Opening Stock) in Microsoft Excel.</li>
                    <li>Upload your file to preview all rows in the interactive validation table.</li>
                    <li>Click <strong>"Confirm & Commit"</strong> to instantly load all products into the active catalog!</li>
                  </ol>
                </div>
              </div>
            )}

            {/* CHAPTER 8: PRINTING & BARCODE */}
            {selectedChapter === 'printing_studio' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-rose-500">Chapter 8</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    3-Format Printing & Batch Barcode Label Studio (پرنٹنگ و بارکوڈ اسٹوڈیو)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    Print invoices, vouchers, and barcode stickers across any printer:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>📄 Full A4 Page:</strong> Formal corporate tax invoice or delivery gate pass with company logo, NTN, STRN, and terms.</li>
                    <li><strong>📑 Half A5 Voucher:</strong> Compact half-page trade voucher for wholesale counters and grain merchants.</li>
                    <li><strong>🧾 80mm Heat Wax / Thermal Receipt:</strong> High-speed supermarket cash receipt with FBR USIN QR code.</li>
                    <li><strong>🏷️ Batch Multi-Product Barcode Studio:</strong> Select multiple products, set custom label quantities (e.g. 50 stickers for Rice, 20 for Corn Seed), and print on 50x25mm, 38x25mm, or full A4 sticker sheets.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CHAPTER 9: DAILY EXPENSES */}
            {selectedChapter === 'daily_expenses' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-amber-500">Chapter 9</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Daily Expenses & Real Net Profit Roznamcha (روزنامچہ اور خالص نفع)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    Track daily shop expenditures and calculate actual store earnings:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Expense Categorization:</strong> Record Labor Mazdoori, Transport Freight (کرایہ), Hotel Tea/Kharcha, Electricity, Rent, and Repairs.</li>
                    <li><strong>Real-Time Net Profit:</strong> Automatic calculation of: <br />
                      <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono font-bold">
                        Net Profit = Today's Revenue - Cost of Goods - Total Daily Expenses
                      </code>
                    </li>
                    <li><strong>1-Click WhatsApp Daily Closing:</strong> Send the daily Roznamcha summary directly to the store owner's WhatsApp at closing time.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CHAPTER 10: SAAS HQ */}
            {selectedChapter === 'saas_admin' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-yellow-500">Chapter 10</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    SaaS Platform HQ & Multi-Tenant Company Management (کمپنی ایڈمن)
                  </h3>
                </div>
                <div className="space-y-3 text-xs leading-relaxed">
                  <p>
                    For multi-branch enterprise owners and SaaS platform master administrators:
                  </p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Company Lockdown:</strong> 1-Click login blocking for non-paying or suspended stores.</li>
                    <li><strong>Staff Sub-Users & Permissions:</strong> Create cashier, inventory manager, or accountant PIN logins with restricted permission flags.</li>
                    <li><strong>Brand Customizer:</strong> Upload store logo, choose Metronic UI dark/light themes, and customize primary accent colors.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* CHAPTER 11: SHORTCUTS */}
            {selectedChapter === 'shortcuts' && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-200 dark:border-[#2b2b40] pb-3">
                  <span className="text-xs uppercase font-bold text-slate-500">Chapter 11</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Keyboard Shortcuts & Rapid POS Entry (کی بورڈ شارٹ کٹس)
                  </h3>
                </div>
                <div className="space-y-3 text-xs">
                  <table className="w-full border border-slate-200 dark:border-[#2b2b40] rounded-xl overflow-hidden text-left">
                    <thead className="bg-slate-100 dark:bg-[#151521] font-bold">
                      <tr>
                        <th className="p-2.5">Key Shortcut</th>
                        <th className="p-2.5">Functionality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#2b2b40]/50 font-mono">
                      <tr>
                        <td className="p-2 font-bold text-blue-500">[Enter]</td>
                        <td className="p-2 font-sans">Add highlighted product from searchable combobox to cart</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-blue-500">[Arrow Down / Up]</td>
                        <td className="p-2 font-sans">Navigate through products and customer accounts list</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-blue-500">[Escape]</td>
                        <td className="p-2 font-sans">Close active search dropdown or modal window</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-blue-500">[F12]</td>
                        <td className="p-2 font-sans">Trigger instant checkout and open Print modal</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-blue-500">[Ctrl + P]</td>
                        <td className="p-2 font-sans">Direct print current document</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#151521] border-t border-slate-200 dark:border-[#2b2b40] flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Interactive Urdu & English In-App Documentation • Always Available
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
          >
            Got It (سمجھ آ گئی)
          </button>
        </div>
      </div>
    </div>
  );
};
