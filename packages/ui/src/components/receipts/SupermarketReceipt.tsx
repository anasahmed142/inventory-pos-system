// packages/ui/src/components/receipts/SupermarketReceipt.tsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface SupermarketReceiptProps {
  shopName: string;
  urduShopName: string;
  address: string;
  phone: string;
  ntnStrn: string;
  invoiceNo: string;
  cashier: string;
  dateTime: string;
  items: Array<{ name: string; qty: number; rate: number; total: number }>;
  subTotal: number;
  discount: number;
  gstAmount: number;
  netTotal: number;
  cashReceived: number;
  changeReturn: number;
  fbrInvoiceNumber?: string;
  widthMm?: 80 | 58;
}

export const SupermarketReceipt: React.FC<SupermarketReceiptProps> = ({
  shopName,
  urduShopName,
  address,
  phone,
  ntnStrn,
  invoiceNo,
  cashier,
  dateTime,
  items,
  subTotal,
  discount,
  gstAmount,
  netTotal,
  cashReceived,
  changeReturn,
  fbrInvoiceNumber = 'FBR-INV-896431',
  widthMm = 80
}) => {
  return (
    <div id="receipt-print-area" className="bg-white text-black p-2 font-mono text-xs w-[79mm] mx-auto border border-black">
      <div className="text-center pb-2 border-b border-black">
        <h1 className="text-base font-bold uppercase">{shopName}</h1>
        <h2 className="text-sm font-semibold">{urduShopName}</h2>
        <p className="text-[10px]">{address}</p>
        <p className="text-[10px]">Phone: {phone}</p>
        <p className="text-[10px] font-bold">NTN/STRN: {ntnStrn}</p>
      </div>
      <div className="py-1 text-[11px] border-b border-black flex justify-between">
        <span>Inv: #{invoiceNo}</span>
        <span>{dateTime}</span>
      </div>
      <table className="w-full my-2 text-left">
        <thead>
          <tr className="border-b border-black text-[10px] uppercase font-bold">
            <th>Item</th><th className="text-center">Qty</th><th className="text-right">Rate</th><th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={idx} className="text-[11px]">
              <td>{it.name}</td><td className="text-center">{it.qty}</td><td className="text-right">{it.rate.toFixed(2)}</td><td className="text-right">{it.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-black pt-1 space-y-0.5 text-[11px]">
        <div className="flex justify-between"><span>Subtotal:</span><span>Rs. {subTotal.toFixed(2)}</span></div>
        <div className="flex justify-between font-bold text-sm"><span>NET TOTAL:</span><span>Rs. {netTotal.toFixed(2)}</span></div>
      </div>
      <div className="mt-3 text-center flex flex-col items-center">
        <QRCodeSVG value={`POS:${fbrInvoiceNumber}|NTN:${ntnStrn}|AMT:${netTotal}`} size={80} level="M" />
        <span className="text-[9px] font-bold mt-1">FBR POS INVOICE # {fbrInvoiceNumber}</span>
      </div>
    </div>
  );
};