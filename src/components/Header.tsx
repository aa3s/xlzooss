import React from 'react';
import { Award, ShieldCheck } from 'lucide-react';
import { ActiveTab } from '../types/daribati';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isPremiumUnlocked: boolean;
  receiptCount: number;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'allocator', label: 'Tax Payment & Allocator' },
  { id: 'tenders', label: 'Public Tenders & Voting' },
  { id: 'profile', label: 'Citizen Profile & Receipt' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isPremiumUnlocked,
  receiptCount,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D8E2EC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('allocator')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087E83] rounded-md py-1"
            aria-label="Daribati Home"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
              aria-hidden="true"
            >
              <rect width="32" height="32" rx="7" fill="#0F2942" />
              {/* Subtle Moroccan 8-pointed civic geometric star */}
              <rect
                x="10"
                y="10"
                width="12"
                height="12"
                stroke="#0E9FA5"
                strokeWidth="1.75"
              />
              <rect
                x="10"
                y="10"
                width="12"
                height="12"
                transform="rotate(45 16 16)"
                stroke="#D4AF37"
                strokeWidth="1.6"
              />
              <circle cx="16" cy="16" r="2.2" fill="#FFFFFF" />
            </svg>
            <span className="font-display text-lg font-extrabold tracking-tight text-[#0F2942]">
              Daribati
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links (Desktop) */}
          <nav
            className="hidden md:flex items-center gap-7"
            aria-label="Primary Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  className={`relative py-5 text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:text-[#087E83] ${
                    isActive
                      ? 'text-[#0F2942]'
                      : 'text-[#526980] hover:text-[#0F2942]'
                  }`}
                >
                  {item.label}
                  {item.id === 'profile' && receiptCount > 0 && (
                    <span className="ml-1.5 font-mono text-xs text-[#087E83] tabular-nums">
                      ({receiptCount})
                    </span>
                  )}
                  <span
                    className={`absolute left-0 right-0 bottom-0 h-[2.5px] rounded-t-full transition-transform duration-200 origin-left ${
                      isActive
                        ? 'bg-[#087E83] scale-x-100'
                        : 'bg-transparent scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Live Citizen Status Control */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onSelectTab('profile')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                isPremiumUnlocked
                  ? 'bg-[#0F2942] text-[#F7E39C] border border-[#D4AF37] shadow-sm hover:bg-[#17395B] focus-visible:ring-[#D4AF37]'
                  : 'bg-[#F0F4F8] text-[#3B5268] border border-[#D3DEE9] hover:border-[#087E83] hover:text-[#0F2942] focus-visible:ring-[#087E83]'
              }`}
              title={
                isPremiumUnlocked
                  ? 'Verified Taxpayer Premium Status Active — View Profile & Receipts'
                  : 'Complete a tax payment to unlock Verified Taxpayer Premium voting rights'
              }
            >
              {isPremiumUnlocked ? (
                <>
                  <Award className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span className="hidden sm:inline">
                    ★ Verified Taxpayer (Premium Unlocked)
                  </span>
                  <span className="sm:hidden">★ Verified Taxpayer</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#647B92] shrink-0" />
                  <span>Standard Citizen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Compact Navigation Row */}
        <nav
          className="md:hidden flex items-center gap-1 pb-2.5 overflow-x-auto"
          aria-label="Mobile Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#0F2942] text-white'
                    : 'text-[#4A6178] hover:bg-[#EAF0F6]'
                }`}
              >
                {item.id === 'allocator'
                  ? 'Tax Allocator'
                  : item.id === 'tenders'
                  ? 'Public Tenders'
                  : 'Profile & Receipt'}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
