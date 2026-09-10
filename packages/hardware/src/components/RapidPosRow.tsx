// packages/hardware/src/components/RapidPosRow.tsx
import React, { useState } from 'react';
import { useWeightScale } from '../scales/useWeightScale';
import { useBarcodeScanner } from '../scanner/useBarcodeScanner';
import type { Product } from '@inventory/shared-types';

export interface CartItem {
  product: Product;
  quantity: number;
  unit: string;
  rate: number;
  lineTotal: number;
}

export const RapidPosRow: React.FC<{
  onAddToCart: (item: CartItem) => void;
  productLookup: (barcode: string) => Promise<Product | null>;
}> = ({ onAddToCart, productLookup }) => {
  const scale = useWeightScale({ protocol: 'yaohua_a12', baudRate: 9600, mockMode: true });
  const [status, setStatus] = useState('Ready for Barcode Scan...');

  useBarcodeScanner(async (barcode) => {
    setStatus(`Scanned: ${barcode}`);
    const p = await productLookup(barcode);
    if (p) {
      const qty = p.is_weighted ? Math.max(0.25, scale.weightKg) : 1;
      onAddToCart({ product: p, quantity: qty, unit: p.default_unit_id, rate: p.retail_price, lineTotal: qty * p.retail_price });
      setStatus(`Added: ${p.name}`);
    }
  });

  return (
    <div className="bg-slate-900 border border-slate-700 text-white rounded-lg p-3 flex justify-between items-center mb-4">
      <div className="flex items-center space-x-3">
        <span className="font-mono text-2xl text-emerald-400 font-bold">{scale.weightKg.toFixed(3)} KG</span>
        <span className="text-xs text-slate-400">({scale.weightMann.toFixed(2)} Mann)</span>
      </div>
      <div className="text-xs text-amber-400">{status}</div>
    </div>
  );
};