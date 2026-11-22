import React, { useEffect, useState } from 'react';
import {
  Award,
  Building2,
  CheckCircle2,
  CreditCard,
  Download,
  Lock,
  Printer,
  Smartphone,
  Vote,
  X,
} from 'lucide-react';
import { formatDH } from '../data/daribatiData';
import {
  AllocationItem,
  CitizenProfile,
  PaymentMethod,
  TaxCategory,
  TaxReceipt,
} from '../types/daribati';
import { downloadReceiptFile, getPaymentMethodLabel } from '../utils/receiptExport';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taxBillDH: number;
  taxCategory: TaxCategory;
  allocationItems: AllocationItem[];
  citizenProfile: CitizenProfile;
  onConfirmPayment: (method: PaymentMethod, paymentRef: string) => TaxReceipt;
  onGoToTenders: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  taxBillDH,
  taxCategory,
  allocationItems,
  citizenProfile,
  onConfirmPayment,
  onGoToTenders,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('cmi_card');
  const [cardNumber, setCardNumber] = useState('4532  8910  4421  7709');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvv, setCardCvv] = useState('418');
  const [fatouratiPhone, setFatouratiPhone] = useState('+212 6 61 48 29 10');
  const [fatouratiCode, setFatouratiCode] = useState('MTC-849201');
  const [bankRef, setBankRef] = useState('VIR-TGR-2026-8841');
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [issuedReceipt, setIssuedReceipt] = useState<TaxReceipt | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setIssuedReceipt(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('processing');

    const reference =
      method === 'cmi_card'
        ? `CMI-****${cardNumber.replace(/\s+/g, '').slice(-4) || '7709'}`
        : method === 'fatourati'
        ? fatouratiCode || 'MTC-849201'
        : bankRef || 'VIR-TGR-2026-8841';

    window.setTimeout(() => {
      const receipt = onConfirmPayment(method, reference);
      setIssuedReceipt(receipt);
      setStep('success');
    }, 1050);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F2942]/65 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="bg-white rounded-2xl border border-[#D8E2EC] shadow-2xl w-full max-w-2xl my-auto overflow-hidden">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#0F2942] text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {step === 'success' ? (
              <Award className="w-5 h-5 text-[#D4AF37]" />
            ) : (
              <Lock className="w-4 h-4 text-[#2CC2C7]" />
            )}
            <h2 id="payment-modal-title" className="font-display text-base font-bold">
              {step === 'success'
                ? 'Tax Payment Confirmed · Premium Citizen Badge Unlocked'
                : 'Daribati Secure Tax Checkout'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close checkout dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Payment Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Summary Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#F4F8FB] border border-[#DCE5EE]">
              <div>
                <p className="text-xs font-semibold text-[#5A7188]">{taxCategory}</p>
                <p className="text-sm font-bold text-[#0F2942] mt-0.5">
                  {citizenProfile.fullName} · CIN {citizenProfile.cin}
                </p>
                <p className="text-xs text-[#087E83] mt-0.5">
                  Allocated across {allocationItems.length} public sub-sector
                  {allocationItems.length === 1 ? '' : 's'} (100% matched)
                </p>
              </div>
              <div className="sm:text-right shrink-0">
                <p className="text-[11px] font-semibold text-[#5A7188]">Total Amount Due</p>
                <p className="font-mono text-2xl font-bold text-[#0F2942] tabular-nums">
                  {formatDH(taxBillDH)}
                </p>
              </div>
            </div>

            {/* Payment Rail Selector */}
            <div>
              <p className="text-xs font-semibold text-[#4A6178] mb-2.5">
                Select Moroccan Payment Channel
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'cmi_card' as PaymentMethod,
                    label: 'Bank Card (CMI)',
                    sub: 'Visa / Mastercard / CMI',
                    icon: CreditCard,
                  },
                  {
                    id: 'fatourati' as PaymentMethod,
                    label: 'Fatourati (MTC)',
                    sub: 'PayDirect Mobile Token',
                    icon: Smartphone,
                  },
                  {
                    id: 'bank_transfer' as PaymentMethod,
                    label: 'Bank Transfer',
                    sub: 'TGR Treasury RIB',
                    icon: Building2,
                  },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const active = method === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMethod(opt.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-[#F0FAFB] border-[#087E83] ring-1 ring-[#087E83]'
                          : 'bg-white border-[#D8E2EC] hover:border-[#9EB5CA]'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 mb-1.5 ${
                          active ? 'text-[#087E83]' : 'text-[#5A7188]'
                        }`}
                      />
                      <p className="text-xs font-bold text-[#0F2942]">{opt.label}</p>
                      <p className="text-[11px] text-[#647B92] mt-0.5">{opt.sub}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditional Payment Rail Fields */}
            {method === 'cmi_card' && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-12">
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    Card Number (Simulated CMI Gateway)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div className="sm:col-span-6">
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    Security Code (CVV)
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
              </div>
            )}

            {method === 'fatourati' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    Mobile Number Linked to Fatourati
                  </label>
                  <input
                    type="text"
                    required
                    value={fatouratiPhone}
                    onChange={(e) => setFatouratiPhone(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    Fatourati / MTC Reference Token
                  </label>
                  <input
                    type="text"
                    required
                    value={fatouratiCode}
                    onChange={(e) => setFatouratiCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
              </div>
            )}

            {method === 'bank_transfer' && (
              <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#DCE5EE]">
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="text-[#5A7188]">Beneficiary</span>
                  <span className="font-semibold text-[#0F2942]">
                    Trésorerie Générale du Royaume (TGR — Daribati Pool)
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <span className="text-[#5A7188]">Moroccan RIB (24 digits)</span>
                  <span className="font-mono font-semibold text-[#0F2942] tabular-nums">
                    310 810 1000 02400 70123 01 44
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    Your Transfer Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={bankRef}
                    onChange={(e) => setBankRef(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#CFDCE8] font-mono text-xs text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
              </div>
            )}

            {/* Compact Allocation Preview */}
            <div className="border-t border-[#E5ECF3] pt-4">
              <p className="text-xs font-semibold text-[#4A6178] mb-2">
                Your Tax Will Immediately Fund:
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {allocationItems.map((item) => (
                  <div
                    key={item.subSectorId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[#3B5268] truncate pr-3">
                      {item.subSectorName}{' '}
                      <span className="text-[#7E93A8]">· {item.sectorTitle}</span>
                    </span>
                    <span className="font-mono font-semibold text-[#087E83] tabular-nums shrink-0">
                      {formatDH(item.amountDH)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#4A6178] hover:bg-[#F0F4F8] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#087E83] text-white font-display text-sm font-bold hover:bg-[#06676B] shadow-[0_4px_14px_rgba(8,126,131,0.28)] transition-all cursor-pointer"
              >
                Confirm & Pay {formatDH(taxBillDH)}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Processing */}
        {step === 'processing' && (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full border-4 border-[#DCE5EE] border-t-[#087E83] animate-spin" />
            <div>
              <h3 className="font-display text-lg font-bold text-[#0F2942]">
                Verifying Transaction with Moroccan Treasury Gateway
              </h3>
              <p className="text-sm text-[#5A7188] mt-1">
                Allocating {formatDH(taxBillDH)} across your chosen public services and issuing
                your digital tax receipt...
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Celebratory Confirmation & Digital Receipt */}
        {step === 'success' && issuedReceipt && (
          <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            {/* Premium Unlock Celebration Banner */}
            <div className="p-5 rounded-xl bg-[#0F2942] text-white border border-[#D4AF37]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F4DF8F]">
                    ★ Verified Taxpayer · Premium Status Active
                  </p>
                  <h3 className="font-display text-lg font-bold mt-0.5">
                    Thank you! Your {formatDH(issuedReceipt.totalAmountDH)} tax is allocated.
                  </h3>
                  <p className="text-xs text-[#C6D5E3] mt-1">
                    Your Verified Citizen Badge is now unlocked. You can cast verified votes on
                    active Moroccan public tenders immediately.
                  </p>
                </div>
              </div>
              <CheckCircle2 className="w-8 h-8 text-[#2CC2C7] shrink-0 hidden sm:block" />
            </div>

            {/* Official Digital Tax Receipt Card */}
            <div className="print-only-receipt rounded-xl border border-[#CFDCE8] bg-[#FAFBFD] p-5 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#DCE5EE]">
                <div>
                  <p className="text-[11px] font-semibold text-[#087E83]">
                    Official Digital Tax Receipt (Quittance Fiscale)
                  </p>
                  <p className="font-mono text-sm font-bold text-[#0F2942] mt-0.5">
                    {issuedReceipt.id}
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-[#5A7188]">
                  <p>{new Date(issuedReceipt.paidAt).toLocaleString('en-GB')}</p>
                  <p className="font-mono text-[#0F2942] font-medium">
                    {getPaymentMethodLabel(issuedReceipt.paymentMethod)} ·{' '}
                    {issuedReceipt.paymentReference}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#647B92]">Taxpayer</span>
                  <p className="font-semibold text-[#0F2942]">{issuedReceipt.citizenName}</p>
                </div>
                <div>
                  <span className="text-[#647B92]">CIN / City</span>
                  <p className="font-semibold text-[#0F2942]">
                    {issuedReceipt.citizenCIN} · {issuedReceipt.citizenCity}
                  </p>
                </div>
                <div>
                  <span className="text-[#647B92]">Tax Category</span>
                  <p className="font-semibold text-[#0F2942]">{issuedReceipt.taxCategory}</p>
                </div>
              </div>

              <div className="border-t border-[#DCE5EE] pt-3">
                <p className="text-xs font-semibold text-[#4A6178] mb-2">
                  Itemized Public Service Distribution
                </p>
                <div className="space-y-1.5">
                  {issuedReceipt.allocations.map((item) => (
                    <div
                      key={item.subSectorId}
                      className="flex items-center justify-between text-xs py-1 border-b border-[#EDF2F7] last:border-b-0"
                    >
                      <span className="text-[#0F2942] font-medium">
                        {item.subSectorName}{' '}
                        <span className="text-[#647B92] font-normal">({item.sectorTitle})</span>
                      </span>
                      <span className="font-mono font-bold text-[#087E83] tabular-nums">
                        {formatDH(item.amountDH)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#CBD5E1] text-sm font-bold text-[#0F2942]">
                  <span>Total Paid & Verified</span>
                  <span className="font-mono tabular-nums">
                    {formatDH(issuedReceipt.totalAmountDH)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadReceiptFile(issuedReceipt)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0F2942] bg-white border border-[#CFDCE8] hover:border-[#0F2942] transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Receipt
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0F2942] bg-white border border-[#CFDCE8] hover:border-[#0F2942] transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Receipt
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToTenders();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#087E83] text-white font-display text-sm font-bold hover:bg-[#06676B] shadow-sm transition-colors cursor-pointer"
              >
                <Vote className="w-4 h-4" />
                Vote on Public Tenders Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
