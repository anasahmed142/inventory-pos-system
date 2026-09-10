// packages/ui/src/components/excel/excelHub.ts
import * as XLSX from 'xlsx';
import {
  ProductRecord,
  OrderRecord,
  KhataPartyRecord,
  KhataEntryRecord,
  ExpenseRecord
} from '../../stores/masterDataStore';

export class ExcelDataService {
  /**
   * PRODUCTS: 1-Click Export to Excel (.xlsx)
   */
  public static exportProductsToExcel(products: ProductRecord[], filename = 'Products_Catalog.xlsx'): void {
    const data = products.map((p, idx) => ({
      'S.No': idx + 1,
      'Product ID': p.id,
      'Barcode / بارکوڈ': p.barcode,
      'Product Name / نام': p.name,
      'Urdu Name / اردو نام': p.urduName || '',
      'Category / کیٹیگری': p.category,
      'Unit / اکائی': p.unit || 'Piece',
      'Cost Price (Rs.) / قیمت خرید': p.costPrice,
      'Retail Price (Rs.) / پرچون ریٹ': p.retailPrice,
      'Wholesale Price (Rs.) / ہول سیل ریٹ': p.wholesalePrice || p.retailPrice,
      'Total Stock / کل اسٹاک': p.currentStock,
      'Godown Stock / گودام اسٹاک': p.godownStock ?? p.currentStock,
      'Shop Stock / دکان اسٹاک': p.shopStock ?? 0,
      'Min Alert Threshold / کم از کم حد': p.minThreshold || 5
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, filename);
  }

  /**
   * PRODUCTS: Download Sample Template (.xlsx)
   */
  public static downloadProductsSampleTemplate(): void {
    const sampleRows = [
      {
        'Barcode / بارکوڈ': '896900112233',
        'Product Name / آئٹم نام': 'Super Basmati Rice 25kg Bag',
        'Urdu Name / اردو نام': 'سپر باسمتی چاول 25 کلو بوری',
        'Category / کیٹیگری': 'Grains & Groceries',
        'Unit / اکائی': 'Bag',
        'Cost Price / قیمت خرید': 6200,
        'Retail Price / پرچون ریٹ': 7000,
        'Wholesale Price / ہول سیل ریٹ': 6600,
        'Opening Stock / ابتدائی اسٹاک': 50,
        'Min Alert Threshold / کم از کم حد': 5
      },
      {
        'Barcode / بارکوڈ': '896900445566',
        'Product Name / آئٹم نام': 'Hybrid Corn Seed Pioneer 30Y87',
        'Urdu Name / اردو نام': 'ہائبرڈ مکئی بیج پائنیر 20 کلو',
        'Category / کیٹیگری': 'Hybrid Seeds & Agri',
        'Unit / اکائی': 'Bag',
        'Cost Price / قیمت خرید': 9800,
        'Retail Price / پرچون ریٹ': 11000,
        'Wholesale Price / ہول سیل ریٹ': 10400,
        'Opening Stock / ابتدائی اسٹاک': 30,
        'Min Alert Threshold / کم از کم حد': 3
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products_Template');
    XLSX.writeFile(wb, 'Products_Import_Template.xlsx');
  }

  /**
   * PRODUCTS: Parse Uploaded Excel or CSV File
   */
  public static async parseProductsFile(file: File, tenantId: string): Promise<Partial<ProductRecord>[]> {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const wsName = wb.SheetNames[0];
    const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wsName]);

    return rawData.map((row: Record<string, any>) => {
      // Flexible column matcher
      const name = row['Product Name / آئٹم نام'] || row['Product Name / نام'] || row['Product Name'] || row['Name'] || row['آئٹم نام'] || 'Unnamed Product';
      const urduName = row['Urdu Name / اردو نام'] || row['Urdu Name'] || row['اردو نام'] || '';
      const barcode = String(row['Barcode / بارکوڈ'] || row['Barcode'] || row['بارکوڈ'] || Math.floor(100000000000 + Math.random() * 900000000000));
      const category = row['Category / کیٹیگری'] || row['Category'] || row['کیٹیگری'] || 'General';
      const unit = row['Unit / اکائی'] || row['Unit'] || row['اکائی'] || 'Piece';
      const costPrice = Number(row['Cost Price / قیمت خرید'] || row['Cost Price'] || row['قیمت خرید'] || 0);
      const retailPrice = Number(row['Retail Price / پرچون ریٹ'] || row['Retail Price'] || row['پرچون ریٹ'] || costPrice * 1.15);
      const wholesalePrice = Number(row['Wholesale Price / ہول سیل ریٹ'] || row['Wholesale Price'] || row['ہول سیل ریٹ'] || retailPrice * 0.95);
      const currentStock = Number(row['Opening Stock / ابتدائی اسٹاک'] || row['Opening Stock'] || row['Stock'] || row['اسٹاک'] || 0);
      const minThreshold = Number(row['Min Alert Threshold / کم از کم حد'] || row['Min Threshold'] || 5);

      return {
        id: `p-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
        tenantId,
        name,
        urduName,
        barcode,
        category,
        unit,
        costPrice,
        retailPrice,
        wholesalePrice,
        currentStock,
        godownStock: currentStock,
        shopStock: 0,
        minThreshold
      };
    });
  }

  /**
   * ORDERS: 1-Click Export to Excel (.xlsx)
   */
  public static exportOrdersToExcel(orders: OrderRecord[], filename = 'Sales_And_Trade_Orders.xlsx'): void {
    const data = orders.map((o, idx) => ({
      'S.No': idx + 1,
      'Order ID': o.id,
      'Invoice / Challan #': o.invoiceNo || o.deliveryChallanNo || 'N/A',
      'Order Type / طریقہ کار': o.orderType || 'Retail POS',
      'Party / Customer': o.partyName || o.customerName || 'Walk-in Cash Customer',
      'Customer Phone': o.customerPhone || 'N/A',
      'Total Bill (Rs.)': o.totalAmount,
      'Paid Amount (Rs.)': o.paidAmount,
      'Remaining Dues (Rs.)': o.remainingDues || Math.max(0, o.totalAmount - o.paidAmount),
      'Payment Method': o.paymentMethod || 'Cash',
      'FBR POS ID / USIN': o.fbrInvoiceNumber || 'Local POS',
      'Dispatch Status': o.dispatchStatus || 'Completed',
      'Date & Time': o.date
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trade_Orders');
    XLSX.writeFile(wb, filename);
  }

  /**
   * BAHI-KHATA: 1-Click Export to Excel (.xlsx)
   */
  public static exportKhataToExcel(parties: KhataPartyRecord[], entries: KhataEntryRecord[], filename = 'Bahi_Khata_Ledger.xlsx'): void {
    const partiesData = parties.map((p, idx) => ({
      'S.No': idx + 1,
      'Account ID': p.id,
      'Party Name / نام': p.name,
      'Urdu Name / اردو نام': p.urduName || '',
      'Phone / رابطہ': p.phone,
      'Account Type / قسم': p.partyType === 'supplier' ? 'Supplier (سپلائر)' : 'Customer (گاہک/بیوپاری)',
      'Current Balance (Rs.) / بقایا': p.balance,
      'Status / پوزیشن': p.balance > 0 ? 'Receivable (لینے ہیں)' : p.balance < 0 ? 'Payable (دینے ہیں)' : 'Settled (برابر)',
      'Credit Limit / ادھار حد': p.creditLimit || 0,
      'Last Activity': p.lastEntryDate
    }));

    const entriesData = entries.map((e, idx) => ({
      'S.No': idx + 1,
      'Entry ID': e.id,
      'Party Name / پارٹی': e.partyName,
      'Type / اندراج': e.entryType === 'naam' ? 'Naam / Debit (نام وصولی)' : 'Jama / Credit (جمع ادائیگی)',
      'Amount (Rs.) / رقم': e.amount,
      'Description / تفصیل': e.description,
      'Urdu Description / اردو تفصیل': e.urduDescription || '',
      'Date & Time / تاریخ': e.date
    }));

    const wb = XLSX.utils.book_new();
    const wsParties = XLSX.utils.json_to_sheet(partiesData);
    const wsEntries = XLSX.utils.json_to_sheet(entriesData);
    XLSX.utils.book_append_sheet(wb, wsParties, 'Khata_Parties');
    XLSX.utils.book_append_sheet(wb, wsEntries, 'Ledger_Transactions');
    XLSX.writeFile(wb, filename);
  }

  /**
   * BAHI-KHATA: Download Parties Sample Template (.xlsx)
   */
  public static downloadPartiesSampleTemplate(): void {
    const sampleRows = [
      {
        'Party Name / پارٹی نام': 'Chaudhry Riaz Agri Agency',
        'Urdu Name / اردو نام': 'چوہدری ریاض ایگری ایجنسی',
        'Phone / موبائل': '0300-7654321',
        'Account Type (customer/supplier)': 'customer',
        'Opening Balance / سابقہ بقایا': 56000,
        'Credit Limit / ادھار حد': 200000
      },
      {
        'Party Name / پارٹی نام': 'Pioneer Agri Seeds Pakistan',
        'Urdu Name / اردو نام': 'پائنیر ایگری سیڈز پاکستان',
        'Phone / موبائل': '042-35876543',
        'Account Type (customer/supplier)': 'supplier',
        'Opening Balance / سابقہ بقایا': -145000,
        'Credit Limit / ادھار حد': 500000
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Khata_Template');
    XLSX.writeFile(wb, 'Khata_Parties_Import_Template.xlsx');
  }

  /**
   * BAHI-KHATA: Parse Parties Excel or CSV File
   */
  public static async parsePartiesFile(file: File, tenantId: string): Promise<Partial<KhataPartyRecord>[]> {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const wsName = wb.SheetNames[0];
    const rawData: Record<string, any>[] = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wsName]);

    return rawData.map((row: Record<string, any>) => {
      const name = row['Party Name / پارٹی نام'] || row['Party Name'] || row['Name'] || row['پارٹی نام'] || 'Unnamed Party';
      const urduName = row['Urdu Name / اردو نام'] || row['Urdu Name'] || row['اردو نام'] || '';
      const phone = String(row['Phone / موبائل'] || row['Phone'] || row['موبائل'] || '0300-0000000');
      const rawType = String(row['Account Type (customer/supplier)'] || row['Account Type'] || 'customer').toLowerCase();
      const partyType: 'customer' | 'supplier' = rawType.includes('supp') ? 'supplier' : 'customer';
      const balance = Number(row['Opening Balance / سابقہ بقایا'] || row['Opening Balance'] || row['Balance'] || 0);
      const creditLimit = Number(row['Credit Limit / ادھار حد'] || row['Credit Limit'] || 100000);

      return {
        id: `kp-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
        tenantId,
        name,
        urduName,
        phone,
        partyType,
        balance,
        creditLimit,
        lastEntryDate: 'Imported via Excel'
      };
    });
  }

  /**
   * EXPENSES: 1-Click Export to Excel (.xlsx)
   */
  public static exportExpensesToExcel(expenses: ExpenseRecord[], filename = 'Daily_Roznamcha_Expenses.xlsx'): void {
    const data = expenses.map((exp, idx) => ({
      'S.No': idx + 1,
      'Expense ID': exp.id,
      'Category / مد': exp.category,
      'Title / تفصیل': exp.title,
      'Urdu Title / اردو تفصیل': exp.urduTitle || '',
      'Amount (Rs.) / رقم': exp.amount,
      'Paid To / وصول کنندہ': exp.paidTo || 'Cash Payment',
      'Payment Method': exp.paymentMethod,
      'Receipt / Vouch #': exp.receiptNo || 'N/A',
      'Date & Time': exp.date,
      'Notes': exp.notes || ''
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daily_Expenses');
    XLSX.writeFile(wb, filename);
  }
}
