// packages/ui/src/components/whatsapp/whatsappService.ts

export interface WhatsAppInvoiceData {
  phone: string;
  customerName: string;
  docNumber: string;
  docType: 'invoice' | 'challan' | 'kanta_slip' | 'khata_reminder';
  companyName: string;
  companyPhone?: string;
  totalAmount: number;
  paidAmount?: number;
  remainingDues?: number;
  currentBalance?: number;
  items?: Array<{ name: string; quantity: number; unitPrice?: number; total?: number; unit?: string }>;
}

export function sanitizePakistaniPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Strip spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // If starts with 03..., replace with 923...
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('+92')) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith('92') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
}

export function generateWhatsAppMessage(data: WhatsAppInvoiceData): string {
  const dateStr = new Date().toLocaleDateString('en-GB');

  if (data.docType === 'challan') {
    return `*${data.companyName.toUpperCase()}*
🚚 *DELIVERY CHALLAN & GATE PASS / ڈلیوری چالان*
━━━━━━━━━━━━━━━━━━━━
📄 *Challan #:* ${data.docNumber}
📅 *Date:* ${dateStr}
👤 *Consignee / خریدار:* ${data.customerName}
━━━━━━━━━━━━━━━━━━━━
📦 *Dispatch Items / روانہ شدہ مال:*
${(data.items || []).map((it, idx) => `${idx + 1}. ${it.name} - *${it.quantity} ${it.unit || 'Units'}*`).join('\n')}
━━━━━━━━━━━━━━━━━━━━
📌 *Status:* Goods Dispatched & Verified at Security Gate.
📞 *Contact:* ${data.companyPhone || ''}
_Sent via Enterprise ERP & Distribution System_`;
  }

  if (data.docType === 'khata_reminder') {
    return `*${data.companyName.toUpperCase()}*
📚 *BAHI-KHATA STATEMENT / کھاتہ یاددہانی*
━━━━━━━━━━━━━━━━━━━━
👤 *محترم جناب:* ${data.customerName}
📅 *تاریخ:* ${dateStr}
━━━━━━━━━━━━━━━━━━━━
💰 *موجودہ کل بقایا واجب الادا (Net Balance):* 
👉 *Rs. ${(data.currentBalance || 0).toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━
براہ کرم بقایا رقم کی جلد ادائیگی فرما کر رسید حاصل کریں۔
شکریہ، جزاک اللہ!
📞 *رابطہ نمبر:* ${data.companyPhone || ''}`;
  }

  if (data.docType === 'kanta_slip') {
    return `*${data.companyName.toUpperCase()}*
🌾 *GALLA MANDI KANTA WEIGHMENT SLIP / پرچی غلہ منڈی کانٹا*
━━━━━━━━━━━━━━━━━━━━
📄 *Slip #:* ${data.docNumber}
📅 *Date:* ${dateStr}
🌾 *Farmer/Beopari:* ${data.customerName}
━━━━━━━━━━━━━━━━━━━━
${(data.items || []).map((it) => `• Crop/Seed: *${it.name}*\n• Gross Weight: *${it.quantity} Mann*`).join('\n')}
💰 *Total Payable:* *Rs. ${data.totalAmount.toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━
_Al-Madina Grain Market & Agri Trade Platform_`;
  }

  // Default: Commercial Tax Invoice
  return `*${data.companyName.toUpperCase()}*
🧾 *COMMERCIAL TAX INVOICE / سیلز انوائس*
━━━━━━━━━━━━━━━━━━━━
📄 *Invoice #:* ${data.docNumber}
📅 *Date:* ${dateStr}
👤 *Customer / پارٹی:* ${data.customerName}
━━━━━━━━━━━━━━━━━━━━
🛒 *Bill Items / تفصیل اشیاء:*
${(data.items || []).map((it, idx) => `${idx + 1}. ${it.name} (x${it.quantity}) = Rs. ${(it.total || 0).toLocaleString()}`).join('\n')}
━━━━━━━━━━━━━━━━━━━━
💵 *Bill Total:* Rs. ${data.totalAmount.toLocaleString()}
💳 *Paid:* Rs. ${(data.paidAmount ?? data.totalAmount).toLocaleString()}
⚠️ *Remaining Dues:* Rs. ${(data.remainingDues || 0).toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
Thank you for your business! / آپ کے تعاون کا شکریہ!
📞 *Phone:* ${data.companyPhone || ''}`;
}

export function openWhatsAppShare(data: WhatsAppInvoiceData): void {
  const formattedPhone = sanitizePakistaniPhoneNumber(data.phone);
  const text = encodeURIComponent(generateWhatsAppMessage(data));
  const url = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${text}`
    : `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}
