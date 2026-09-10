// packages/ui/src/components/printing/DocumentPrintModal.tsx
import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Truck,
  CheckCircle2,
  Building2,
  Store,
  Phone,
  QrCode,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Share2
} from 'lucide-react';
import { useTenantBrandingStore } from '../../theming/tenantBrandingStore';
import { OrderRecord, PurchaseOrderRecord } from '../../stores/masterDataStore';
import { openWhatsAppShare } from '../whatsapp/whatsappService';

export type PrintFormatType = 'a4_full' | 'a5_half' | 'thermal_80mm';
export type DocumentModeType = 'challan' | 'invoice';

export interface DocumentPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderRecord | null;
  purchaseOrder?: PurchaseOrderRecord | null;
  initialMode?: DocumentModeType;
  initialFormat?: PrintFormatType;
}

export const DocumentPrintModal: React.FC<DocumentPrintModalProps> = ({
  isOpen,
  onClose,
  order,
  purchaseOrder,
  initialMode = 'challan',
  initialFormat = 'a4_full'
}) => {
  const profile = useTenantBrandingStore((s) => s.profile);

  const [printFormat, setPrintFormat] = useState<PrintFormatType>(initialFormat);
  const [docMode, setDocMode] = useState<DocumentModeType>(initialMode);

  if (!isOpen || (!order && !purchaseOrder)) return null;

  const isSalesOrder = !!order;
  const docNumber = order?.deliveryChallanNo || order?.invoiceNo || purchaseOrder?.orderNumber || 'DOC-001';
  const partyName = order?.customerName || order?.partyName || purchaseOrder?.supplierName || 'General Party';
  const partyPhone = order?.customerPhone || purchaseOrder?.supplierPhone || '0300-0000000';
  const dateStr = order?.date || purchaseOrder?.date || new Date().toLocaleDateString();
  const vehicleNo = order?.vehicleNumber || 'Store Vehicle (LES-4820)';
  const driverName = order?.driverName || 'Mohammad Aslam';
  const driverPhone = order?.driverPhone || '0300-9876543';
  const location = order?.dispatchLocation || purchaseOrder?.targetLocation || 'godown';
  const totalAmount = order?.totalAmount || purchaseOrder?.totalAmount || 0;
  const paidAmount = order?.paidAmount || purchaseOrder?.paidAmount || 0;
  const balanceDue = order?.remainingDues ?? Math.max(0, totalAmount - paidAmount);
  const paymentMethod = order?.paymentMethod || purchaseOrder?.paymentMethod || 'Cash';

  const items = order?.items || purchaseOrder?.items?.map((it) => ({
    id: it.productId,
    productName: `${it.productName} (${it.productUrduName || ''})`,
    quantity: it.quantity,
    unitPrice: it.costPrice,
    total: it.total,
    location: it.targetLocation
  })) || [];

  const subtotal = items.reduce((acc, it) => acc + it.total, 0);
  const gstTax = docMode === 'invoice' ? Math.round(subtotal * 0.18) : 0;
  const grandTotal = subtotal + gstTax;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const customerName = order?.customerName || order?.partyName || purchaseOrder?.supplierName || 'Valued Client';
    const customerPhone = order?.customerPhone || purchaseOrder?.supplierPhone || '';
    const items = (order?.items || []).map((it) => ({
      name: it.productName,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total
    }));

    openWhatsAppShare({
      phone: customerPhone,
      customerName,
      docNumber,
      docType: docMode,
      companyName: profile?.name || 'Al-Madina Distribution & Trading',
      companyPhone: profile?.phone || '041-8812345',
      totalAmount: order?.totalAmount || purchaseOrder?.totalAmount || 0,
      paidAmount: order?.paidAmount || purchaseOrder?.paidAmount || 0,
      remainingDues: order?.remainingDues || 0,
      items
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-[#1e1e2d] border border-slate-200 dark:border-[#2b2b40] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden my-auto">
        {/* Modal Top Control Bar */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-[#151521] border-b border-slate-200 dark:border-[#2b2b40] flex flex-wrap items-center justify-between gap-2.5">
          {/* Document Mode Toggle */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-white dark:bg-[#1e1e2d] p-1 rounded-xl border border-slate-200 dark:border-[#2b2b40] overflow-x-auto max-w-full">
            <button
              onClick={() => setDocMode('challan')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 sm:space-x-1.5 whitespace-nowrap ${
                docMode === 'challan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Truck size={14} />
              <span>Challan (ڈلیوری چالان)</span>
            </button>
            <button
              onClick={() => setDocMode('invoice')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 sm:space-x-1.5 whitespace-nowrap ${
                docMode === 'invoice'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText size={14} />
              <span>Invoice (ٹیکس انوائس)</span>
            </button>
          </div>

          {/* 3 Print Format Selectors */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-white dark:bg-[#1e1e2d] p-1 rounded-xl border border-slate-200 dark:border-[#2b2b40] overflow-x-auto max-w-full">
            <button
              onClick={() => setPrintFormat('a4_full')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                printFormat === 'a4_full'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📄 Full A4
            </button>
            <button
              onClick={() => setPrintFormat('a5_half')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                printFormat === 'a5_half'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              📑 Half A5
            </button>
            <button
              onClick={() => setPrintFormat('thermal_80mm')}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                printFormat === 'thermal_80mm'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              🧾 80mm Wax
            </button>
          </div>

          {/* Close Action */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ml-auto"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Document Preview Canvas */}
        <div className="flex-1 p-2 sm:p-6 overflow-y-auto overflow-x-auto bg-slate-100 dark:bg-[#151521]/60 flex justify-start sm:justify-center">
          {/* ========================================================= */}
          {/* FORMAT 1: FULL A4 PORTRAIT PAGE                           */}
          {/* ========================================================= */}
          {printFormat === 'a4_full' && (
            <div className="w-full max-w-[210mm] bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-200 font-sans text-xs space-y-5 print:p-0 print:border-none print:shadow-none">
              {/* Header with Logo */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-slate-800">
                <div className="flex items-center space-x-4">
                  {profile?.logoBase64 ? (
                    <img
                      src={profile.logoBase64}
                      alt="Company Logo"
                      className="w-16 h-16 object-contain rounded-xl border border-slate-200 p-1"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center">
                      IS
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">
                      {profile?.name || 'Al-Madina Seed & Commodity Distribution Hub'}
                    </h1>
                    <div className="text-sm font-urdu text-slate-700 font-bold">
                      {profile?.urduName || 'المدینہ سیڈ اینڈ ایگرو ڈسٹری بیوشن کارپوریشن'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {profile?.address || 'Grain Market'} • Phone: {profile?.phone || '041-8812345'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider">
                    {docMode === 'challan' ? 'Delivery Challan & Gate Pass' : 'Commercial Tax Invoice'}
                  </div>
                  <div className="text-xs font-mono font-bold mt-1.5 text-slate-800">
                    Doc #: {docNumber}
                  </div>
                  <div className="text-[11px] text-slate-500">Date: {dateStr}</div>
                </div>
              </div>

              {/* Tax & Registration Bar */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
                <div>
                  <span className="text-slate-500 font-medium">NTN:</span>{' '}
                  <strong className="font-mono">{profile?.ntnStrn || '3201456-7'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">STRN / Sales Tax:</span>{' '}
                  <strong className="font-mono">32-77-8761-234-55</strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Authority:</span>{' '}
                  <strong>PRA / FBR Tier-1 Active</strong>
                </div>
              </div>

              {/* Two-Column Consignee & Dispatcher Box */}
              <div className="grid grid-cols-2 gap-4">
                {/* Consignee */}
                <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {isSalesOrder ? 'Billed & Consigned To (خریدار)' : 'Procured From Supplier (سپلائر)'}
                  </div>
                  <div className="text-sm font-bold text-slate-900">{partyName}</div>
                  <div className="text-slate-600">Phone: {partyPhone}</div>
                  <div className="text-slate-500">Destination Market / Town: Faisalabad Region</div>
                </div>

                {/* Dispatch & Transport Logistics */}
                <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Transport & Gate Dispatch (ٹرانسپورٹ و روانگی)
                  </div>
                  <div className="text-xs font-bold text-slate-900">
                    Vehicle #: <span className="font-mono font-bold text-blue-700">{vehicleNo}</span>
                  </div>
                  <div className="text-slate-600">
                    Driver: {driverName} ({driverPhone})
                  </div>
                  <div className="text-slate-500 capitalize flex items-center space-x-1">
                    <span>Source Location:</span>
                    <strong className="text-slate-800 font-bold">{location === 'godown' ? '🏢 Godown Warehouse' : '🏪 Shop Counter'}</strong>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 font-bold text-slate-700 text-[11px]">
                      <th className="py-2.5 px-3">Sr #</th>
                      <th className="py-2.5 px-3">Item Variety & Specification</th>
                      <th className="py-2.5 px-3 text-center">Bori / Sacks Qty</th>
                      {docMode === 'invoice' && <th className="py-2.5 px-3 text-right">Unit Rate (Rs.)</th>}
                      {docMode === 'invoice' && <th className="py-2.5 px-3 text-right">Tax (18%)</th>}
                      {docMode === 'invoice' && <th className="py-2.5 px-3 text-right">Total Amount (Rs.)</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{it.productName}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold">{it.quantity}</td>
                        {docMode === 'invoice' && (
                          <td className="py-2.5 px-3 text-right font-mono">Rs. {it.unitPrice.toLocaleString()}</td>
                        )}
                        {docMode === 'invoice' && (
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                            Rs. {Math.round(it.total * 0.18).toLocaleString()}
                          </td>
                        )}
                        {docMode === 'invoice' && (
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            Rs. {Math.round(it.total * 1.18).toLocaleString()}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total & Summary Breakdown (Invoice Mode) */}
              {docMode === 'invoice' && (
                <div className="flex justify-end">
                  <div className="w-64 space-y-1.5 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal (Net):</span>
                      <span className="font-mono font-bold">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Sales Tax GST (18%):</span>
                      <span className="font-mono font-bold">Rs. {gstTax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-black text-sm pt-1.5 border-t border-slate-200 text-slate-900">
                      <span>Grand Total:</span>
                      <span className="font-mono text-purple-700">Rs. {grandTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Payment Method:</span>
                      <span className="font-bold">{paymentMethod}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Challan Gate Instructions */}
              {docMode === 'challan' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1">
                  <div className="font-bold">Gate Pass & Road Transit Verification:</div>
                  <p>
                    Please verify the physical bag count against this delivery challan before releasing the vehicle from the godown premises. Any discrepancy or damage in transit must be endorsed on this slip.
                  </p>
                </div>
              )}

              {/* Dual Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center text-xs text-slate-600">
                <div>
                  <div className="border-t border-dashed border-slate-400 pt-2 font-bold">
                    Warehouse In-Charge / Authorized Officer
                  </div>
                  <div className="text-[10px] text-slate-400 font-urdu mt-0.5">دستخط انچارج گودام / جاری کنندہ</div>
                </div>
                <div>
                  <div className="border-t border-dashed border-slate-400 pt-2 font-bold">
                    Driver / Receiving Party Signature
                  </div>
                  <div className="text-[10px] text-slate-400 font-urdu mt-0.5">دستخط ڈرائیور / وصول کنندہ</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FORMAT 2: HALF A5 VOUCHER (LANDSCAPE)                      */}
          {/* ========================================================= */}
          {printFormat === 'a5_half' && (
            <div className="w-full max-w-[210mm] bg-white text-slate-900 p-5 rounded-xl shadow-lg border border-slate-200 font-sans text-xs space-y-3 print:p-0 print:border-none print:shadow-none">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  {profile?.logoBase64 && (
                    <img src={profile.logoBase64} alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
                  )}
                  <div>
                    <h2 className="text-base font-black text-slate-900">{profile?.name || 'Inventory System'}</h2>
                    <div className="text-[10px] text-slate-500">NTN: {profile?.ntnStrn || '3201456-7'} • {profile?.phone}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px] font-bold uppercase">
                    {docMode === 'challan' ? 'A5 Delivery Challan' : 'A5 Tax Invoice'}
                  </span>
                  <div className="text-[11px] font-mono font-bold mt-1">Doc #{docNumber}</div>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded-lg text-[10px]">
                <div><strong>Party:</strong> {partyName}</div>
                <div><strong>Vehicle:</strong> {vehicleNo}</div>
                <div><strong>Date:</strong> {dateStr}</div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-slate-100 border-b font-bold text-slate-700">
                    <th className="py-1 px-2">Item</th>
                    <th className="py-1 px-2 text-center">Bags</th>
                    {docMode === 'invoice' && <th className="py-1 px-2 text-right">Rate</th>}
                    {docMode === 'invoice' && <th className="py-1 px-2 text-right">Total</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-1.5 px-2 font-medium">{it.productName}</td>
                      <td className="py-1.5 px-2 text-center font-bold">{it.quantity}</td>
                      {docMode === 'invoice' && <td className="py-1.5 px-2 text-right font-mono">Rs. {it.unitPrice}</td>}
                      {docMode === 'invoice' && <td className="py-1.5 px-2 text-right font-mono font-bold">Rs. {it.total.toLocaleString()}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Signatures */}
              <div className="flex justify-between items-end pt-3 border-t border-slate-200 text-[10px]">
                <div>
                  <div>Driver: {driverName} ({driverPhone})</div>
                  <div className="text-slate-400 mt-2 border-t border-dashed w-36 pt-1">Driver Signature</div>
                </div>
                {docMode === 'invoice' && (
                  <div className="text-right">
                    <div className="font-bold text-sm text-purple-700 font-mono">Net: Rs. {grandTotal.toLocaleString()}</div>
                    <div className="text-slate-400 mt-1 border-t border-dashed w-36 pt-1">Authorized Signature</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FORMAT 3: 80MM / 58MM HEAT WAX THERMAL ROLL RECEIPT       */}
          {/* ========================================================= */}
          {printFormat === 'thermal_80mm' && (
            <div className="w-80 bg-white text-slate-900 p-4 rounded-xl shadow-lg border border-slate-200 font-mono text-xs space-y-3 print:p-0 print:border-none print:shadow-none">
              {/* Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-400 space-y-1">
                {profile?.logoBase64 && (
                  <img src={profile.logoBase64} alt="Logo" className="w-12 h-12 object-contain mx-auto mb-1" />
                )}
                <div className="font-black text-sm">{profile?.name || 'Inventory System'}</div>
                <div className="text-[10px] font-urdu">{profile?.urduName || 'انوینٹری سسٹم'}</div>
                <div className="text-[10px] text-slate-500">NTN: {profile?.ntnStrn || '3201456-7'}</div>
                <div className="text-[10px] text-slate-500">Phone: {profile?.phone || '0300-1234567'}</div>
                <div className="font-bold text-xs uppercase text-blue-600 mt-1">
                  *** {docMode === 'challan' ? 'DELIVERY GATE PASS' : 'SALES TAX RECEIPT'} ***
                </div>
              </div>

              {/* Meta */}
              <div className="text-[11px] space-y-0.5">
                <div>Doc #: <strong>{docNumber}</strong></div>
                <div>Date: {dateStr}</div>
                <div>Party: <strong>{partyName}</strong></div>
                <div>Vehicle: <strong>{vehicleNo}</strong></div>
              </div>

              {/* Items */}
              <div className="pt-2 border-t border-dashed border-slate-400 space-y-1">
                {items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate w-40">{it.productName} x{it.quantity}</span>
                    <span className="font-bold">Rs. {it.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-dashed border-slate-400 space-y-1">
                <div className="flex justify-between font-black text-sm">
                  <span>Net Amount:</span>
                  <span>Rs. {grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Payment Mode:</span>
                  <span>{paymentMethod}</span>
                </div>
                {docMode === 'invoice' && (
                  <div className="flex justify-between text-[10px] text-blue-600">
                    <span>FBR Digital POSID:</span>
                    <span>{order?.fbrInvoiceNumber || 'FBR-8819201'}</span>
                  </div>
                )}
              </div>

              {/* FBR QR Placeholder */}
              <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-500 space-y-1">
                <QrCode size={36} className="mx-auto text-slate-800" />
                <div>Verified by FBR Tax Asaan</div>
                <div>Thank you for your business!</div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-[#151521] border-t border-slate-200 dark:border-[#2b2b40] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Selected Format: <strong className="text-slate-900 dark:text-white capitalize">{printFormat.replace('_', ' ')}</strong> ({docMode.toUpperCase()})
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all"
              title="Share Bill via WhatsApp"
            >
              <Share2 size={14} />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-5 sm:px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center space-x-1.5 transition-all"
            >
              <Printer size={15} />
              <span>Print {docMode === 'challan' ? 'Gate Pass' : 'Invoice'} Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
