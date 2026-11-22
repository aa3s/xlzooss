import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  Check,
  Download,
  Edit3,
  FileText,
  Printer,
  ShieldCheck,
  Vote,
} from 'lucide-react';
import { formatDH } from '../data/daribatiData';
import { CitizenProfile, PublicTender, TaxReceipt } from '../types/daribati';
import { downloadReceiptFile, getPaymentMethodLabel } from '../utils/receiptExport';

interface CitizenProfileViewProps {
  profile: CitizenProfile;
  onUpdateProfile: (next: CitizenProfile) => void;
  receipts: TaxReceipt[];
  isPremiumUnlocked: boolean;
  userVotes: Record<string, string>;
  tenders: PublicTender[];
  onGoToAllocator: () => void;
  onGoToTenders: () => void;
}

export const CitizenProfileView: React.FC<CitizenProfileViewProps> = ({
  profile,
  onUpdateProfile,
  receipts,
  isPremiumUnlocked,
  userVotes,
  tenders,
  onGoToAllocator,
  onGoToTenders,
}) => {
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(
    receipts[0]?.id ?? null
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<CitizenProfile>(profile);

  const activeReceipt =
    receipts.find((r) => r.id === selectedReceiptId) || receipts[0] || null;

  const totalPaidLifetimeDH = useMemo(
    () => receipts.reduce((sum, r) => sum + r.totalAmountDH, 0),
    [receipts]
  );

  // Aggregate lifetime contribution per sector
  const lifetimeSectorTotals = useMemo(() => {
    const map: Record<string, number> = {};
    receipts.forEach((receipt) => {
      receipt.allocations.forEach((item) => {
        map[item.sectorTitle] = (map[item.sectorTitle] || 0) + item.amountDH;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [receipts]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(draftProfile);
    setIsEditingProfile(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <section className="no-print flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#087E83] mb-1.5">
            Personal Civic Ledger · Morocco
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0F2942]">
            Citizen Profile &amp; Digital Tax Receipts
          </h1>
          <p className="text-sm text-[#4A6178] mt-1">
            Review your Verified Taxpayer Premium Badge, printable official receipts, and public
            tender voting record.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToAllocator}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#087E83] text-white font-display text-xs sm:text-sm font-bold hover:bg-[#06676B] transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>New Tax Allocation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Top Two-Column Split: Citizen Identity & Premium Badge Status */}
      <section className="no-print grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Citizen Identity Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D8E2EC] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EDF2F7]">
              <div>
                <p className="text-xs font-semibold text-[#5A7188]">Registered Taxpayer</p>
                <h2 className="font-display text-xl font-bold text-[#0F2942] mt-0.5">
                  {profile.fullName}
                </h2>
                <p className="text-xs text-[#647B92] mt-0.5">
                  CIN <span className="font-mono font-semibold text-[#0F2942]">{profile.cin}</span>{' '}
                  · {profile.city} · Fiscal ID{' '}
                  <span className="font-mono font-semibold text-[#0F2942]">{profile.taxIdIF}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraftProfile(profile);
                  setIsEditingProfile((prev) => !prev);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A6178] bg-[#F4F7FA] border border-[#DCE5EE] hover:border-[#0F2942] hover:text-[#0F2942] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {isEditingProfile ? 'Cancel' : 'Edit Details'}
              </button>
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleSaveProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={draftProfile.fullName}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, fullName: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    National ID (CIN)
                  </label>
                  <input
                    type="text"
                    required
                    value={draftProfile.cin}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, cin: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] font-mono text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A6178] mb-1">
                    City / Region
                  </label>
                  <input
                    type="text"
                    required
                    value={draftProfile.city}
                    onChange={(e) =>
                      setDraftProfile({ ...draftProfile, city: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg bg-[#F8FAFC] border border-[#CFDCE8] text-sm text-[#0F2942] focus:outline-none focus:border-[#087E83]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-lg bg-[#087E83] text-white text-xs font-bold inline-flex items-center gap-1.5 hover:bg-[#06676B] cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Profile
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
                <div>
                  <p className="text-xs text-[#647B92]">Total Tax Paid</p>
                  <p className="font-mono text-lg font-bold text-[#0F2942] tabular-nums mt-0.5">
                    {formatDH(totalPaidLifetimeDH)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#647B92]">Receipts Issued</p>
                  <p className="font-mono text-lg font-bold text-[#0F2942] tabular-nums mt-0.5">
                    {receipts.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#647B92]">Sectors Funded</p>
                  <p className="font-mono text-lg font-bold text-[#087E83] tabular-nums mt-0.5">
                    {lifetimeSectorTotals.length} / 9
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#647B92]">Tender Votes</p>
                  <p className="font-mono text-lg font-bold text-[#087E83] tabular-nums mt-0.5">
                    {Object.keys(userVotes).length} / {tenders.length}
                  </p>
                </div>
              </div>
            )}
          </div>

          {lifetimeSectorTotals.length > 0 && (
            <div className="mt-6 pt-4 border-t border-[#EDF2F7]">
              <p className="text-xs font-semibold text-[#4A6178] mb-2.5">
                Cumulative Funding by Public Sector
              </p>
              <div className="space-y-2">
                {lifetimeSectorTotals.slice(0, 5).map(([sectorName, amt]) => {
                  const pct = totalPaidLifetimeDH > 0 ? (amt / totalPaidLifetimeDH) * 100 : 0;
                  return (
                    <div key={sectorName} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#0F2942]">{sectorName}</span>
                        <span className="font-mono text-[#087E83] font-semibold tabular-nums">
                          {formatDH(amt)} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#E6EEF5] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#087E83] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Premium Citizen Badge Credential Card */}
        <div
          className={`lg:col-span-5 rounded-2xl p-6 flex flex-col justify-between ${
            isPremiumUnlocked
              ? 'bg-[#0F2942] text-white border border-[#D4AF37]'
              : 'bg-white text-[#0F2942] border border-[#D8E2EC]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isPremiumUnlocked
                    ? 'bg-[#D4AF37]/20 border border-[#D4AF37]'
                    : 'bg-[#F0F4F8] border border-[#D3DEE9]'
                }`}
              >
                {isPremiumUnlocked ? (
                  <Award className="w-6 h-6 text-[#D4AF37]" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-[#647B92]" />
                )}
              </div>
              <span
                className={`font-mono text-xs font-bold ${
                  isPremiumUnlocked ? 'text-[#F4DF8F]' : 'text-[#647B92]'
                }`}
              >
                {isPremiumUnlocked ? 'STATUS: PREMIUM ACTIVE' : 'STATUS: STANDARD'}
              </span>
            </div>

            <h2 className="font-display text-xl font-extrabold mt-4">
              {isPremiumUnlocked
                ? '★ Verified Taxpayer (Premium Unlocked)'
                : 'Standard Citizen Account'}
            </h2>
            <p
              className={`text-sm mt-2 leading-relaxed ${
                isPremiumUnlocked ? 'text-[#C6D5E3]' : 'text-[#5A7188]'
              }`}
            >
              {isPremiumUnlocked
                ? 'Your fiscal contribution is verified on the Daribati ledger. You hold full voting rights across all active Moroccan public tenders to champion transparent SMEs.'
                : 'Complete your first participatory tax allocation and payment to earn the Verified Taxpayer Premium Badge and unlock weighted voting on public tenders.'}
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-current/15 flex items-center justify-between gap-3">
            {isPremiumUnlocked ? (
              <button
                type="button"
                onClick={onGoToTenders}
                className="w-full py-2.5 px-4 rounded-xl bg-[#D4AF37] text-[#0F2942] font-display text-sm font-bold hover:bg-[#E3C258] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Vote className="w-4 h-4" />
                <span>Open Public Tenders Voting</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoToAllocator}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0F2942] text-white font-display text-sm font-bold hover:bg-[#087E83] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Allocate &amp; Pay Tax to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Official Tax Receipts & Payment History */}
      <section aria-label="Tax Payment History and Digital Receipts" className="space-y-4">
        <div className="no-print flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-[#0F2942]">
            Tax Payment History &amp; Official Digital Receipts
          </h2>
          {activeReceipt && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadReceiptFile(activeReceipt)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#0F2942] bg-white border border-[#CFDCE8] hover:border-[#0F2942] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download .txt
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#0F2942] hover:bg-[#087E83] transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
            </div>
          )}
        </div>

        {receipts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#D8E2EC] p-10 text-center space-y-3">
            <FileText className="w-10 h-10 mx-auto text-[#9EB5CA]" />
            <h3 className="font-display text-lg font-bold text-[#0F2942]">
              No tax receipts issued yet
            </h3>
            <p className="text-sm text-[#5A7188] max-w-md mx-auto">
              Once you allocate 100% of your tax bill across Morocco&apos;s public service sectors
              and complete payment, your official digital tax receipt will appear here.
            </p>
            <button
              type="button"
              onClick={onGoToAllocator}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#087E83] text-white font-display text-sm font-bold hover:bg-[#06676B] transition-colors cursor-pointer"
            >
              <span>Start Tax Allocation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Receipt History List */}
            <div className="no-print lg:col-span-4 bg-white rounded-2xl border border-[#D8E2EC] divide-y divide-[#EDF2F7] overflow-hidden">
              {receipts.map((receipt) => {
                const isSelected = activeReceipt?.id === receipt.id;
                return (
                  <button
                    key={receipt.id}
                    type="button"
                    onClick={() => setSelectedReceiptId(receipt.id)}
                    className={`w-full text-left p-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#F0FAFB]' : 'hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#087E83]">
                        {receipt.id}
                      </span>
                      <span className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
                        {formatDH(receipt.totalAmountDH)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#0F2942] mt-1">
                      {receipt.taxCategory}
                    </p>
                    <p className="text-[11px] text-[#647B92] mt-0.5">
                      {new Date(receipt.paidAt).toLocaleString('en-GB')} ·{' '}
                      {receipt.allocations.length} sub-sectors
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Active Printable Receipt Document */}
            {activeReceipt && (
              <div className="print-only-receipt lg:col-span-8 bg-white rounded-2xl border border-[#D8E2EC] p-6 sm:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-[#DCE5EE]">
                  <div>
                    <p className="text-xs font-bold text-[#087E83]">
                      Kingdom of Morocco · Daribati Civic Portal
                    </p>
                    <h3 className="font-display text-xl font-extrabold text-[#0F2942] mt-0.5">
                      Quittance Fiscale Participative
                    </h3>
                    <p className="font-mono text-xs text-[#5A7188] mt-1">
                      Receipt Reference: {activeReceipt.id}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-semibold text-[#A6831B]">
                      ★ Verified Taxpayer Receipt
                    </p>
                    <p className="font-mono text-2xl font-extrabold text-[#0F2942] tabular-nums mt-0.5">
                      {formatDH(activeReceipt.totalAmountDH)}
                    </p>
                    <p className="text-xs text-[#647B92]">
                      Paid on {new Date(activeReceipt.paidAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-[#F7FAFC] p-4 rounded-xl border border-[#E5ECF3]">
                  <div>
                    <p className="text-[#647B92]">Taxpayer Name</p>
                    <p className="font-bold text-[#0F2942] mt-0.5">{activeReceipt.citizenName}</p>
                    <p className="font-mono text-[#5A7188]">CIN: {activeReceipt.citizenCIN}</p>
                  </div>
                  <div>
                    <p className="text-[#647B92]">Tax Category</p>
                    <p className="font-bold text-[#0F2942] mt-0.5">{activeReceipt.taxCategory}</p>
                    <p className="text-[#5A7188]">{activeReceipt.citizenCity}</p>
                  </div>
                  <div>
                    <p className="text-[#647B92]">Payment Channel</p>
                    <p className="font-bold text-[#0F2942] mt-0.5">
                      {getPaymentMethodLabel(activeReceipt.paymentMethod)}
                    </p>
                    <p className="font-mono text-[#5A7188]">{activeReceipt.paymentReference}</p>
                  </div>
                </div>

                {/* Allocation Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCE5EE] text-[11px] font-semibold text-[#5A7188]">
                        <th className="py-2.5 pr-3">Public Sub-Sector</th>
                        <th className="py-2.5 px-3">Parent Sector</th>
                        <th className="py-2.5 px-3 text-right">Share</th>
                        <th className="py-2.5 pl-3 text-right">Allocated (DH)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EEF3F8] text-xs sm:text-sm">
                      {activeReceipt.allocations.map((item) => {
                        const pct = (
                          (item.amountDH / Math.max(1, activeReceipt.totalAmountDH)) *
                          100
                        ).toFixed(1);
                        return (
                          <tr key={item.subSectorId}>
                            <td className="py-3 pr-3 font-semibold text-[#0F2942]">
                              {item.subSectorName}
                            </td>
                            <td className="py-3 px-3 text-[#5A7188]">{item.sectorTitle}</td>
                            <td className="py-3 px-3 text-right font-mono text-[#5A7188] tabular-nums">
                              {pct}%
                            </td>
                            <td className="py-3 pl-3 text-right font-mono font-bold text-[#087E83] tabular-nums">
                              {formatDH(item.amountDH)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#0F2942] text-sm font-bold text-[#0F2942]">
                        <td colSpan={2} className="py-3 pr-3">
                          Total Participatory Tax Allocation
                        </td>
                        <td className="py-3 px-3 text-right font-mono tabular-nums">100.0%</td>
                        <td className="py-3 pl-3 text-right font-mono tabular-nums">
                          {formatDH(activeReceipt.totalAmountDH)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Citizen Public Tender Voting Log */}
      {Object.keys(userVotes).length > 0 && (
        <section className="no-print bg-white rounded-2xl border border-[#D8E2EC] p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#0F2942]">
            Your Verified Public Tender Votes
          </h2>
          <div className="divide-y divide-[#EDF2F7]">
            {Object.entries(userVotes).map(([tenderId, bidId]) => {
              const tender = tenders.find((t) => t.id === tenderId);
              const bid = tender?.bids.find((b) => b.id === bidId);
              if (!tender || !bid) return null;
              return (
                <div
                  key={tenderId}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <p className="font-semibold text-[#0F2942]">{tender.title}</p>
                    <p className="text-xs text-[#647B92]">
                      {tender.code} · {tender.region}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="font-semibold text-[#087E83]">{bid.companyName}</p>
                    <p className="text-xs text-[#647B92]">{bid.enterpriseType}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
