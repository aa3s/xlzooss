import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import {
  formatCompactDH,
  formatDH,
  SAMPLE_ALLOCATION_FOR_1000,
} from '../data/daribatiData';
import { Sector, TaxCategory } from '../types/daribati';
import { LiquidTank3D } from './LiquidTank3D';

interface TaxAllocatorViewProps {
  sectors: Sector[];
  taxBillDH: number;
  onChangeTaxBill: (amount: number) => void;
  taxCategory: TaxCategory;
  onChangeTaxCategory: (cat: TaxCategory) => void;
  allocations: Record<string, number>;
  onUpdateSubSectorAllocation: (subSectorId: string, amount: number) => void;
  onApplyPresetAllocation: (preset: Record<string, number>) => void;
  onClearAllocations: () => void;
  onOpenPaymentModal: () => void;
  isPremiumUnlocked: boolean;
}

const TAX_CATEGORIES: TaxCategory[] = [
  'IR — Impôt sur le Revenu',
  "Taxe d'Habitation",
  'Taxe Professionnelle',
  'Combined Annual Civic Tax',
];

const QUICK_TAX_AMOUNTS = [500, 1000, 2500, 5000];

export const TaxAllocatorView: React.FC<TaxAllocatorViewProps> = ({
  sectors,
  taxBillDH,
  onChangeTaxBill,
  taxCategory,
  onChangeTaxCategory,
  allocations,
  onUpdateSubSectorAllocation,
  onApplyPresetAllocation,
  onClearAllocations,
  onOpenPaymentModal,
  isPremiumUnlocked,
}) => {
  const [expandedSectorId, setExpandedSectorId] = useState<string | null>(null);

  const totalAllocatedDH = useMemo(
    () => Object.values(allocations).reduce((sum, val) => sum + val, 0),
    [allocations]
  );

  const remainingDH = Math.max(0, taxBillDH - totalAllocatedDH);
  const allocationProgress =
    taxBillDH > 0 ? Math.min(100, (totalAllocatedDH / taxBillDH) * 100) : 0;
  const isReadyToPay = taxBillDH > 0 && remainingDH === 0 && totalAllocatedDH === taxBillDH;

  // Group sectors into rows of 3 for desktop aligned hierarchical tree expansion
  const sectorRows = useMemo(() => {
    const rows: Sector[][] = [];
    for (let i = 0; i < sectors.length; i += 3) {
      rows.push(sectors.slice(i, i + 3));
    }
    return rows;
  }, [sectors]);

  const getSectorAllocatedDH = (sector: Sector) =>
    sector.subSectors.reduce((sum, sub) => sum + (allocations[sub.id] || 0), 0);

  const getSectorCurrentDH = (sector: Sector) =>
    sector.subSectors.reduce((sum, sub) => sum + sub.currentDH, 0);

  const handleToggleSector = (sectorId: string) => {
    setExpandedSectorId((prev) => (prev === sectorId ? null : sectorId));
  };

  const handleApplySampleSplit = () => {
    const scaled: Record<string, number> = {};
    let runningTotal = 0;
    const entries = Object.entries(SAMPLE_ALLOCATION_FOR_1000);
    entries.forEach(([subId, baseAmt], idx) => {
      if (idx === entries.length - 1) {
        scaled[subId] = Math.max(0, taxBillDH - runningTotal);
      } else {
        const val = Math.round((baseAmt / 1000) * taxBillDH);
        scaled[subId] = val;
        runningTotal += val;
      }
    });
    onApplyPresetAllocation(scaled);
    setExpandedSectorId('healthcare');
  };

  const handleDistributeEvenly = () => {
    // Distribute evenly across the 9 primary sub-sectors (first sub-sector of each sector)
    const even: Record<string, number> = {};
    const count = sectors.length;
    const base = Math.floor(taxBillDH / count);
    let remainder = taxBillDH - base * count;
    sectors.forEach((sec) => {
      const subId = sec.subSectors[0].id;
      const amt = base + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder -= 1;
      even[subId] = amt;
    });
    onApplyPresetAllocation(even);
  };

  const activeAllocationsList = useMemo(() => {
    const list: {
      sectorId: string;
      sectorTitle: string;
      subId: string;
      subName: string;
      amountDH: number;
    }[] = [];
    sectors.forEach((sec) => {
      sec.subSectors.forEach((sub) => {
        const amt = allocations[sub.id] || 0;
        if (amt > 0) {
          list.push({
            sectorId: sec.id,
            sectorTitle: sec.shortTitle,
            subId: sub.id,
            subName: sub.name,
            amountDH: amt,
          });
        }
      });
    });
    return list;
  }, [sectors, allocations]);

  const nationalCollectedDH = useMemo(
    () =>
      sectors.reduce((sum, sec) => sum + getSectorCurrentDH(sec), 0) +
      totalAllocatedDH,
    [sectors, totalAllocatedDH]
  );

  const nationalTargetDH = useMemo(
    () => sectors.reduce((sum, sec) => sum + sec.targetDH, 0),
    [sectors]
  );

  return (
    <div className="space-y-8">
      {/* Page Introduction + National Progress Summary */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#087E83] mb-1.5">
            Kingdom of Morocco · Participatory Tax Portal
          </p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0F2942] leading-tight [text-wrap:balance]">
            Direct your Moroccan tax contribution to the public services you value most
          </h1>
          <p className="mt-2.5 text-sm sm:text-[15px] text-[#4A6178] leading-relaxed">
            Click any of the 9 public service liquid tanks below to expand its sub-sectors and
            allocate 100% of your tax bill in Dirhams (DH). Completing payment unlocks your
            Verified Taxpayer voting rights for public tenders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 lg:text-right border-t lg:border-t-0 pt-4 lg:pt-0 border-[#DCE5EE] shrink-0">
          <div>
            <p className="text-xs text-[#5A7188]">2026 Civic Pool Funded</p>
            <p className="font-mono text-lg font-semibold text-[#0F2942] tabular-nums">
              {formatCompactDH(nationalCollectedDH)}{' '}
              <span className="text-xs font-normal text-[#647B92]">
                / {formatCompactDH(nationalTargetDH)}
              </span>
            </p>
          </div>
          <div className="h-8 w-px bg-[#DCE5EE] hidden sm:block" />
          <div>
            <p className="text-xs text-[#5A7188]">Overall Progress</p>
            <p className="font-mono text-lg font-semibold text-[#087E83] tabular-nums">
              {((nationalCollectedDH / nationalTargetDH) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </section>

      {/* Tax Assessment & Live Allocation Control Bar */}
      <section
        aria-label="Tax Assessment Summary"
        className="bg-white rounded-2xl border border-[#D8E2EC] shadow-[0_2px_12px_rgba(15,41,66,0.04)] p-5 sm:p-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Tax Category & Tax Due Input */}
          <div className="lg:col-span-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="tax-category"
                  className="block text-xs font-semibold text-[#4A6178] mb-1.5"
                >
                  Tax Declaration Type
                </label>
                <select
                  id="tax-category"
                  value={taxCategory}
                  onChange={(e) => onChangeTaxCategory(e.target.value as TaxCategory)}
                  className="w-full h-10 px-3 rounded-lg bg-[#F7FAFC] border border-[#CFDCE8] text-sm font-medium text-[#0F2942] focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
                >
                  {TAX_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tax-bill-input"
                  className="block text-xs font-semibold text-[#4A6178] mb-1.5"
                >
                  Total Tax Due (DH)
                </label>
                <div className="relative">
                  <input
                    id="tax-bill-input"
                    type="number"
                    min={100}
                    max={500000}
                    step={50}
                    value={taxBillDH || ''}
                    onChange={(e) => {
                      const parsed = Math.max(0, Math.min(500000, Number(e.target.value) || 0));
                      onChangeTaxBill(parsed);
                    }}
                    className="w-full h-10 pl-3 pr-11 rounded-lg bg-[#F7FAFC] border border-[#CFDCE8] font-mono text-sm font-semibold text-[#0F2942] tabular-nums focus:outline-none focus:border-[#087E83] focus:ring-2 focus:ring-[#087E83]/20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs font-semibold text-[#5A7188]">
                    DH
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#647B92] mr-1">Presets:</span>
              {QUICK_TAX_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => onChangeTaxBill(amt)}
                  className={`px-2.5 py-1 rounded-md font-mono text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    taxBillDH === amt
                      ? 'bg-[#0F2942] text-white'
                      : 'bg-[#F0F4F8] text-[#4A6178] hover:bg-[#E1EBF4] hover:text-[#0F2942]'
                  }`}
                >
                  {amt.toLocaleString('en-US')} DH
                </button>
              ))}
            </div>
          </div>

          {/* Live Remaining to Allocate Meter */}
          <div className="lg:col-span-4 space-y-2.5 lg:border-x lg:border-[#E5ECF3] lg:px-6">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold text-[#4A6178]">
                Remaining to Allocate
              </span>
              <span
                className={`font-mono text-xl font-bold tabular-nums ${
                  isReadyToPay ? 'text-[#087E83]' : 'text-[#0F2942]'
                }`}
              >
                {formatDH(remainingDH)}
              </span>
            </div>

            <div className="h-2.5 w-full bg-[#E6EEF5] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${allocationProgress}%`,
                  backgroundColor: isReadyToPay ? '#087E83' : '#0F2942',
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#5A7188]">
              <span className="font-mono tabular-nums">
                Allocated: {formatDH(totalAllocatedDH)} ({allocationProgress.toFixed(0)}%)
              </span>
              {isReadyToPay ? (
                <span className="inline-flex items-center gap-1 font-semibold text-[#087E83]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  100% Ready
                </span>
              ) : (
                <span>Allocate 100% to pay</span>
              )}
            </div>

            {/* Utility Split Helpers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleApplySampleSplit}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#087E83] hover:text-[#0F2942] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Sample Split
              </button>
              <span className="text-[#CBD5E1]" aria-hidden="true">
                ·
              </span>
              <button
                type="button"
                onClick={handleDistributeEvenly}
                className="text-xs font-semibold text-[#4A6178] hover:text-[#0F2942] transition-colors cursor-pointer"
              >
                Distribute Evenly
              </button>
              {totalAllocatedDH > 0 && (
                <>
                  <span className="text-[#CBD5E1]" aria-hidden="true">
                    ·
                  </span>
                  <button
                    type="button"
                    onClick={onClearAllocations}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#7A4A4A] hover:text-[#B91C1C] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Primary Payment CTA */}
          <div className="lg:col-span-3 flex flex-col items-stretch justify-center gap-2">
            <button
              type="button"
              disabled={!isReadyToPay}
              onClick={onOpenPaymentModal}
              className={`w-full py-3.5 px-4 rounded-xl font-display text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 whitespace-nowrap ${
                isReadyToPay
                  ? 'bg-[#087E83] text-white hover:bg-[#06676B] shadow-[0_6px_18px_rgba(8,126,131,0.28)] cursor-pointer active:scale-[0.99]'
                  : 'bg-[#E6EEF5] text-[#7E93A8] cursor-not-allowed'
              }`}
            >
              <span>Proceed to Pay Tax ({formatDH(taxBillDH)})</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <p className="text-[11.5px] text-center text-[#5A7188]">
              {isReadyToPay
                ? isPremiumUnlocked
                  ? 'Verified Taxpayer status active · Receipt issued immediately'
                  : 'Unlocks Verified Taxpayer Badge & Tender Voting'
                : `Allocate ${formatDH(remainingDH)} more across sub-sectors below`}
            </p>
          </div>
        </div>
      </section>

      {/* Section Header for the 9 Public Service Sectors */}
      <section aria-label="Public Service Sectors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-[#0F2942]">
              9 Public Service Funding Tanks
            </h2>
            <p className="text-xs sm:text-sm text-[#5A7188]">
              Click any 3D liquid tank to open its sub-sector branch and adjust your exact DH contribution.
            </p>
          </div>
          {expandedSectorId && (
            <button
              type="button"
              onClick={() => setExpandedSectorId(null)}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4A6178] bg-white border border-[#D8E2EC] hover:border-[#0F2942] hover:text-[#0F2942] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Collapse Sub-Sectors
            </button>
          )}
        </div>

        {/* 3-Column Row-Grouped Grid so Expanded Hierarchical Tree Appears Cleanly Underneath */}
        <div className="space-y-6">
          {sectorRows.map((row, rowIndex) => {
            const expandedInRow = row.find((s) => s.id === expandedSectorId) || null;
            const expandedColIdx = expandedInRow
              ? row.findIndex((s) => s.id === expandedInRow.id)
              : -1;

            return (
              <div key={rowIndex} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {row.map((sector) => {
                    const isExpanded = expandedSectorId === sector.id;
                    const sectorBaseCurrentDH = getSectorCurrentDH(sector);
                    const sectorPersonalDH = getSectorAllocatedDH(sector);
                    const sectorCombinedDH = sectorBaseCurrentDH + sectorPersonalDH;
                    const sectorPercent = (sectorCombinedDH / sector.targetDH) * 100;

                    return (
                      <article
                        key={sector.id}
                        className={`group bg-white rounded-2xl border transition-all duration-200 flex flex-col ${
                          isExpanded
                            ? 'border-[#087E83] ring-2 ring-[#087E83]/18 shadow-[0_8px_24px_rgba(8,126,131,0.12)]'
                            : sectorPersonalDH > 0
                            ? 'border-[#087E83]/60 shadow-[0_3px_14px_rgba(15,41,66,0.06)] hover:border-[#087E83]'
                            : 'border-[#D8E2EC] hover:border-[#9EB5CA] hover:shadow-[0_4px_16px_rgba(15,41,66,0.06)]'
                        }`}
                      >
                        {/* Clickable Card Body & 3D Tank */}
                        <button
                          type="button"
                          onClick={() => handleToggleSector(sector.id)}
                          aria-expanded={isExpanded}
                          className="w-full text-left p-5 flex-1 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#087E83] rounded-2xl"
                        >
                          {/* Top Row: Editorial Number + Allocation Status */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <span className="font-mono text-xs font-semibold text-[#5A7188]">
                              0{sector.number}
                            </span>
                            {sectorPersonalDH > 0 ? (
                              <span className="font-mono text-xs font-bold text-[#087E83] tabular-nums">
                                +{formatDH(sectorPersonalDH)} Your Tax
                              </span>
                            ) : (
                              <span className="text-xs text-[#6B8096]">
                                {sector.subSectors.length} sub-sectors
                              </span>
                            )}
                          </div>

                          <h3 className="font-display text-base font-bold text-[#0F2942] leading-snug min-h-[2.75rem]">
                            {sector.title}
                          </h3>

                          {/* 3D Cylindrical Glass Liquid Tank */}
                          <div className="my-3 flex justify-center">
                            <LiquidTank3D
                              currentDH={sectorBaseCurrentDH}
                              targetDH={sector.targetDH}
                              personalAllocatedDH={sectorPersonalDH}
                              totalTaxBillDH={taxBillDH}
                              accentTop={sector.accentTop}
                              accentBottom={sector.accentBottom}
                              accentLight={sector.accentLight}
                              size="main"
                              isActive={isExpanded || sectorPersonalDH > 0}
                            />
                          </div>

                          {/* Exact DH Figures & Target */}
                          <div className="mt-auto pt-3 border-t border-[#EDF2F7] space-y-2">
                            <div className="flex items-baseline justify-between text-xs">
                              <span className="text-[#5A7188]">Collected / Target</span>
                              <span className="font-mono font-semibold text-[#0F2942] tabular-nums">
                                {formatCompactDH(sectorCombinedDH)} /{' '}
                                {formatCompactDH(sector.targetDH)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-semibold text-[#087E83] tabular-nums">
                                {sectorPercent.toFixed(2)}% funded
                              </span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#0F2942] group-hover:text-[#087E83] transition-colors">
                                {isExpanded ? (
                                  <>
                                    Hide Sub-Sectors
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </>
                                ) : (
                                  <>
                                    Allocate Sub-Sectors
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                        </button>
                      </article>
                    );
                  })}
                </div>

                {/* Hierarchical Tree Sub-Sector Drawer Directly Underneath Row */}
                {expandedInRow && (
                  <div className="relative pt-4">
                    {/* Desktop Organizational Connector Stem from Clicked Card */}
                    <div
                      className="hidden lg:block absolute top-0 left-0 right-0 h-5 pointer-events-none"
                      aria-hidden="true"
                    >
                      {/* Vertical stem from parent card center */}
                      <div
                        className="absolute top-0 w-[2px] h-5 bg-[#087E83]"
                        style={{
                          left:
                            expandedColIdx === 0
                              ? '16.666%'
                              : expandedColIdx === 1
                              ? '50%'
                              : '83.333%',
                          transform: 'translateX(-50%)',
                        }}
                      />
                      {/* Horizontal crossbar connecting to drawer */}
                      <div
                        className="absolute top-2.5 h-[2px] bg-[#087E83]/50"
                        style={{
                          left: expandedColIdx === 0 ? '16.666%' : '50%',
                          right: expandedColIdx === 2 ? '16.666%' : '50%',
                        }}
                      />
                      <div
                        className="absolute top-0 w-2.5 h-2.5 rounded-full bg-[#087E83] border-2 border-white"
                        style={{
                          left:
                            expandedColIdx === 0
                              ? '16.666%'
                              : expandedColIdx === 1
                              ? '50%'
                              : '83.333%',
                          transform: 'translate(-50%, -4px)',
                        }}
                      />
                    </div>

                    {/* Expanded Sub-Sector Panel */}
                    <div className="bg-white rounded-2xl border-2 border-[#087E83]/55 shadow-[0_12px_32px_rgba(15,41,66,0.08)] p-5 sm:p-6">
                      {/* Panel Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-[#E5ECF3]">
                        <div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#087E83]">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>
                              Sub-Sector Breakdown · Sector 0{expandedInRow.number}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-bold text-[#0F2942] mt-0.5">
                            {expandedInRow.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-[11px] text-[#5A7188]">
                              Your Allocation in This Sector
                            </p>
                            <p className="font-mono text-sm font-bold text-[#087E83] tabular-nums">
                              {formatDH(getSectorAllocatedDH(expandedInRow))}
                            </p>
                          </div>
                          <div className="h-7 w-px bg-[#DCE5EE] hidden sm:block" />
                          <div className="text-left sm:text-right">
                            <p className="text-[11px] text-[#5A7188]">
                              Remaining Tax Bill
                            </p>
                            <p className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
                              {formatDH(remainingDH)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedSectorId(null)}
                            className="p-2 rounded-lg text-[#5A7188] hover:text-[#0F2942] hover:bg-[#F0F4F8] transition-colors cursor-pointer"
                            aria-label="Close sub-sector panel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Organizational Branch Header Line (Desktop) */}
                      <div className="hidden lg:block relative h-4 mb-2" aria-hidden="true">
                        <div className="absolute left-[12%] right-[12%] top-0 h-[1.5px] bg-[#C8D7E5]" />
                        <div
                          className="grid gap-4 h-full"
                          style={{
                            gridTemplateColumns: `repeat(${expandedInRow.subSectors.length}, minmax(0, 1fr))`,
                          }}
                        >
                          {expandedInRow.subSectors.map((sub) => (
                            <div key={sub.id} className="flex justify-center">
                              <div className="w-[1.5px] h-full bg-[#C8D7E5]" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sub-Sector Mini Water Tank Cards */}
                      <div
                        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                          expandedInRow.subSectors.length === 4
                            ? 'lg:grid-cols-4'
                            : 'lg:grid-cols-3'
                        }`}
                      >
                        {expandedInRow.subSectors.map((sub) => {
                          const userAmt = allocations[sub.id] || 0;
                          const maxAllowedForSub = userAmt + remainingDH;
                          const subCombinedDH = sub.currentDH + userAmt;
                          const subPct = (subCombinedDH / sub.targetDH) * 100;

                          return (
                            <div
                              key={sub.id}
                              className={`rounded-xl border p-4 flex flex-col transition-colors ${
                                userAmt > 0
                                  ? 'bg-[#F4FBFC] border-[#087E83]/60'
                                  : 'bg-[#F8FAFC] border-[#DCE5EE]'
                              }`}
                            >
                              <h4 className="font-display text-sm font-bold text-[#0F2942] leading-snug min-h-[2.5rem]">
                                {sub.name}
                              </h4>
                              <p className="text-[11.5px] text-[#5A7188] leading-relaxed mt-1 min-h-[2.6rem]">
                                {sub.description}
                              </p>

                              {/* Mini 3D Cylindrical Liquid Tank */}
                              <div className="my-2 flex justify-center">
                                <LiquidTank3D
                                  currentDH={sub.currentDH}
                                  targetDH={sub.targetDH}
                                  personalAllocatedDH={userAmt}
                                  totalTaxBillDH={taxBillDH}
                                  accentTop={expandedInRow.accentTop}
                                  accentBottom={expandedInRow.accentBottom}
                                  accentLight={expandedInRow.accentLight}
                                  size="mini"
                                  isActive={userAmt > 0}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11.5px] text-[#4A6178] mb-3">
                                <span className="font-mono tabular-nums">
                                  {formatCompactDH(subCombinedDH)} /{' '}
                                  {formatCompactDH(sub.targetDH)}
                                </span>
                                <span className="font-mono font-semibold text-[#087E83] tabular-nums">
                                  {subPct.toFixed(1)}%
                                </span>
                              </div>

                              {/* DH Allocation Slider + Direct Numeric Input */}
                              <div className="mt-auto space-y-2.5 pt-2.5 border-t border-[#DCE5EE]">
                                <div className="flex items-center justify-between gap-2">
                                  <label
                                    htmlFor={`input-${sub.id}`}
                                    className="text-[11px] font-semibold text-[#4A6178]"
                                  >
                                    Your Contribution
                                  </label>
                                  <div className="relative w-24">
                                    <input
                                      id={`input-${sub.id}`}
                                      type="number"
                                      min={0}
                                      max={maxAllowedForSub}
                                      step={10}
                                      value={userAmt || ''}
                                      placeholder="0"
                                      onChange={(e) => {
                                        const raw = Math.max(0, Number(e.target.value) || 0);
                                        const clamped = Math.min(maxAllowedForSub, raw);
                                        onUpdateSubSectorAllocation(sub.id, clamped);
                                      }}
                                      className="w-full h-8 pl-2 pr-7 rounded-md bg-white border border-[#C8D7E5] font-mono text-xs font-bold text-[#0F2942] tabular-nums text-right focus:outline-none focus:border-[#087E83]"
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] font-semibold text-[#647B92]">
                                      DH
                                    </span>
                                  </div>
                                </div>

                                <input
                                  type="range"
                                  aria-label={`Allocate Dirhams to ${sub.name}`}
                                  min={0}
                                  max={Math.max(10, maxAllowedForSub)}
                                  step={10}
                                  disabled={maxAllowedForSub === 0}
                                  value={userAmt}
                                  onChange={(e) => {
                                    const val = Math.min(
                                      maxAllowedForSub,
                                      Number(e.target.value) || 0
                                    );
                                    onUpdateSubSectorAllocation(sub.id, val);
                                  }}
                                  className="w-full daribati-slider disabled:opacity-40"
                                />

                                {/* Quick Increment Buttons */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={remainingDH < 50}
                                    onClick={() =>
                                      onUpdateSubSectorAllocation(
                                        sub.id,
                                        userAmt + Math.min(50, remainingDH)
                                      )
                                    }
                                    className="flex-1 py-1 rounded text-[11px] font-mono font-semibold bg-white border border-[#CFDCE8] text-[#0F2942] hover:border-[#087E83] hover:text-[#087E83] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                  >
                                    +50
                                  </button>
                                  <button
                                    type="button"
                                    disabled={remainingDH < 100}
                                    onClick={() =>
                                      onUpdateSubSectorAllocation(
                                        sub.id,
                                        userAmt + Math.min(100, remainingDH)
                                      )
                                    }
                                    className="flex-1 py-1 rounded text-[11px] font-mono font-semibold bg-white border border-[#CFDCE8] text-[#0F2942] hover:border-[#087E83] hover:text-[#087E83] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                  >
                                    +100
                                  </button>
                                  <button
                                    type="button"
                                    disabled={remainingDH === 0}
                                    onClick={() =>
                                      onUpdateSubSectorAllocation(sub.id, userAmt + remainingDH)
                                    }
                                    className="flex-1 py-1 rounded text-[11px] font-semibold bg-[#0F2942] text-white hover:bg-[#087E83] disabled:opacity-35 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    Max
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Personal Allocation Summary Ledger */}
      <section
        aria-label="Current Allocation Breakdown"
        className="bg-white rounded-2xl border border-[#D8E2EC] p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5ECF3]">
          <div>
            <h2 className="font-display text-base font-bold text-[#0F2942]">
              Your Allocation Breakdown
            </h2>
            <p className="text-xs text-[#5A7188]">
              Exact distribution of your {formatDH(taxBillDH)} tax declaration before payment.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
              {formatDH(totalAllocatedDH)} / {formatDH(taxBillDH)}
            </span>
            <button
              type="button"
              disabled={!isReadyToPay}
              onClick={onOpenPaymentModal}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                isReadyToPay
                  ? 'bg-[#087E83] text-white hover:bg-[#06676B] cursor-pointer'
                  : 'bg-[#E6EEF5] text-[#7E93A8] cursor-not-allowed'
              }`}
            >
              Proceed to Pay Tax ({formatDH(taxBillDH)})
            </button>
          </div>
        </div>

        {activeAllocationsList.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-medium text-[#4A6178]">
              No sub-sectors allocated yet.
            </p>
            <p className="text-xs text-[#6B8096] mt-1">
              Click any of the 9 liquid tanks above to allocate DH, or apply a quick sample split to preview.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#EEF3F8] mt-2">
            {activeAllocationsList.map((item) => {
              const sharePct = taxBillDH > 0 ? (item.amountDH / taxBillDH) * 100 : 0;
              return (
                <div
                  key={item.subId}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => setExpandedSectorId(item.sectorId)}
                      className="font-semibold text-[#0F2942] hover:text-[#087E83] transition-colors text-left cursor-pointer"
                    >
                      {item.subName}
                    </button>
                    <p className="text-xs text-[#647B92]">{item.sectorTitle}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-mono text-xs text-[#5A7188] tabular-nums">
                      {sharePct.toFixed(1)}%
                    </span>
                    <span className="font-mono text-sm font-bold text-[#087E83] tabular-nums w-24 text-right">
                      {formatDH(item.amountDH)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateSubSectorAllocation(item.subId, 0)}
                      className="p-1 text-[#7E93A8] hover:text-[#B91C1C] transition-colors cursor-pointer"
                      aria-label={`Remove allocation for ${item.subName}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
