// packages/ui/src/components/receipts/MandiKantaSlip.tsx
import React from 'react';

export interface MandiKantaSlipProps {
  mandiTitle: string;
  shopNumber: string;
  commissionAgentName: string;
  date: string;
  slipNo: string;
  commodity: string;
  growerName: string;
  growerVillage: string;
  vehicleNo: string;
  bagCount: number;
  grossWeightKg: number;
  tarePerBagKg: number;
  ratePerMann: number;
  arhatCommissionPct: number;
  mazdooriPerBag: number;
  kantaFee: number;
}

export const MandiKantaSlip: React.FC<MandiKantaSlipProps> = ({
  commissionAgentName,
  commodity,
  growerName,
  bagCount,
  grossWeightKg,
  tarePerBagKg,
  ratePerMann,
  arhatCommissionPct,
  mazdooriPerBag,
  kantaFee
}) => {
  const totalTareKg = bagCount * tarePerBagKg;
  const netWeightKg = grossWeightKg - totalTareKg;
  const netMann = netWeightKg / 40.0;
  const grossValue = netMann * ratePerMann;
  const commission = (grossValue * arhatCommissionPct) / 100.0;
  const totalMazdoori = bagCount * mazdooriPerBag;
  const totalDeductions = commission + totalMazdoori + kantaFee;
  const finalPayable = grossValue - totalDeductions;

  return (
    <div id="receipt-print-area" className="w-[79mm] bg-white text-black p-3 font-mono text-xs mx-auto border-2 border-black text-right">
      <div className="text-center border-b border-black pb-1">
        <h1 className="text-base font-bold">{commissionAgentName}</h1>
        <div className="text-xs font-bold">کانٹا تول و خریداری پرچی</div>
      </div>
      <div className="my-2 space-y-1">
        <div>زمیندار: {growerName}</div>
        <div>جنس: {commodity}</div>
        <div>تعداد بوریاں: {bagCount}</div>
        <div>کانٹا وزن: {grossWeightKg.toFixed(2)} KG</div>
        <div className="font-bold">صافی وزن: {netWeightKg.toFixed(2)} KG ({netMann.toFixed(2)} من)</div>
        <div className="border-t border-black pt-1 font-bold text-sm">صافی ادائیگی: Rs. {finalPayable.toFixed(2)}</div>
      </div>
    </div>
  );
};