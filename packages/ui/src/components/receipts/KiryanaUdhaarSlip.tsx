// packages/ui/src/components/receipts/KiryanaUdhaarSlip.tsx
import React from 'react';

export interface KiryanaUdhaarSlipProps {
  shopName: string;
  urduShopName: string;
  customerName: string;
  customerPhone: string;
  khataAccountNo: string;
  invoiceNo: string;
  dateTime: string;
  items: Array<{ name: string; qty: string; total: number }>;
  previousBalance: number;
  todayBill: number;
  cashReceived: number;
}

export const KiryanaUdhaarSlip: React.FC<KiryanaUdhaarSlipProps> = ({
  shopName,
  urduShopName,
  customerName,
  customerPhone,
  khataAccountNo,
  invoiceNo,
  dateTime,
  items,
  previousBalance,
  todayBill,
  cashReceived
}) => {
  const totalDue = previousBalance + todayBill;
  const remainingBalance = totalDue - cashReceived;

  return (
    <div id="receipt-print-area" className="w-[79mm] bg-white text-black p-3 font-mono text-xs mx-auto border border-black text-right">
      <div className="text-center border-b border-black pb-1">
        <h1 className="text-base font-bold">{urduShopName}</h1>
        <h2 className="text-xs">{shopName}</h2>
        <span className="bg-black text-white px-2 py-0.5 text-[10px] font-bold">کھاتہ و ادھار پرچی</span>
      </div>
      <div className="my-2 border-b border-black pb-1">
        <div>گاہک کا نام: {customerName}</div>
        <div>سابقہ بقایا: Rs. {previousBalance.toFixed(2)}</div>
        <div>آج کا بل: Rs. {todayBill.toFixed(2)}</div>
        <div className="font-bold">بقایا کھاتہ: Rs. {remainingBalance.toFixed(2)}</div>
      </div>
      <div className="text-center text-[10px] mt-2">براہ کرم بقایا رقم وقت پر ادا فرمائیں۔ شکریہ!</div>
    </div>
  );
};