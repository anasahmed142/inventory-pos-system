// packages/hardware/src/compliance/fbr.ts
export interface FbrInvoicePayload {
  InvoiceNumber: string;
  POSID: number;
  USIN: string;
  DateTime: string;
  TotalSaleValue: number;
  TotalQuantity: number;
  TotalBillAmount: number;
  TotalSalesTax: number;
  PaymentMode: number;
  InvoiceType: number;
}

export class FbrService {
  public static generateTaxAsaanQrString(payload: FbrInvoicePayload, sellerNtn: string): string {
    const dateFormatted = payload.DateTime.replace(/[- :]/g, '').slice(0, 14);
    return `FBR:${payload.POSID}|${payload.USIN}|${dateFormatted}|${payload.TotalBillAmount.toFixed(2)}|${payload.TotalSalesTax.toFixed(2)}|${sellerNtn}`;
  }
}