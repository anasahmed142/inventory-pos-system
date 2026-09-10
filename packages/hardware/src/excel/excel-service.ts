// packages/hardware/src/excel/excel-service.ts
import * as XLSX from 'xlsx';
import type { Product } from '@inventory/shared-types';

export class ExcelService {
  public static downloadProductTemplate(): void {
    const headers = [
      'Barcode / بارکوڈ',
      'Product Name / آئٹم کا نام',
      'Urdu Name / اردو نام',
      'Default Unit / بنیادی اکائی (pc/kg/mann)',
      'Cost Price / قیمت خرید',
      'Retail Price / پرچون ریٹ',
      'Wholesale Price / ہول سیل ریٹ',
      'Opening Stock / موجودہ اسٹاک',
      'Is Weighted / وزنی اشیاء (YES/NO)'
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Products_Template.xlsx');
  }
}