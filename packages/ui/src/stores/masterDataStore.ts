// packages/ui/src/stores/masterDataStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CompanyCategory, UserPermission } from '@inventory/shared-types';

export interface CompanyStaffUser {
  id: string;
  tenantId: string;
  username: string;
  fullName: string;
  pin: string;
  roleTitle: string;
  permissions: UserPermission[];
  isActive: boolean;
  lastLogin: string;
}

export interface CompanyRecord {
  id: string;
  name: string;
  urduName: string;
  category: CompanyCategory;
  phone: string;
  address: string;
  city: string;
  province: string;
  ntn: string;
  strn: string;
  fbrPosId: string;
  fbrAuthToken: string;
  fbrTier1Status: 'active' | 'registered' | 'unregistered';
  praRegistration: string;
  isLoginEnabled: boolean;
  primaryHex: string;
  secondaryHex: string;
  logoBase64?: string;
  printHeaderText: string;
  printFooterText: string;
  joinedDate: string;
  users: CompanyStaffUser[];
}

export interface SubscriptionPaymentRecord {
  id: string;
  subscriptionId: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  paymentMethod: 'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'Cash' | 'Cheque';
  referenceNo: string;
  notes: string;
}

export interface SubscriptionRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  planName: 'Starter' | 'Professional' | 'Enterprise' | 'Custom';
  monthlyFee: number;
  totalPaid: number;
  remainingDues: number;
  status: 'active' | 'trial' | 'grace_period' | 'suspended';
  billingCycle: 'monthly' | 'quarterly' | 'annual' | 'lifetime';
  startDate: string;
  nextDueDate: string;
  lastPaymentDate: string;
  adminPrivateNotes: string;
  payments: SubscriptionPaymentRecord[];
}

export interface ProductRecord {
  id: string;
  tenantId: string;
  name: string;
  urduName: string;
  category: string;
  barcode: string;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  currentStock: number;
  godownStock?: number; // Warehouse bulk reserve
  shopStock?: number;   // Shop front counter ready stock
  minThreshold: number;
  unit: string;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
}

export interface VendorRecord {
  id: string;
  tenantId: string;
  name: string;
  urduName: string;
  phone: string;
  city: string;
  address?: string;
  vendorType: 'supplier' | 'buyer'; // Supplier (where we buy) vs Buyer (who we sell to)
  category?: string; // Seeds, Fertilizer, Grain, FMCG, Packaging
  ntn?: string;
  balance: number; // +ve means payable to supplier, or receivable from buyer
  creditLimit?: number;
  lastOrderDate?: string;
}

export type PurchaseOrderStatus =
  | 'order_placed'
  | 'confirmed'
  | 'on_the_way'
  | 'received_godown'
  | 'received_shop'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderRecord {
  id: string;
  tenantId: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  supplierUrduName?: string;
  supplierPhone?: string;
  items: Array<{
    productId: string;
    productName: string;
    productUrduName?: string;
    quantity: number;
    costPrice: number;
    total: number;
    targetLocation: 'godown' | 'shop';
  }>;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: string;
  status: PurchaseOrderStatus;
  targetLocation: 'godown' | 'shop';
  date: string;
  notes?: string;
}

export interface OrderRecord {
  id: string;
  tenantId: string;
  invoiceNo?: string;
  partyId?: string;
  partyName?: string;
  partyType?: 'customer' | 'wholesale_buyer' | 'grower' | 'retailer';
  customerName?: string;
  customerPhone?: string;
  orderType?: 'retail_pos' | 'wholesale_dist' | 'mandi_kanta';
  itemCount?: number;
  totalAmount: number;
  paidAmount: number;
  remainingDues?: number;
  paymentMethod?: string;
  fbrInvoiceNumber?: string;
  dispatchStatus: 'pending' | 'in_godown' | 'in_shop' | 'dispatched' | 'delivered';
  dispatchLocation?: 'godown' | 'shop';
  deliveryChallanNo?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  date: string;
  items?: Array<{
    id: string;
    productId?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    location?: 'godown' | 'shop';
  }>;
}

export interface KhataPartyRecord {
  id: string;
  tenantId: string;
  name: string;
  urduName: string;
  phone: string;
  partyType: 'customer' | 'supplier' | 'beopari' | 'zamindar';
  balance: number;
  creditLimit?: number;
  lastEntryDate: string;
}

export interface KhataEntryRecord {
  id: string;
  tenantId: string;
  partyId: string;
  partyName: string;
  entryType: 'naam' | 'jama';
  amount: number;
  description: string;
  urduDescription: string;
  date: string;
}

export interface ExpenseRecord {
  id: string;
  tenantId: string;
  category: 'Rent' | 'Electricity' | 'Labor / Mazdoori' | 'Freight / Transport' | 'Tea / Refreshment' | 'Maintenance' | 'Other';
  title: string;
  urduTitle?: string;
  amount: number;
  paidTo?: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'JazzCash' | 'Easypaisa' | 'Cheque';
  receiptNo?: string;
  date: string;
  notes?: string;
}

export interface MasterDataStoreState {
  companies: CompanyRecord[];
  subscriptions: SubscriptionRecord[];
  products: ProductRecord[];
  vendors: VendorRecord[];
  purchaseOrders: PurchaseOrderRecord[];
  orders: OrderRecord[];
  khataParties: KhataPartyRecord[];
  khataEntries: KhataEntryRecord[];
  expenses: ExpenseRecord[];

  // Company Management Actions
  addCompany: (company: CompanyRecord, initialSubscriptionFee?: number) => void;
  updateCompany: (id: string, updates: Partial<CompanyRecord>) => void;
  deleteCompany: (id: string) => void;
  toggleCompanyLogin: (id: string) => void;
  setCompanyCategory: (id: string, category: CompanyCategory) => void;

  // Staff & Sub-User Management Actions
  addStaffUser: (tenantId: string, user: CompanyStaffUser) => void;
  updateStaffUser: (tenantId: string, userId: string, updates: Partial<CompanyStaffUser>) => void;
  deleteStaffUser: (tenantId: string, userId: string) => void;
  toggleStaffUserStatus: (tenantId: string, userId: string) => void;

  // Private SaaS Subscriptions & Billing Actions (Main Admin ONLY)
  addSubscription: (subscription: SubscriptionRecord) => void;
  addSubscriptionPayment: (
    subscriptionId: string,
    amount: number,
    paymentMethod: 'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'Cash' | 'Cheque',
    referenceNo: string,
    notes: string
  ) => void;
  deleteSubscriptionPayment: (subscriptionId: string, paymentId: string) => void;
  updateSubscriptionStatus: (subscriptionId: string, status: 'active' | 'trial' | 'grace_period' | 'suspended') => void;
  updateSubscriptionDetails: (subscriptionId: string, updates: Partial<SubscriptionRecord>) => void;
  deleteSubscription: (subscriptionId: string) => void;

  // Product & Stock Actions
  addProduct: (product: ProductRecord) => void;
  bulkAddProducts: (products: ProductRecord[]) => void;
  updateProduct: (id: string, updates: Partial<ProductRecord>) => void;
  adjustProductStock: (id: string, delta: number, location?: 'godown' | 'shop') => void;
  transferStockLocation: (productId: string, from: 'godown' | 'shop', to: 'godown' | 'shop', qty: number) => void;
  deleteProduct: (id: string) => void;

  // Vendors & Parties Actions (Suppliers & Buyers)
  addVendor: (vendor: VendorRecord) => void;
  bulkAddVendors: (vendors: VendorRecord[]) => void;
  updateVendor: (id: string, updates: Partial<VendorRecord>) => void;
  deleteVendor: (id: string) => void;

  // Purchase Orders & Inward Restock Actions
  addPurchaseOrder: (po: PurchaseOrderRecord) => void;
  updatePurchaseOrderStatus: (poId: string, status: PurchaseOrderStatus) => void;
  receivePurchaseOrder: (poId: string, location?: 'godown' | 'shop') => void;

  // Sales Orders & Wholesale Dispatch Actions
  addOrder: (order: OrderRecord) => void;
  bulkAddOrders: (orders: OrderRecord[]) => void;
  updateOrderStatus: (orderId: string, status: 'pending' | 'in_godown' | 'in_shop' | 'dispatched' | 'delivered') => void;
  updateDispatchStatus: (orderId: string, status: 'pending' | 'in_godown' | 'in_shop' | 'dispatched' | 'delivered') => void;

  // Bahi-Khata Ledger Actions
  addKhataParty: (party: KhataPartyRecord) => void;
  bulkAddKhataParties: (parties: KhataPartyRecord[]) => void;
  deleteKhataParty: (partyId: string) => void;
  addKhataEntry: (entry: KhataEntryRecord) => void;
  deleteKhataEntry: (entryId: string) => void;

  // Expense & Roznamcha Actions
  addExpense: (expense: ExpenseRecord) => void;
  deleteExpense: (id: string) => void;
}

const INITIAL_COMPANIES: CompanyRecord[] = [
  {
    id: 'tenant-madina-01',
    name: 'Al-Madina Superstore',
    urduName: 'المدینہ سپر اسٹور - لاہور',
    category: 'supermarket',
    phone: '0300-9876543',
    address: 'Main Commercial Market, Gulberg III, Lahore',
    city: 'Lahore',
    province: 'Punjab',
    ntn: '3201456-7',
    strn: '32-77-8761-234-55',
    fbrPosId: '892014',
    fbrAuthToken: 'FBR-LIVE-PROD-TK-99824',
    fbrTier1Status: 'active',
    praRegistration: 'PRA-LHR-2024-8891',
    isLoginEnabled: true,
    primaryHex: '#0f766e',
    secondaryHex: '#f59e0b',
    printHeaderText: 'Al-Madina Superstore • FBR Digital POS Certified',
    printFooterText: 'Thank you for shopping with us! No return without receipt.',
    joinedDate: '01 Jan 2026',
    users: [
      {
        id: 'su-1',
        tenantId: 'tenant-madina-01',
        username: 'cashier_usman',
        fullName: 'Muhammad Usman (Cashier)',
        pin: '1111',
        roleTitle: 'Counter POS Operator',
        permissions: ['orders_create'],
        isActive: true,
        lastLogin: 'Today, 10:45 PM'
      },
      {
        id: 'su-2',
        tenantId: 'tenant-madina-01',
        username: 'supervisor_ali',
        fullName: 'Ali Raza (Supervisor)',
        pin: '2222',
        roleTitle: 'Shift Manager',
        permissions: ['orders_create', 'products_manage', 'khata_manage', 'reports_view'],
        isActive: true,
        lastLogin: 'Yesterday'
      },
      {
        id: 'su-3',
        tenantId: 'tenant-madina-01',
        username: 'accountant_bilal',
        fullName: 'Bilal Ahmad (Accounts)',
        pin: '3333',
        roleTitle: 'Chief Accountant',
        permissions: ['khata_manage', 'customers_manage', 'reports_view'],
        isActive: true,
        lastLogin: '3 days ago'
      }
    ]
  },
  {
    id: 'tenant-kiryana-02',
    name: 'Bismillah Kiryana & Wholesale Groceries',
    urduName: 'بسم اللہ کریانہ و جنرل اسٹور',
    category: 'shop_kiryana',
    phone: '0301-2345678',
    address: 'Bohar Bazar, Rawalpindi',
    city: 'Rawalpindi',
    province: 'Punjab',
    ntn: '4198234-9',
    strn: '19-05-9988-776-55',
    fbrPosId: 'POS-RWP-4412',
    fbrAuthToken: 'FBR-AUTH-98231',
    fbrTier1Status: 'active',
    praRegistration: 'PRA-RWP-1120',
    isLoginEnabled: true,
    primaryHex: '#0284c7',
    secondaryHex: '#10b981',
    printHeaderText: 'Bismillah Kiryana • Fresh Groceries',
    printFooterText: 'Thank you for your visit. Goods sold are not returnable.',
    joinedDate: '15 Feb 2026',
    users: [
      {
        id: 'su-4',
        tenantId: 'tenant-kiryana-02',
        username: 'bismillah_cashier',
        fullName: 'Hafiz Kamran',
        pin: '1234',
        roleTitle: 'Head Cashier',
        permissions: ['orders_create', 'khata_manage'],
        isActive: true,
        lastLogin: 'Today'
      }
    ]
  },
  {
    id: 'tenant-mandi-03',
    name: 'Al-Rehman Agri Seeds & Grain Commission Shop',
    urduName: 'الرحمٰن سیڈز و غلہ کمیشن شاپ - غلہ منڈی',
    category: 'grain_mandi_seeds',
    phone: '0302-3456789',
    address: 'Shop #14, Grain Market (غلہ منڈی), Faisalabad',
    city: 'Faisalabad',
    province: 'Punjab',
    ntn: '7721908-3',
    strn: '',
    fbrPosId: 'MND-FSD-009',
    fbrAuthToken: '',
    fbrTier1Status: 'registered',
    praRegistration: 'PRA-FSD-771',
    isLoginEnabled: true,
    primaryHex: '#ca8a04',
    secondaryHex: '#16a34a',
    printHeaderText: 'Al-Rehman Agri Seeds & Arhat Commission Agency',
    printFooterText: 'Certified Agricultural Seeds & Grain Dealer. Kanta Wazan Guaranteed.',
    joinedDate: '01 Mar 2026',
    users: [
      {
        id: 'su-5',
        tenantId: 'tenant-mandi-03',
        username: 'mandi_munshi',
        fullName: 'Munshi Aslam',
        pin: '5555',
        roleTitle: 'Mandi Munshi / Kanta Operator',
        permissions: ['orders_create', 'khata_manage', 'products_manage'],
        isActive: true,
        lastLogin: 'Today, 06:15 AM'
      }
    ]
  },
  {
    id: 'tenant-wholesale-04',
    name: 'Punjab Seed Corporation & Wholesale Seeds Agency',
    urduName: 'پنجاب سیڈز و کھاد ہول سیل ایجنسی',
    category: 'wholesale',
    phone: '0300-8877665',
    address: 'G.T. Road Agri Wholesale Complex, Sahiwal',
    city: 'Sahiwal',
    province: 'Punjab',
    ntn: '8877112-4',
    strn: '22-09-8877-112-99',
    fbrPosId: 'WHL-SHW-001',
    fbrAuthToken: 'FBR-WHL-99882',
    fbrTier1Status: 'active',
    praRegistration: 'PRA-SHW-990',
    isLoginEnabled: true,
    primaryHex: '#3E97FF',
    secondaryHex: '#50CD89',
    printHeaderText: 'Punjab Seed Corporation & Agri Traders',
    printFooterText: 'Certified Quality Seeds & Fertilizer Distributor. Wholesale Delivery Challan.',
    joinedDate: '10 Jan 2026',
    users: [
      {
        id: 'su-6',
        tenantId: 'tenant-wholesale-04',
        username: 'wholesale_manager',
        fullName: 'Rana Shahid',
        pin: '1234',
        roleTitle: 'Godown & Distribution Manager',
        permissions: ['orders_create', 'products_manage', 'khata_manage', 'customers_manage', 'reports_view'],
        isActive: true,
        lastLogin: 'Today, 09:00 AM'
      }
    ]
  }
];

const INITIAL_SUBSCRIPTIONS: SubscriptionRecord[] = [
  {
    id: 'sub-001',
    tenantId: 'tenant-madina-01',
    tenantName: 'Al-Madina Superstore',
    planName: 'Enterprise',
    monthlyFee: 15000,
    totalPaid: 90000,
    remainingDues: 0,
    status: 'active',
    billingCycle: 'monthly',
    startDate: '01 Jan 2026',
    nextDueDate: '01 Oct 2026',
    lastPaymentDate: '01 Sep 2026',
    adminPrivateNotes: 'VIP Client. Regular payments via 1Link Bank Transfer (HBL Account).',
    payments: [
      {
        id: 'pay-1',
        subscriptionId: 'sub-001',
        tenantId: 'tenant-madina-01',
        tenantName: 'Al-Madina Superstore',
        amount: 15000,
        date: '01 Sep 2026',
        paymentMethod: 'Bank Transfer',
        referenceNo: 'HBL-FT-9988231',
        notes: 'September license fee'
      },
      {
        id: 'pay-2',
        subscriptionId: 'sub-001',
        tenantId: 'tenant-madina-01',
        tenantName: 'Al-Madina Superstore',
        amount: 15000,
        date: '01 Aug 2026',
        paymentMethod: 'Bank Transfer',
        referenceNo: 'HBL-FT-8877123',
        notes: 'August license fee'
      }
    ]
  },
  {
    id: 'sub-002',
    tenantId: 'tenant-kiryana-02',
    tenantName: 'Bismillah Kiryana & Wholesale Groceries',
    planName: 'Professional',
    monthlyFee: 8000,
    totalPaid: 56000,
    remainingDues: 0,
    status: 'active',
    billingCycle: 'monthly',
    startDate: '15 Feb 2026',
    nextDueDate: '15 Sep 2026',
    lastPaymentDate: '15 Aug 2026',
    adminPrivateNotes: 'Paid via JazzCash (Ref: JC-992384). Prompt payer.',
    payments: [
      {
        id: 'pay-3',
        subscriptionId: 'sub-002',
        tenantId: 'tenant-kiryana-02',
        tenantName: 'Bismillah Kiryana & Wholesale Groceries',
        amount: 8000,
        date: '15 Aug 2026',
        paymentMethod: 'JazzCash',
        referenceNo: 'JC-992384',
        notes: 'August license installment'
      }
    ]
  }
];

const INITIAL_PRODUCTS: ProductRecord[] = [
  {
    id: 'p-seed-01',
    tenantId: 'tenant-madina-01',
    name: 'Hybrid Corn Seed Pioneer 30Y87 (20kg Bag)',
    urduName: 'ہائبرڈ مکئی کا بیج پائنیر 30Y87 (بوری)',
    category: 'Seeds & Agri',
    barcode: '896900112233',
    costPrice: 9500,
    retailPrice: 11500,
    wholesalePrice: 10400,
    currentStock: 65,
    godownStock: 50,
    shopStock: 15,
    minThreshold: 20,
    unit: 'Bag (20kg)',
    preferredSupplierId: 'vnd-sup-01',
    preferredSupplierName: 'Pioneer Agri Seeds Pakistan Ltd.'
  },
  {
    id: 'p-seed-02',
    tenantId: 'tenant-madina-01',
    name: 'Super Basmati Certified Paddy Seed (50kg Bag)',
    urduName: 'سپر باسمتی تصدیق شدہ دھان بیج (بوری)',
    category: 'Seeds & Agri',
    barcode: '896900223344',
    costPrice: 6200,
    retailPrice: 7500,
    wholesalePrice: 6800,
    currentStock: 12,
    godownStock: 10,
    shopStock: 2,
    minThreshold: 25,
    unit: 'Bag (50kg)',
    preferredSupplierId: 'vnd-sup-02',
    preferredSupplierName: 'Punjab Provincial Seed Corporation'
  },
  {
    id: 'p-seed-03',
    tenantId: 'tenant-madina-01',
    name: 'Akbar-19 Certified Wheat Seed (50kg Bag)',
    urduName: 'اکبر 19 گندم تصدیق شدہ بیج (بوری)',
    category: 'Seeds & Agri',
    barcode: '896900334455',
    costPrice: 4800,
    retailPrice: 5800,
    wholesalePrice: 5200,
    currentStock: 80,
    godownStock: 60,
    shopStock: 20,
    minThreshold: 15,
    unit: 'Bag (50kg)',
    preferredSupplierId: 'vnd-sup-02',
    preferredSupplierName: 'Punjab Provincial Seed Corporation'
  },
  {
    id: 'p-fert-01',
    tenantId: 'tenant-madina-01',
    name: 'DAP Fertilizer Sona FFC (50kg Bag)',
    urduName: 'ڈی اے پی سونا کھاد ایف ایف سی (بوری)',
    category: 'Fertilizers',
    barcode: '896900445566',
    costPrice: 11800,
    retailPrice: 13200,
    wholesalePrice: 12400,
    currentStock: 40,
    godownStock: 30,
    shopStock: 10,
    minThreshold: 20,
    unit: 'Bag (50kg)',
    preferredSupplierId: 'vnd-sup-03',
    preferredSupplierName: 'Fauji Fertilizer Company (FFC)'
  },
  {
    id: 'p-101',
    tenantId: 'tenant-madina-01',
    name: 'Super Basmati Rice 25kg Bag',
    urduName: 'سپر باسمتی چاول 25 کلو بوری',
    category: 'Grains & Rice',
    barcode: '896400012345',
    costPrice: 7200,
    retailPrice: 8500,
    wholesalePrice: 7800,
    currentStock: 45,
    godownStock: 35,
    shopStock: 10,
    minThreshold: 10,
    unit: 'Bori (25kg)'
  },
  {
    id: 'p-102',
    tenantId: 'tenant-madina-01',
    name: 'Cooking Oil Loose (Per Liter)',
    urduName: 'کھلا کوکنگ آئل درجہ اول',
    category: 'Oil & Ghee',
    barcode: '896400054321',
    costPrice: 420,
    retailPrice: 480,
    wholesalePrice: 450,
    currentStock: 250,
    godownStock: 200,
    shopStock: 50,
    minThreshold: 50,
    unit: 'Liter'
  }
];

const INITIAL_VENDORS: VendorRecord[] = [
  // Suppliers (Where Company BUYS goods when low on stock)
  {
    id: 'vnd-sup-01',
    tenantId: 'tenant-madina-01',
    name: 'Pioneer Agri Seeds Pakistan Ltd.',
    urduName: 'پائنیر ایگری سیڈز پاکستان لمیٹڈ',
    phone: '042-35876543',
    city: 'Lahore',
    address: 'Industrial Area, Kot Lakhpat, Lahore',
    vendorType: 'supplier',
    category: 'Hybrid Seeds',
    ntn: '0812345-6',
    balance: 145000,
    creditLimit: 500000,
    lastOrderDate: '01 Sep 2026'
  },
  {
    id: 'vnd-sup-02',
    tenantId: 'tenant-madina-01',
    name: 'Punjab Provincial Seed Corporation',
    urduName: 'پنجاب سیڈ کارپوریشن ہیڈ کوارٹر',
    phone: '042-99201456',
    city: 'Lahore',
    address: 'Davis Road, Lahore',
    vendorType: 'supplier',
    category: 'Certified Seeds',
    ntn: '0765432-1',
    balance: 80000,
    creditLimit: 300000,
    lastOrderDate: '28 Aug 2026'
  },
  {
    id: 'vnd-sup-03',
    tenantId: 'tenant-madina-01',
    name: 'Fauji Fertilizer Company (FFC)',
    urduName: 'فوجی فرٹیلائزر کمپنی لمیٹڈ',
    phone: '051-8450001',
    city: 'Rawalpindi',
    address: 'FFC Tower, Sona Camp, Rawalpindi',
    vendorType: 'supplier',
    category: 'Fertilizers',
    ntn: '0654321-0',
    balance: 0,
    creditLimit: 1000000,
    lastOrderDate: '15 Aug 2026'
  },

  // Buyers (Who Company SELLS wholesale orders to)
  {
    id: 'vnd-buy-01',
    tenantId: 'tenant-madina-01',
    name: 'Chaudhry Riaz Agri Seed Agency',
    urduName: 'چوہدری ریاض ایگری سیڈ ایجنسی (ساہیوال)',
    phone: '0300-7654321',
    city: 'Sahiwal',
    address: 'Main Grain Market, Sahiwal',
    vendorType: 'buyer',
    category: 'Seed Dealer & Retailer',
    ntn: '3201998-4',
    balance: 65000,
    creditLimit: 200000,
    lastOrderDate: '05 Sep 2026'
  },
  {
    id: 'vnd-buy-02',
    tenantId: 'tenant-madina-01',
    name: 'Mian Bashir Traders & Farm Supplies',
    urduName: 'میاں بشیر ٹریڈرز و فارم سپلائیز (اوکاڑہ)',
    phone: '0321-6543210',
    city: 'Okara',
    address: 'Katchery Road, Okara',
    vendorType: 'buyer',
    category: 'Grain & Fertilizer Merchant',
    ntn: '4102987-1',
    balance: 120000,
    creditLimit: 300000,
    lastOrderDate: '02 Sep 2026'
  },
  {
    id: 'vnd-buy-03',
    tenantId: 'tenant-madina-01',
    name: 'Malik Zafar Model Agri Farm',
    urduName: 'ملک ظفر ماڈل ایگری فارمز (پاکپتن)',
    phone: '0301-9876543',
    city: 'Pakpattan',
    address: 'Chak 14-EB, Pakpattan',
    vendorType: 'buyer',
    category: 'Progressive Grower',
    ntn: '',
    balance: 35000,
    creditLimit: 150000,
    lastOrderDate: '30 Aug 2026'
  }
];

const INITIAL_PURCHASE_ORDERS: PurchaseOrderRecord[] = [
  {
    id: 'po-001',
    tenantId: 'tenant-madina-01',
    orderNumber: 'PO-2026-001',
    supplierId: 'vnd-sup-01',
    supplierName: 'Pioneer Agri Seeds Pakistan Ltd.',
    supplierUrduName: 'پائنیر ایگری سیڈز پاکستان لمیٹڈ',
    supplierPhone: '042-35876543',
    items: [
      {
        productId: 'p-seed-01',
        productName: 'Hybrid Corn Seed Pioneer 30Y87',
        productUrduName: 'ہائبرڈ مکئی کا بیج پائنیر 30Y87',
        quantity: 50,
        costPrice: 9500,
        total: 475000,
        targetLocation: 'godown'
      }
    ],
    totalAmount: 475000,
    paidAmount: 300000,
    paymentMethod: 'Bank Transfer',
    status: 'received',
    targetLocation: 'godown',
    date: '01 Sep 2026',
    notes: 'Seasonal bulk purchase for autumn plantation.'
  }
];

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'ord-101',
    tenantId: 'tenant-madina-01',
    invoiceNo: 'WHL-2026-089',
    partyId: 'vnd-buy-01',
    partyName: 'Chaudhry Riaz Agri Seed Agency',
    partyType: 'wholesale_buyer',
    customerName: 'Chaudhry Riaz Ahmad',
    customerPhone: '0300-7654321',
    orderType: 'wholesale_dist',
    itemCount: 15,
    totalAmount: 156000,
    paidAmount: 100000,
    remainingDues: 56000,
    paymentMethod: 'Bank Transfer (1Link)',
    dispatchStatus: 'dispatched',
    dispatchLocation: 'godown',
    deliveryChallanNo: 'CHL-00891',
    vehicleNumber: 'LES-9921 (Mazda Titan)',
    driverName: 'Muhammad Boota',
    driverPhone: '0302-1122334',
    date: 'Today, 03:30 PM',
    items: [
      {
        id: 'oi-1',
        productId: 'p-seed-01',
        productName: 'Hybrid Corn Seed Pioneer 30Y87 (20kg Bag)',
        quantity: 15,
        unitPrice: 10400,
        total: 156000,
        location: 'godown'
      }
    ]
  }
];

const INITIAL_KHATA_PARTIES: KhataPartyRecord[] = [
  {
    id: 'kp-1',
    tenantId: 'tenant-madina-01',
    name: 'Chaudhry Riaz Agri Seed Agency',
    urduName: 'چوہدری ریاض ایگری سیڈ ایجنسی (ساہیوال)',
    phone: '0300-7654321',
    partyType: 'beopari',
    balance: 56000,
    creditLimit: 200000,
    lastEntryDate: 'Today, 04:30 PM'
  },
  {
    id: 'kp-2',
    tenantId: 'tenant-madina-01',
    name: 'Pioneer Agri Seeds Pakistan Ltd.',
    urduName: 'پائنیر ایگری سیڈز پاکستان لمیٹڈ',
    phone: '042-35876543',
    partyType: 'supplier',
    balance: -145000, // Negative means we owe the supplier
    creditLimit: 500000,
    lastEntryDate: '01 Sep 2026'
  }
];

const INITIAL_KHATA_ENTRIES: KhataEntryRecord[] = [
  {
    id: 'ke-1',
    tenantId: 'tenant-madina-01',
    partyId: 'kp-1',
    partyName: 'Chaudhry Riaz Agri Seed Agency',
    entryType: 'naam',
    amount: 56000,
    description: 'Wholesale Hybrid Corn Seed 15 Bags (Challan #CHL-00891)',
    urduDescription: 'ہول سیل مکئی بیج 15 بوریاں روانہ بذریعہ چالان #CHL-00891',
    date: 'Today, 04:30 PM'
  }
];

const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp-1',
    tenantId: 'tenant-madina-01',
    category: 'Labor / Mazdoori',
    title: 'Truck Unloading & Stacking Mazdoori (150 Bags Seed)',
    urduTitle: 'ٹرک ان لوڈنگ و گودام اسٹیکنگ مزدوری (150 بوریاں بیج)',
    amount: 4500,
    paidTo: 'Ustad Aslam & Labor Team',
    paymentMethod: 'Cash',
    receiptNo: 'MZD-881',
    date: 'Today, 02:00 PM',
    notes: 'Paid @ Rs. 30 per bag'
  },
  {
    id: 'exp-2',
    tenantId: 'tenant-madina-01',
    category: 'Tea / Refreshment',
    title: 'Daily Tea & Customer Refreshment (ہوٹل بل)',
    urduTitle: 'روزمرہ چائے و پانی خرچہ (ہوٹل بل)',
    amount: 1250,
    paidTo: 'Madina Hotel Gulberg',
    paymentMethod: 'Cash',
    receiptNo: 'HOT-12',
    date: 'Today, 11:30 AM',
    notes: 'Morning tea for staff and clients'
  }
];

export const useMasterDataStore = create<MasterDataStoreState>()(
  persist(
    (set, get) => ({
      companies: INITIAL_COMPANIES,
      subscriptions: INITIAL_SUBSCRIPTIONS,
      products: INITIAL_PRODUCTS,
      vendors: INITIAL_VENDORS,
      purchaseOrders: INITIAL_PURCHASE_ORDERS,
      orders: INITIAL_ORDERS,
      khataParties: INITIAL_KHATA_PARTIES,
      khataEntries: INITIAL_KHATA_ENTRIES,
      expenses: INITIAL_EXPENSES,

      // Companies
      addCompany: (company: CompanyRecord, initialSubscriptionFee: number = 10000) => {
        const newSub: SubscriptionRecord = {
          id: `sub-${Date.now().toString(36)}`,
          tenantId: company.id,
          tenantName: company.name,
          planName: 'Enterprise',
          monthlyFee: initialSubscriptionFee,
          totalPaid: 0,
          remainingDues: initialSubscriptionFee,
          status: 'trial',
          billingCycle: 'monthly',
          startDate: new Date().toLocaleDateString(),
          nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          lastPaymentDate: 'None',
          adminPrivateNotes: `Company registered on ${new Date().toLocaleDateString()}. Initial setup license fee: Rs. ${initialSubscriptionFee.toLocaleString()}`,
          payments: []
        };

        set({
          companies: [...get().companies, company],
          subscriptions: [...get().subscriptions, newSub]
        });
      },

      updateCompany: (id: string, updates: Partial<CompanyRecord>) => {
        set({
          companies: get().companies.map((c: CompanyRecord) => (c.id === id ? { ...c, ...updates } : c)),
          subscriptions: get().subscriptions.map((s: SubscriptionRecord) =>
            s.tenantId === id && updates.name ? { ...s, tenantName: updates.name } : s
          )
        });
      },

      deleteCompany: (id: string) => {
        set({
          companies: get().companies.filter((c: CompanyRecord) => c.id !== id),
          subscriptions: get().subscriptions.filter((s: SubscriptionRecord) => s.tenantId !== id)
        });
      },

      toggleCompanyLogin: (id: string) => {
        set({
          companies: get().companies.map((c: CompanyRecord) =>
            c.id === id ? { ...c, isLoginEnabled: !c.isLoginEnabled } : c
          )
        });
      },

      setCompanyCategory: (id: string, category: CompanyCategory) => {
        set({
          companies: get().companies.map((c: CompanyRecord) => (c.id === id ? { ...c, category } : c))
        });
      },

      // Staff Users
      addStaffUser: (tenantId: string, user: CompanyStaffUser) => {
        set({
          companies: get().companies.map((c: CompanyRecord) => {
            if (c.id === tenantId) {
              const existingUsers = c.users || [];
              return { ...c, users: [...existingUsers, user] };
            }
            return c;
          })
        });
      },

      updateStaffUser: (tenantId: string, userId: string, updates: Partial<CompanyStaffUser>) => {
        set({
          companies: get().companies.map((c: CompanyRecord) => {
            if (c.id === tenantId) {
              return {
                ...c,
                users: (c.users || []).map((u: CompanyStaffUser) => (u.id === userId ? { ...u, ...updates } : u))
              };
            }
            return c;
          })
        });
      },

      deleteStaffUser: (tenantId: string, userId: string) => {
        set({
          companies: get().companies.map((c: CompanyRecord) => {
            if (c.id === tenantId) {
              return { ...c, users: (c.users || []).filter((u: CompanyStaffUser) => u.id !== userId) };
            }
            return c;
          })
        });
      },

      toggleStaffUserStatus: (tenantId: string, userId: string) => {
        set({
          companies: get().companies.map((c: CompanyRecord) => {
            if (c.id === tenantId) {
              return {
                ...c,
                users: (c.users || []).map((u: CompanyStaffUser) =>
                  u.id === userId ? { ...u, isActive: !u.isActive } : u
                )
              };
            }
            return c;
          })
        });
      },

      // Private SaaS Billing
      addSubscription: (subscription: SubscriptionRecord) => {
        set({ subscriptions: [...get().subscriptions, subscription] });
      },

      addSubscriptionPayment: (
        subscriptionId: string,
        amount: number,
        paymentMethod: 'JazzCash' | 'Easypaisa' | 'Bank Transfer' | 'Cash' | 'Cheque',
        referenceNo: string,
        notes: string
      ) => {
        set({
          subscriptions: get().subscriptions.map((s: SubscriptionRecord) => {
            if (s.id === subscriptionId) {
              const paymentRecord: SubscriptionPaymentRecord = {
                id: `pay-${Date.now().toString(36)}`,
                subscriptionId,
                tenantId: s.tenantId,
                tenantName: s.tenantName,
                amount,
                date: new Date().toLocaleDateString(),
                paymentMethod,
                referenceNo: referenceNo || `TXN-${Date.now()}`,
                notes: notes || 'Monthly software subscription payment'
              };

              const newTotalPaid = (s.totalPaid || 0) + amount;
              const newRemaining = Math.max(0, (s.remainingDues || 0) - amount);

              return {
                ...s,
                totalPaid: newTotalPaid,
                remainingDues: newRemaining,
                status: 'active' as const,
                lastPaymentDate: new Date().toLocaleDateString(),
                adminPrivateNotes: `${s.adminPrivateNotes || ''} | Paid Rs. ${amount.toLocaleString()} on ${new Date().toLocaleDateString()}: ${notes}`,
                payments: [paymentRecord, ...(s.payments || [])]
              };
            }
            return s;
          })
        });
      },

      deleteSubscriptionPayment: (subscriptionId: string, paymentId: string) => {
        set({
          subscriptions: get().subscriptions.map((s: SubscriptionRecord) => {
            if (s.id === subscriptionId) {
              const targetPayment = (s.payments || []).find((p: SubscriptionPaymentRecord) => p.id === paymentId);
              const refundedAmount = targetPayment ? targetPayment.amount : 0;
              const updatedPayments = (s.payments || []).filter((p: SubscriptionPaymentRecord) => p.id !== paymentId);
              const newTotalPaid = Math.max(0, (s.totalPaid || 0) - refundedAmount);
              const newRemaining = (s.remainingDues || 0) + refundedAmount;

              return {
                ...s,
                totalPaid: newTotalPaid,
                remainingDues: newRemaining,
                payments: updatedPayments
              };
            }
            return s;
          })
        });
      },

      updateSubscriptionStatus: (subscriptionId: string, status: 'active' | 'trial' | 'grace_period' | 'suspended') => {
        set({
          subscriptions: get().subscriptions.map((s: SubscriptionRecord) => (s.id === subscriptionId ? { ...s, status } : s))
        });
      },

      updateSubscriptionDetails: (subscriptionId: string, updates: Partial<SubscriptionRecord>) => {
        set({
          subscriptions: get().subscriptions.map((s: SubscriptionRecord) => (s.id === subscriptionId ? { ...s, ...updates } : s))
        });
      },

      deleteSubscription: (subscriptionId: string) => {
        set({
          subscriptions: get().subscriptions.filter((s: SubscriptionRecord) => s.id !== subscriptionId)
        });
      },

      // Products & Granular Godown / Shop Stock
      addProduct: (product: ProductRecord) => {
        const godown = Number(product.godownStock) || 0;
        const shop = Number(product.shopStock) || 0;
        const total = godown + shop > 0 ? godown + shop : Number(product.currentStock) || 0;

        set({
          products: [
            ...get().products,
            {
              ...product,
              godownStock: godown || total,
              shopStock: shop,
              currentStock: total
            }
          ]
        });
      },

      updateProduct: (id: string, updates: Partial<ProductRecord>) => {
        set({
          products: get().products.map((p: ProductRecord) => {
            if (p.id === id) {
              const updated = { ...p, ...updates };
              const godown = typeof updated.godownStock === 'number' ? updated.godownStock : p.godownStock || 0;
              const shop = typeof updated.shopStock === 'number' ? updated.shopStock : p.shopStock || 0;
              const current = typeof updates.currentStock === 'number' ? updates.currentStock : godown + shop;
              return { ...updated, godownStock: godown, shopStock: shop, currentStock: current };
            }
            return p;
          })
        });
      },

      adjustProductStock: (id: string, delta: number, location?: 'godown' | 'shop') => {
        set({
          products: get().products.map((p: ProductRecord) => {
            if (p.id === id) {
              let godown = p.godownStock ?? p.currentStock;
              let shop = p.shopStock ?? 0;

              if (location === 'godown') {
                godown = Math.max(0, godown + delta);
              } else if (location === 'shop') {
                shop = Math.max(0, shop + delta);
              } else {
                // Default: adjust godown if present, else general
                if (godown > 0) godown = Math.max(0, godown + delta);
                else shop = Math.max(0, shop + delta);
              }

              return {
                ...p,
                godownStock: godown,
                shopStock: shop,
                currentStock: Math.max(0, godown + shop)
              };
            }
            return p;
          })
        });
      },

      transferStockLocation: (productId: string, from: 'godown' | 'shop', to: 'godown' | 'shop', qty: number) => {
        if (from === to || qty <= 0) return;
        set({
          products: get().products.map((p: ProductRecord) => {
            if (p.id === productId) {
              let godown = p.godownStock ?? p.currentStock;
              let shop = p.shopStock ?? 0;

              if (from === 'godown' && to === 'shop') {
                const actualMove = Math.min(godown, qty);
                godown -= actualMove;
                shop += actualMove;
              } else if (from === 'shop' && to === 'godown') {
                const actualMove = Math.min(shop, qty);
                shop -= actualMove;
                godown += actualMove;
              }

              return {
                ...p,
                godownStock: godown,
                shopStock: shop,
                currentStock: godown + shop
              };
            }
            return p;
          })
        });
      },

      deleteProduct: (id: string) => {
        set({ products: get().products.filter((p: ProductRecord) => p.id !== id) });
      },

      // Vendors (Suppliers & Buyers)
      addVendor: (vendor: VendorRecord) => {
        set({ vendors: [...(get().vendors || []), vendor] });
      },

      updateVendor: (id: string, updates: Partial<VendorRecord>) => {
        set({
          vendors: (get().vendors || []).map((v: VendorRecord) => (v.id === id ? { ...v, ...updates } : v))
        });
      },

      deleteVendor: (id: string) => {
        set({
          vendors: (get().vendors || []).filter((v: VendorRecord) => v.id !== id)
        });
      },

      // Purchase Orders & Inward Restock
      addPurchaseOrder: (po: PurchaseOrderRecord) => {
        const currentPOs = get().purchaseOrders || [];
        set({ purchaseOrders: [po, ...currentPOs] });

        // If PO is received initially, auto-increment inventory stock
        if (po.status === 'received' || po.status === 'received_godown' || po.status === 'received_shop') {
          const loc = po.status === 'received_shop' ? 'shop' : (po.targetLocation || 'godown');
          get().receivePurchaseOrder(po.id, loc);
        }
      },

      updatePurchaseOrderStatus: (poId: string, status: PurchaseOrderStatus) => {
        const po = (get().purchaseOrders || []).find((p) => p.id === poId);
        if (!po) return;

        const wasReceived = po.status === 'received' || po.status === 'received_godown' || po.status === 'received_shop';
        const isNowReceived = status === 'received' || status === 'received_godown' || status === 'received_shop';

        if (!wasReceived && isNowReceived) {
          const loc = status === 'received_shop' ? 'shop' : (po.targetLocation || 'godown');
          get().receivePurchaseOrder(poId, loc);
        } else {
          set({
            purchaseOrders: (get().purchaseOrders || []).map((p) => (p.id === poId ? { ...p, status } : p))
          });
        }
      },

      receivePurchaseOrder: (poId: string, location?: 'godown' | 'shop') => {
        const po = (get().purchaseOrders || []).find((p) => p.id === poId);
        if (!po) return;

        const targetLoc = location || po.targetLocation || 'godown';

        // Increment stock for each item in the purchase order
        po.items.forEach((it) => {
          get().adjustProductStock(it.productId, it.quantity, it.targetLocation || targetLoc);
        });

        const newStatus: PurchaseOrderStatus = targetLoc === 'shop' ? 'received_shop' : 'received_godown';

        // Update PO status
        set({
          purchaseOrders: (get().purchaseOrders || []).map((p) =>
            p.id === poId ? { ...p, status: newStatus } : p
          )
        });
      },

      // Sales Orders & Wholesale Dispatch
      addOrder: (order: OrderRecord) => {
        set({ orders: [order, ...get().orders] });

        // Auto-decrement product stock based on order lines & specified location
        if (order.items && order.items.length > 0) {
          order.items.forEach((it) => {
            if (it.productId) {
              const location = it.location || order.dispatchLocation || 'godown';
              get().adjustProductStock(it.productId, -it.quantity, location);
            }
          });
        }
      },

      updateOrderStatus: (orderId: string, status: 'pending' | 'in_godown' | 'in_shop' | 'dispatched' | 'delivered') => {
        set({
          orders: get().orders.map((o: OrderRecord) => (o.id === orderId ? { ...o, dispatchStatus: status } : o))
        });
      },

      updateDispatchStatus: (orderId: string, status: 'pending' | 'in_godown' | 'in_shop' | 'dispatched' | 'delivered') => {
        set({
          orders: get().orders.map((o: OrderRecord) => (o.id === orderId ? { ...o, dispatchStatus: status } : o))
        });
      },

      bulkAddProducts: (newProducts: ProductRecord[]) => {
        const existing = get().products;
        const processed = newProducts.map((p) => {
          const godown = Number(p.godownStock) || 0;
          const shop = Number(p.shopStock) || 0;
          const total = godown + shop > 0 ? godown + shop : Number(p.currentStock) || 0;
          return {
            ...p,
            godownStock: godown || total,
            shopStock: shop,
            currentStock: total
          };
        });
        set({ products: [...processed, ...existing] });
      },

      bulkAddVendors: (newVendors: VendorRecord[]) => {
        set({ vendors: [...newVendors, ...(get().vendors || [])] });
      },

      bulkAddOrders: (newOrders: OrderRecord[]) => {
        set({ orders: [...newOrders, ...get().orders] });
      },

      bulkAddKhataParties: (newParties: KhataPartyRecord[]) => {
        set({ khataParties: [...newParties, ...get().khataParties] });
      },

      // Expenses & Roznamcha
      addExpense: (expense: ExpenseRecord) => {
        set({ expenses: [expense, ...(get().expenses || [])] });
      },

      deleteExpense: (id: string) => {
        set({ expenses: (get().expenses || []).filter((e) => e.id !== id) });
      },

      // Khata
      addKhataParty: (party: KhataPartyRecord) => {
        set({ khataParties: [...get().khataParties, party] });
      },

      deleteKhataParty: (partyId: string) => {
        set({
          khataParties: get().khataParties.filter((p: KhataPartyRecord) => p.id !== partyId),
          khataEntries: get().khataEntries.filter((e: KhataEntryRecord) => e.partyId !== partyId)
        });
      },

      addKhataEntry: (entry: KhataEntryRecord) => {
        const parties = get().khataParties;
        const delta = entry.entryType === 'naam' ? entry.amount : -entry.amount;

        set({
          khataEntries: [entry, ...get().khataEntries],
          khataParties: parties.map((p: KhataPartyRecord) =>
            p.id === entry.partyId
              ? { ...p, balance: p.balance + delta, lastEntryDate: 'Just now' }
              : p
          )
        });
      },

      deleteKhataEntry: (entryId: string) => {
        const entry = get().khataEntries.find((e: KhataEntryRecord) => e.id === entryId);
        if (!entry) return;
        const delta = entry.entryType === 'naam' ? -entry.amount : entry.amount;

        set({
          khataEntries: get().khataEntries.filter((e: KhataEntryRecord) => e.id !== entryId),
          khataParties: get().khataParties.map((p: KhataPartyRecord) =>
            p.id === entry.partyId
              ? { ...p, balance: p.balance + delta, lastEntryDate: 'Updated' }
              : p
          )
        });
      }
    }),
    {
      name: 'inv_master_data_v2',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
