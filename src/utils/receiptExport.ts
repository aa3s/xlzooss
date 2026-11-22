import { formatDH } from '../data/daribatiData';
import { PaymentMethod, TaxReceipt } from '../types/daribati';

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'cmi_card':
      return 'Moroccan Bank Card (CMI)';
    case 'fatourati':
      return 'Fatourati (MTC PayDirect)';
    case 'bank_transfer':
      return 'Moroccan Bank Transfer (TGR RIB)';
  }
}

export function downloadReceiptFile(receipt: TaxReceipt): void {
  const lines = [
    '====================================================================',
    '  KINGDOM OF MOROCCO — DARIBATI PARTICIPATORY TAX & CIVIC PORTAL    ',
    '  OFFICIAL DIGITAL TAX RECEIPT (QUITTANCE FISCALE PARTICIPATIVE)    ',
    '====================================================================',
    '',
    `Receipt ID       : ${receipt.id}`,
    `Date & Time      : ${new Date(receipt.paidAt).toLocaleString('en-GB')}`,
    `Tax Category     : ${receipt.taxCategory}`,
    `Total Paid       : ${formatDH(receipt.totalAmountDH)}`,
    `Payment Rail     : ${getPaymentMethodLabel(receipt.paymentMethod)}`,
    `Payment Ref      : ${receipt.paymentReference}`,
    '',
    '--- TAXPAYER IDENTITY ----------------------------------------------',
    `Full Name        : ${receipt.citizenName}`,
    `National ID (CIN): ${receipt.citizenCIN}`,
    `City             : ${receipt.citizenCity}`,
    `Civic Status     : VERIFIED TAXPAYER (PREMIUM VOTING UNLOCKED)`,
    '',
    '--- PARTICIPATORY ALLOCATION BREAKDOWN -----------------------------',
    ...receipt.allocations.map((item, index) => {
      const pct = ((item.amountDH / Math.max(1, receipt.totalAmountDH)) * 100).toFixed(1);
      return `${String(index + 1).padStart(2, '0')}. ${item.subSectorName} (${item.sectorTitle})\n    Allocated: ${formatDH(item.amountDH)} (${pct}%)`;
    }),
    '',
    '--------------------------------------------------------------------',
    `TOTAL ALLOCATED & PAID: ${formatDH(receipt.totalAmountDH)} (100.0%)`,
    '====================================================================',
    'Verified digitally via Daribati Civic Ledger · Morocco',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${receipt.id}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
