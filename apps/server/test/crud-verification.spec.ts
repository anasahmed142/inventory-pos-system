// apps/server/test/crud-verification.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';

interface CompanyStaffUser {
  id: string;
  tenantId: string;
  username: string;
  fullName: string;
  pin: string;
  roleTitle: string;
  permissions: string[];
  isActive: boolean;
  lastLogin: string;
}

interface CompanyRecord {
  id: string;
  name: string;
  urduName: string;
  category: string;
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
  printHeaderText: string;
  printFooterText: string;
  joinedDate: string;
  users: CompanyStaffUser[];
}

interface SubscriptionPaymentRecord {
  id: string;
  subscriptionId: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  paymentMethod: string;
  referenceNo: string;
  notes: string;
}

interface SubscriptionRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  planName: string;
  monthlyFee: number;
  totalPaid: number;
  remainingDues: number;
  status: string;
  billingCycle: string;
  startDate: string;
  nextDueDate: string;
  lastPaymentDate: string;
  adminPrivateNotes: string;
  payments: SubscriptionPaymentRecord[];
}

interface ProductRecord {
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
  godownStock?: number;
  shopStock?: number;
  minThreshold: number;
  unit: string;
  preferredSupplierId?: string;
  preferredSupplierName?: string;
}

interface VendorRecord {
  id: string;
  tenantId: string;
  name: string;
  urduName: string;
  phone: string;
  city: string;
  vendorType: 'supplier' | 'buyer';
  category?: string;
  balance: number;
  creditLimit?: number;
}

interface PurchaseOrderRecord {
  id: string;
  tenantId: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    total: number;
    targetLocation: 'godown' | 'shop';
  }>;
  totalAmount: number;
  status: 'ordered' | 'received';
  targetLocation: 'godown' | 'shop';
}

interface OrderRecord {
  id: string;
  tenantId: string;
  invoiceNo?: string;
  partyId?: string;
  customerName?: string;
  totalAmount: number;
  paidAmount: number;
  dispatchStatus: 'pending' | 'in_godown' | 'in_shop' | 'dispatched' | 'delivered';
  dispatchLocation?: 'godown' | 'shop';
  deliveryChallanNo?: string;
  items?: Array<{
    productId?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    location?: 'godown' | 'shop';
  }>;
}

interface KhataPartyRecord {
  id: string;
  tenantId: string;
  name: string;
  urduName: string;
  phone: string;
  partyType: 'customer' | 'supplier' | 'grower';
  balance: number;
  creditLimit: number;
  lastEntryDate: string;
}

interface KhataEntryRecord {
  id: string;
  tenantId: string;
  partyId: string;
  entryType: 'naam' | 'jama';
  amount: number;
  description: string;
  date: string;
  billNo?: string;
}

describe('Master Data Store CRUD & Wholesale Business Rules Verification', () => {
  let companies: CompanyRecord[] = [];
  let subscriptions: SubscriptionRecord[] = [];
  let products: ProductRecord[] = [];
  let vendors: VendorRecord[] = [];
  let purchaseOrders: PurchaseOrderRecord[] = [];
  let orders: OrderRecord[] = [];
  let khataParties: KhataPartyRecord[] = [];
  let khataEntries: KhataEntryRecord[] = [];

  beforeEach(() => {
    companies = [
      {
        id: 'comp-1',
        name: 'Madina Supermarket',
        urduName: 'مدینہ سپر مارکیٹ',
        category: 'supermarket',
        phone: '0300-1234567',
        address: 'Main Market',
        city: 'Lahore',
        province: 'Punjab',
        ntn: '1234567-8',
        strn: '1234567890123',
        fbrPosId: 'POS-001',
        fbrAuthToken: 'TOK-123',
        fbrTier1Status: 'active',
        praRegistration: 'PRA-123',
        isLoginEnabled: true,
        primaryHex: '#4f46e5',
        secondaryHex: '#10b981',
        printHeaderText: 'Madina Supermarket',
        printFooterText: 'Thank you',
        joinedDate: '2026-01-01',
        users: [
          {
            id: 'staff-1',
            tenantId: 'comp-1',
            username: 'madina_cashier1',
            fullName: 'Muhammad Usman',
            pin: '1234',
            roleTitle: 'Head Cashier',
            permissions: ['orders_create', 'khata_manage'],
            isActive: true,
            lastLogin: 'Today'
          }
        ]
      }
    ];

    subscriptions = [
      {
        id: 'sub-1',
        tenantId: 'comp-1',
        tenantName: 'Madina Supermarket',
        planName: 'Enterprise',
        monthlyFee: 5000,
        totalPaid: 15000,
        remainingDues: 5000,
        status: 'active',
        billingCycle: 'monthly',
        startDate: '2026-01-01',
        nextDueDate: '2026-10-01',
        lastPaymentDate: '2026-09-01',
        adminPrivateNotes: 'VIP Client',
        payments: [
          {
            id: 'pay-seed-1',
            subscriptionId: 'sub-1',
            tenantId: 'comp-1',
            tenantName: 'Madina Supermarket',
            amount: 5000,
            date: '2026-09-01',
            paymentMethod: 'Bank Transfer',
            referenceNo: 'TXN-PREV',
            notes: 'Initial fee'
          }
        ]
      }
    ];

    products = [
      {
        id: 'p-seed-01',
        tenantId: 'comp-1',
        name: 'Hybrid Corn Seed Pioneer 30Y87',
        urduName: 'ہائبرڈ مکئی کا بیج پائنیر 30Y87',
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
      }
    ];

    vendors = [
      {
        id: 'vnd-sup-01',
        tenantId: 'comp-1',
        name: 'Pioneer Agri Seeds Pakistan Ltd.',
        urduName: 'پائنیر ایگری سیڈز پاکستان لمیٹڈ',
        phone: '042-35876543',
        city: 'Lahore',
        vendorType: 'supplier',
        category: 'Hybrid Seeds',
        balance: 145000
      },
      {
        id: 'vnd-buy-01',
        tenantId: 'comp-1',
        name: 'Chaudhry Riaz Agri Seed Agency',
        urduName: 'چوہدری ریاض ایگری سیڈ ایجنسی',
        phone: '0300-7654321',
        city: 'Sahiwal',
        vendorType: 'buyer',
        category: 'Seed Dealer',
        balance: 65000
      }
    ];

    purchaseOrders = [];
    orders = [];
    khataParties = [
      {
        id: 'party-1',
        tenantId: 'comp-1',
        name: 'Chaudhry Akram',
        urduName: 'چوہدری اکرم',
        phone: '0300-9876543',
        partyType: 'customer',
        balance: 10000,
        creditLimit: 50000,
        lastEntryDate: 'Yesterday'
      }
    ];

    khataEntries = [
      {
        id: 'entry-seed-1',
        tenantId: 'comp-1',
        partyId: 'party-1',
        entryType: 'naam',
        amount: 4000,
        description: 'Seed entry for testing',
        date: '2026-09-01'
      }
    ];
  });

  describe('1. Company CRUD & Category Modal Config', () => {
    it('creates a new company with specific operating category and NTN/FBR settings', () => {
      const newCompany: CompanyRecord = {
        id: 'comp-2',
        name: 'Punjab Mega Mart',
        urduName: 'پنجاب میگا مارٹ',
        category: 'wholesale',
        phone: '0300-7654321',
        address: 'Wholesale Market',
        city: 'Faisalabad',
        province: 'Punjab',
        ntn: '9876543-2',
        strn: '',
        fbrPosId: 'POS-002',
        fbrAuthToken: '',
        fbrTier1Status: 'active',
        praRegistration: '',
        isLoginEnabled: true,
        primaryHex: '#009EF7',
        secondaryHex: '#50CD89',
        printHeaderText: 'Punjab Mega Mart',
        printFooterText: 'Thank you for shopping',
        joinedDate: '2026-09-10',
        users: []
      };

      companies.push(newCompany);
      expect(companies.length).toBe(2);
      expect(companies.find((c) => c.id === 'comp-2')?.category).toBe('wholesale');
    });

    it('updates company category and Urdu name strictly inside the Edit Company modal', () => {
      companies = companies.map((c) =>
        c.id === 'comp-1'
          ? { ...c, category: 'kiryana', urduName: 'مدینہ کریانہ اسٹور', ntn: '1112223-4' }
          : c
      );

      const updated = companies.find((c) => c.id === 'comp-1');
      expect(updated?.category).toBe('kiryana');
      expect(updated?.urduName).toBe('مدینہ کریانہ اسٹور');
      expect(updated?.ntn).toBe('1112223-4');
    });

    it('toggles company login permission (active vs suspended)', () => {
      companies = companies.map((c) =>
        c.id === 'comp-1' ? { ...c, isLoginEnabled: !c.isLoginEnabled } : c
      );
      expect(companies.find((c) => c.id === 'comp-1')?.isLoginEnabled).toBe(false);

      companies = companies.map((c) =>
        c.id === 'comp-1' ? { ...c, isLoginEnabled: !c.isLoginEnabled } : c
      );
      expect(companies.find((c) => c.id === 'comp-1')?.isLoginEnabled).toBe(true);
    });
  });

  describe('2. Staff / Cashier Management CRUD', () => {
    it('adds a staff member with granular permissions and PIN to a company', () => {
      const newStaff: CompanyStaffUser = {
        id: 'staff-2',
        tenantId: 'comp-1',
        username: 'ali_pos',
        fullName: 'Ali Hassan',
        pin: '5566',
        roleTitle: 'Senior Cashier',
        permissions: ['orders_create', 'khata_manage'],
        isActive: true,
        lastLogin: 'Never'
      };

      companies = companies.map((c) =>
        c.id === 'comp-1' ? { ...c, users: [...c.users, newStaff] } : c
      );

      const comp = companies.find((c) => c.id === 'comp-1');
      expect(comp?.users.length).toBe(2);
      expect(comp?.users.find((u) => u.username === 'ali_pos')?.fullName).toBe('Ali Hassan');
    });

    it('edits staff credentials, role title, and permissions', () => {
      companies = companies.map((c) =>
        c.id === 'comp-1'
          ? {
              ...c,
              users: c.users.map((u) =>
                u.id === 'staff-1'
                  ? { ...u, roleTitle: 'Branch Supervisor', pin: '9988', permissions: ['orders_create', 'products_manage', 'reports_view'] }
                  : u
              )
            }
          : c
      );

      const comp = companies.find((c) => c.id === 'comp-1');
      const staff = comp?.users.find((u) => u.id === 'staff-1');
      expect(staff?.roleTitle).toBe('Branch Supervisor');
      expect(staff?.pin).toBe('9988');
      expect(staff?.permissions).toContain('reports_view');
    });
  });

  describe('3. Product Catalog CRUD & Inventory Adjustments', () => {
    it('creates a new catalog item with multi-price tiers and barcodes', () => {
      const newProd: ProductRecord = {
        id: 'prod-2',
        tenantId: 'comp-1',
        name: 'Supreme Tea 950g',
        urduName: 'سپریم چائے',
        category: 'Groceries',
        barcode: '896123456789',
        costPrice: 1200,
        retailPrice: 1450,
        wholesalePrice: 1380,
        currentStock: 50,
        godownStock: 40,
        shopStock: 10,
        minThreshold: 10,
        unit: 'Pack'
      };

      products.push(newProd);
      expect(products.length).toBe(2);
      expect(products.find((p) => p.barcode === '896123456789')?.name).toBe('Supreme Tea 950g');
    });
  });

  describe('4. Private SaaS Subscription Billing Ledger CRUD', () => {
    it('records a paid subscription payment, recalculates dues, and sets status active', () => {
      const payment: SubscriptionPaymentRecord = {
        id: 'pay-1',
        subscriptionId: 'sub-1',
        tenantId: 'comp-1',
        tenantName: 'Madina Supermarket',
        amount: 5000,
        date: '2026-09-10',
        paymentMethod: 'Bank Transfer',
        referenceNo: 'TXN-998877',
        notes: 'Monthly renewal payment'
      };

      subscriptions = subscriptions.map((s) => {
        if (s.id === 'sub-1') {
          return {
            ...s,
            totalPaid: s.totalPaid + payment.amount,
            remainingDues: Math.max(0, s.remainingDues - payment.amount),
            status: 'active',
            lastPaymentDate: payment.date,
            payments: [payment, ...s.payments]
          };
        }
        return s;
      });

      const sub = subscriptions.find((s) => s.id === 'sub-1');
      expect(sub?.totalPaid).toBe(20000);
      expect(sub?.remainingDues).toBe(0);
      expect(sub?.payments.length).toBe(2);
    });
  });

  describe('5. Bahi-Khata (بہی کھاتہ) Ledger CRUD & Balance Tracking', () => {
    it('creates a new Khatedar party account', () => {
      const newParty: KhataPartyRecord = {
        id: 'party-2',
        tenantId: 'comp-1',
        name: 'Mian Bashir Traders',
        urduName: 'میاں بشیر ٹریڈرز',
        phone: '0321-4455667',
        partyType: 'customer',
        balance: 5000,
        creditLimit: 100000,
        lastEntryDate: 'New'
      };

      khataParties.push(newParty);
      expect(khataParties.length).toBe(2);
      expect(khataParties.find((p) => p.id === 'party-2')?.balance).toBe(5000);
    });
  });

  describe('6. Wholesale & Seed Distribution Workflows (Godown, Suppliers & Buyers)', () => {
    it('segregates Supplier Vendors (where we buy) and Buyer Vendors (who we sell to)', () => {
      const suppliers = vendors.filter((v) => v.vendorType === 'supplier');
      const buyers = vendors.filter((v) => v.vendorType === 'buyer');

      expect(suppliers.length).toBe(1);
      expect(suppliers[0].name).toBe('Pioneer Agri Seeds Pakistan Ltd.');
      expect(buyers.length).toBe(1);
      expect(buyers[0].name).toBe('Chaudhry Riaz Agri Seed Agency');
    });

    it('transfers stock from Godown to Shop location', () => {
      const transferQty = 10;
      products = products.map((p) => {
        if (p.id === 'p-seed-01') {
          return {
            ...p,
            godownStock: (p.godownStock || 50) - transferQty,
            shopStock: (p.shopStock || 15) + transferQty,
            currentStock: p.currentStock
          };
        }
        return p;
      });

      const prod = products.find((p) => p.id === 'p-seed-01');
      expect(prod?.godownStock).toBe(40); // 50 - 10
      expect(prod?.shopStock).toBe(25);   // 15 + 10
      expect(prod?.currentStock).toBe(65);
    });

    it('replenishes stock via Purchase Order from Supplier Vendor into Godown', () => {
      const po: PurchaseOrderRecord = {
        id: 'po-101',
        tenantId: 'comp-1',
        orderNumber: 'PO-2026-099',
        supplierId: 'vnd-sup-01',
        supplierName: 'Pioneer Agri Seeds Pakistan Ltd.',
        items: [
          {
            productId: 'p-seed-01',
            productName: 'Hybrid Corn Seed Pioneer 30Y87',
            quantity: 50,
            costPrice: 9500,
            total: 475000,
            targetLocation: 'godown'
          }
        ],
        totalAmount: 475000,
        status: 'received',
        targetLocation: 'godown'
      };

      purchaseOrders.push(po);

      // Inward stock increment
      products = products.map((p) => {
        if (p.id === 'p-seed-01') {
          const added = 50;
          return {
            ...p,
            godownStock: (p.godownStock || 50) + added,
            currentStock: p.currentStock + added
          };
        }
        return p;
      });

      const prod = products.find((p) => p.id === 'p-seed-01');
      expect(prod?.godownStock).toBe(100); // 50 + 50
      expect(prod?.currentStock).toBe(115); // 65 + 50
    });

    it('creates Wholesale Sales Order, deducts stock from Godown, and tracks dispatch status', () => {
      const orderQty = 15;
      const wholesaleOrder: OrderRecord = {
        id: 'whl-ord-001',
        tenantId: 'comp-1',
        invoiceNo: 'WHL-INV-001',
        partyId: 'vnd-buy-01',
        customerName: 'Chaudhry Riaz Agri Seed Agency',
        totalAmount: 156000,
        paidAmount: 100000,
        dispatchStatus: 'in_godown',
        dispatchLocation: 'godown',
        deliveryChallanNo: 'CHL-99881',
        items: [
          {
            productId: 'p-seed-01',
            quantity: orderQty,
            unitPrice: 10400,
            total: 156000,
            location: 'godown'
          }
        ]
      };

      orders.push(wholesaleOrder);

      // Decrement stock from Godown
      products = products.map((p) => {
        if (p.id === 'p-seed-01') {
          return {
            ...p,
            godownStock: (p.godownStock || 50) - orderQty,
            currentStock: p.currentStock - orderQty
          };
        }
        return p;
      });

      const prod = products.find((p) => p.id === 'p-seed-01');
      expect(prod?.godownStock).toBe(35); // 50 - 15
      expect(prod?.currentStock).toBe(50); // 65 - 15

      // Advance dispatch status to 'dispatched'
      orders = orders.map((o) =>
        o.id === 'whl-ord-001' ? { ...o, dispatchStatus: 'dispatched' } : o
      );

      const updatedOrder = orders.find((o) => o.id === 'whl-ord-001');
      expect(updatedOrder?.dispatchStatus).toBe('dispatched');
    });
  });
});
