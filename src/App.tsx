import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CitizenProfileView } from './components/CitizenProfileView';
import { Header } from './components/Header';
import { PaymentModal } from './components/PaymentModal';
import { PublicTendersView } from './components/PublicTendersView';
import { TaxAllocatorView } from './components/TaxAllocatorView';
import {
  DEFAULT_CITIZEN_PROFILE,
  INITIAL_SECTORS,
  INITIAL_TENDERS,
} from './data/daribatiData';
import {
  ActiveTab,
  AllocationItem,
  CitizenProfile,
  PaymentMethod,
  Sector,
  TaxCategory,
  TaxReceipt,
} from './types/daribati';

const STORAGE_KEY = 'daribati_portal_state_v1';

interface PersistedState {
  profile: CitizenProfile;
  receipts: TaxReceipt[];
  userVotes: Record<string, string>;
  paidPoolBySubSector: Record<string, number>;
}

function loadPersistedState(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export default function App() {
  const persisted = useMemo(() => loadPersistedState(), []);

  const [activeTab, setActiveTab] = useState<ActiveTab>('allocator');
  const [taxBillDH, setTaxBillDH] = useState<number>(1000);
  const [taxCategory, setTaxCategory] = useState<TaxCategory>(
    'IR — Impôt sur le Revenu'
  );
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [paidPoolBySubSector, setPaidPoolBySubSector] = useState<Record<string, number>>(
    persisted?.paidPoolBySubSector ?? {}
  );
  const [profile, setProfile] = useState<CitizenProfile>(
    persisted?.profile ?? DEFAULT_CITIZEN_PROFILE
  );
  const [receipts, setReceipts] = useState<TaxReceipt[]>(persisted?.receipts ?? []);
  const [userVotes, setUserVotes] = useState<Record<string, string>>(
    persisted?.userVotes ?? {}
  );
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isPremiumUnlocked = receipts.length > 0;

  // Persist completed payments, votes, and citizen profile locally
  useEffect(() => {
    try {
      const payload: PersistedState = {
        profile,
        receipts,
        userVotes,
        paidPoolBySubSector,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in private preview modes
    }
  }, [profile, receipts, userVotes, paidPoolBySubSector]);

  // Auto-dismiss transient toast feedback
  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Combine initial national funding pool with any completed payments by this user
  const liveSectors: Sector[] = useMemo(() => {
    return INITIAL_SECTORS.map((sector) => ({
      ...sector,
      subSectors: sector.subSectors.map((sub) => ({
        ...sub,
        currentDH: sub.currentDH + (paidPoolBySubSector[sub.id] || 0),
      })),
    }));
  }, [paidPoolBySubSector]);

  const handleChangeTaxBill = (nextAmount: number) => {
    setTaxBillDH(nextAmount);
    // If current allocations exceed the new tax bill, proportionally scale or clamp them
    const currentSum = Object.values(allocations).reduce((s, v) => s + v, 0);
    if (currentSum > nextAmount) {
      if (nextAmount === 0) {
        setAllocations({});
      } else {
        const ratio = nextAmount / currentSum;
        const scaled: Record<string, number> = {};
        let running = 0;
        const entries = Object.entries(allocations).filter(([, v]) => v > 0);
        entries.forEach(([subId, val], idx) => {
          if (idx === entries.length - 1) {
            scaled[subId] = Math.max(0, nextAmount - running);
          } else {
            const nextVal = Math.floor(val * ratio);
            scaled[subId] = nextVal;
            running += nextVal;
          }
        });
        setAllocations(scaled);
      }
    }
  };

  const handleUpdateSubSectorAllocation = (subSectorId: string, amount: number) => {
    setAllocations((prev) => {
      const otherSum = Object.entries(prev).reduce(
        (sum, [key, val]) => (key === subSectorId ? sum : sum + val),
        0
      );
      const maxAllowed = Math.max(0, taxBillDH - otherSum);
      const clamped = Math.max(0, Math.min(maxAllowed, Math.round(amount)));
      if (clamped === 0) {
        const next = { ...prev };
        delete next[subSectorId];
        return next;
      }
      return { ...prev, [subSectorId]: clamped };
    });
  };

  const currentAllocationItems: AllocationItem[] = useMemo(() => {
    const items: AllocationItem[] = [];
    liveSectors.forEach((sec) => {
      sec.subSectors.forEach((sub) => {
        const amt = allocations[sub.id] || 0;
        if (amt > 0) {
          items.push({
            sectorId: sec.id,
            sectorTitle: sec.title,
            subSectorId: sub.id,
            subSectorName: sub.name,
            amountDH: amt,
          });
        }
      });
    });
    return items;
  }, [liveSectors, allocations]);

  const handleConfirmPayment = (
    method: PaymentMethod,
    paymentReference: string
  ): TaxReceipt => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const receipt: TaxReceipt = {
      id: `DAR-2026-MA-${randomSuffix}`,
      paidAt: new Date().toISOString(),
      taxCategory,
      totalAmountDH: taxBillDH,
      paymentMethod: method,
      paymentReference,
      citizenName: profile.fullName,
      citizenCIN: profile.cin,
      citizenCity: profile.city,
      allocations: currentAllocationItems,
    };

    // Permanently credit the paid amounts to the live national sector tanks
    setPaidPoolBySubSector((prev) => {
      const next = { ...prev };
      currentAllocationItems.forEach((item) => {
        next[item.subSectorId] = (next[item.subSectorId] || 0) + item.amountDH;
      });
      return next;
    });

    setReceipts((prev) => [receipt, ...prev]);
    setAllocations({});
    return receipt;
  };

  const handleCastVote = (tenderId: string, bidId: string) => {
    if (!isPremiumUnlocked) return;
    setUserVotes((prev) => ({ ...prev, [tenderId]: bidId }));
    const tender = INITIAL_TENDERS.find((t) => t.id === tenderId);
    const bid = tender?.bids.find((b) => b.id === bidId);
    if (bid) {
      setToastMessage(`Verified vote recorded for ${bid.companyName}. Leaderboard updated.`);
    }
  };

  const handleUpdateProfile = (next: CitizenProfile) => {
    setProfile(next);
    setToastMessage('Citizen profile details updated.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FA] text-[#0F2942]">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isPremiumUnlocked={isPremiumUnlocked}
        receiptCount={receipts.length}
      />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        {activeTab === 'allocator' && (
          <TaxAllocatorView
            sectors={liveSectors}
            taxBillDH={taxBillDH}
            onChangeTaxBill={handleChangeTaxBill}
            taxCategory={taxCategory}
            onChangeTaxCategory={setTaxCategory}
            allocations={allocations}
            onUpdateSubSectorAllocation={handleUpdateSubSectorAllocation}
            onApplyPresetAllocation={setAllocations}
            onClearAllocations={() => setAllocations({})}
            onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
            isPremiumUnlocked={isPremiumUnlocked}
          />
        )}

        {activeTab === 'tenders' && (
          <PublicTendersView
            tenders={INITIAL_TENDERS}
            isPremiumUnlocked={isPremiumUnlocked}
            userVotes={userVotes}
            onCastVote={handleCastVote}
            onGoToAllocator={() => setActiveTab('allocator')}
          />
        )}

        {activeTab === 'profile' && (
          <CitizenProfileView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            receipts={receipts}
            isPremiumUnlocked={isPremiumUnlocked}
            userVotes={userVotes}
            tenders={INITIAL_TENDERS}
            onGoToAllocator={() => setActiveTab('allocator')}
            onGoToTenders={() => setActiveTab('tenders')}
          />
        )}
      </main>

      {/* Quiet Civic Footer */}
      <footer className="no-print border-t border-[#DCE5EE] bg-white mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5A7188]">
          <p className="font-medium text-[#0F2942]">
            Daribati — Participatory Tax &amp; Civic Portal (Morocco)
          </p>
          <p>
            Transparent Moroccan Dirham (DH) public budget allocation &amp; merit-based SME tender
            participation
          </p>
        </div>
      </footer>

      {/* Checkout & Celebratory Receipt Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        taxBillDH={taxBillDH}
        taxCategory={taxCategory}
        allocationItems={currentAllocationItems}
        citizenProfile={profile}
        onConfirmPayment={handleConfirmPayment}
        onGoToTenders={() => setActiveTab('tenders')}
      />

      {/* Transient Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="no-print fixed bottom-5 right-5 z-50 max-w-sm bg-[#0F2942] text-white px-4 py-3 rounded-xl shadow-lg border border-[#087E83] flex items-center gap-2.5 text-xs sm:text-sm font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-[#2CC2C7] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
