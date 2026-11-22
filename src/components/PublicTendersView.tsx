import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Leaf,
  Lock,
  MapPin,
  Trophy,
  Users,
  Vote,
} from 'lucide-react';
import { formatDH } from '../data/daribatiData';
import { EnterpriseBid, PublicTender } from '../types/daribati';

interface PublicTendersViewProps {
  tenders: PublicTender[];
  isPremiumUnlocked: boolean;
  userVotes: Record<string, string>; // tenderId -> bidId
  onCastVote: (tenderId: string, bidId: string) => void;
  onGoToAllocator: () => void;
}

interface RankedBid {
  bid: EnterpriseBid;
  votes: number;
  voteSharePct: number;
  citizenBonusPts: number;
  totalScore: number;
  rank: number;
}

export const PublicTendersView: React.FC<PublicTendersViewProps> = ({
  tenders,
  isPremiumUnlocked,
  userVotes,
  onCastVote,
  onGoToAllocator,
}) => {
  const [expandedBidIds, setExpandedBidIds] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const toggleInspectBid = (bidId: string) => {
    setExpandedBidIds((prev) => ({ ...prev, [bidId]: !prev[bidId] }));
  };

  const getRankedBids = (tender: PublicTender): { ranked: RankedBid[]; totalVotes: number } => {
    const selectedBidId = userVotes[tender.id];
    const bidsWithVotes = tender.bids.map((bid) => ({
      bid,
      votes: bid.initialCitizenVotes + (selectedBidId === bid.id ? 1 : 0),
    }));

    const totalVotes = bidsWithVotes.reduce((sum, item) => sum + item.votes, 0);

    const scored = bidsWithVotes.map(({ bid, votes }) => {
      const voteSharePct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      const citizenBonusPts = (voteSharePct / 100) * 15;
      const totalScore = bid.technicalPriceScore + citizenBonusPts;
      return {
        bid,
        votes,
        voteSharePct,
        citizenBonusPts,
        totalScore,
        rank: 1,
      };
    });

    scored.sort((a, b) => b.totalScore - a.totalScore);
    scored.forEach((item, index) => {
      item.rank = index + 1;
    });

    return { ranked: scored, totalVotes };
  };

  const totalVotesCastByUser = Object.keys(userVotes).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-[#087E83] mb-1.5">
            Appels d&apos;Offres Publics · Fair SME Competition
          </p>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0F2942] leading-tight [text-wrap:balance]">
            Public Tenders & Weighted Citizen Voting
          </h1>
          <p className="mt-2.5 text-sm sm:text-[15px] text-[#4A6178] leading-relaxed">
            Inspect government construction tenders funded by your Dirhams and cast your verified
            citizen vote to reward transparent, eco-efficient Moroccan SMEs competing against
            corporate incumbents.
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-[#DCE5EE]">
          <div>
            <p className="text-xs text-[#5A7188]">Active Public Tenders</p>
            <p className="font-mono text-lg font-bold text-[#0F2942] tabular-nums">
              {tenders.length} Open
            </p>
          </div>
          <div className="h-8 w-px bg-[#DCE5EE]" />
          <div>
            <p className="text-xs text-[#5A7188]">Your Verified Votes</p>
            <p className="font-mono text-lg font-bold text-[#087E83] tabular-nums">
              {totalVotesCastByUser} / {tenders.length}
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Scoring Formula Banner */}
      <section
        aria-label="Transparent Contract Award Scoring Formula"
        className="bg-white rounded-2xl border border-[#D8E2EC] p-5 sm:p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-[#087E83]">
              <Info className="w-4 h-4 shrink-0" />
              <span>Transparent Public Contract Award Formula</span>
            </div>
            <p className="font-display text-base sm:text-lg font-bold text-[#0F2942]">
              Total Score (100 pts) = Technical &amp; Price Offer (Max 85 pts) + Citizen Vote
              Bonus (Up to 15 pts)
            </p>
            <p className="text-xs sm:text-sm text-[#4A6178] leading-relaxed">
              Large corporations often score slightly higher on capital scale and historical
              bonding capacity, while agile local SMEs deliver stronger eco-ratings, fair pricing,
              and local Moroccan jobs. The 15-point Citizen Vote Bonus (weighted directly by % of
              verified taxpayer votes) gives deserving SMEs a fair, merit-based path to win public
              contracts.
            </p>
          </div>

          {/* Formula Visual Breakdown */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F4F8FB] border border-[#DCE5EE] shrink-0">
            <div className="text-center px-2">
              <p className="font-mono text-lg font-bold text-[#0F2942] tabular-nums">85 pts</p>
              <p className="text-[11px] text-[#5A7188]">Technical &amp; Price</p>
            </div>
            <span className="font-mono text-lg font-bold text-[#7E93A8]">+</span>
            <div className="text-center px-2">
              <p className="font-mono text-lg font-bold text-[#087E83] tabular-nums">15 pts</p>
              <p className="text-[11px] text-[#5A7188]">Citizen Vote Bonus</p>
            </div>
            <span className="font-mono text-lg font-bold text-[#7E93A8]">=</span>
            <div className="text-center px-2">
              <p className="font-mono text-lg font-bold text-[#A6831B] tabular-nums">100 pts</p>
              <p className="text-[11px] text-[#5A7188]">Winning Score</p>
            </div>
          </div>
        </div>
      </section>

      {/* Access Control Banner: Locked vs Verified */}
      {!isPremiumUnlocked ? (
        <section
          aria-label="Voting Locked Notice"
          className="rounded-2xl bg-[#0F2942] text-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#1E4366]"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5 text-[#F4DF8F]" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold">
                Read-Only Preview · Citizen Voting Locked
              </h2>
              <p className="text-xs sm:text-sm text-[#C6D5E3] mt-1">
                Pay your tax to unlock your Verified Citizen Badge and vote on public contracts.
                You can inspect all competing offers and live scores below right now.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToAllocator}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#0F2942] font-display text-sm font-bold hover:bg-[#E2C155] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Go to Tax Allocator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      ) : (
        <section
          aria-label="Verified Taxpayer Voting Active"
          className="rounded-2xl bg-[#F0FAFB] border border-[#087E83]/40 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <Award className="w-5 h-5 text-[#A6831B] shrink-0" />
            <p className="text-xs sm:text-sm font-semibold text-[#0F2942]">
              ★ Verified Taxpayer Premium Badge Active — Cast 1 verified vote per tender project
              below to update live rankings.
            </p>
          </div>
          <span className="font-mono text-xs font-bold text-[#087E83] tabular-nums whitespace-nowrap">
            {totalVotesCastByUser} of {tenders.length} projects voted
          </span>
        </section>
      )}

      {/* Public Tender Project Cards */}
      <div className="space-y-8">
        {tenders.map((tender, tenderIdx) => {
          const { ranked, totalVotes } = getRankedBids(tender);
          const userVotedBidId = userVotes[tender.id];
          const leadingBid = ranked[0];

          return (
            <article
              key={tender.id}
              className="bg-white rounded-2xl border border-[#D8E2EC] shadow-[0_2px_14px_rgba(15,41,66,0.04)] overflow-hidden"
            >
              {/* Project Hero Split Header */}
              <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#E5ECF3]">
                {/* Architectural Photography with Zero-Broken-Image Fallback */}
                <div className="lg:col-span-4 relative min-h-[210px] bg-[#0F2942] overflow-hidden">
                  {!failedImages[tender.id] ? (
                    <img
                      src={tender.imageUrl}
                      alt={tender.title}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [tender.id]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#0F2942] to-[#087E83] text-white">
                      <Building2 className="w-10 h-10 mb-2 text-[#D4AF37]" />
                      <p className="font-display text-sm font-bold">{tender.title}</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2942]/80 via-[#0F2942]/20 to-transparent" />
                  <div className="absolute bottom-3.5 left-4 right-4 text-white flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-semibold">{tender.code}</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#F4DF8F]" />
                      {tender.region}
                    </span>
                  </div>
                </div>

                {/* Tender Meta & Summary */}
                <div className="lg:col-span-8 p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#5A7188] mb-1.5">
                      <span className="font-semibold text-[#087E83]">
                        Project #{tenderIdx + 1}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{tender.sectorTitle}</span>
                      <span aria-hidden="true">·</span>
                      <span>Voting closes {tender.deadlineDate}</span>
                    </div>

                    <h2 className="font-display text-xl sm:text-2xl font-extrabold text-[#0F2942] leading-snug">
                      {tender.title}
                    </h2>
                    <p className="text-sm text-[#4A6178] mt-2 leading-relaxed">
                      {tender.summary}
                    </p>
                  </div>

                  {/* Key Project Figures */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#EDF2F7]">
                    <div>
                      <p className="text-[11px] text-[#647B92]">Public Budget</p>
                      <p className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
                        {formatDH(tender.budgetDH)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#647B92]">Competing Bids</p>
                      <p className="font-mono text-sm font-bold text-[#0F2942] tabular-nums">
                        1 Corp · 2 SMEs
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#647B92]">Total Citizen Votes</p>
                      <p className="font-mono text-sm font-bold text-[#087E83] tabular-nums">
                        {totalVotes.toLocaleString('en-US')} votes
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#647B92]">Current Leader</p>
                      <p className="text-xs font-bold text-[#A6831B] truncate">
                        {leadingBid.bid.companyName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Competing Enterprise Bids Leaderboard */}
              <div className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-sm font-bold text-[#0F2942]">
                    Live Competing Enterprise Bids (Sorted by Total Score)
                  </h3>
                  {userVotedBidId && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#087E83]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Your verified vote is counted
                    </span>
                  )}
                </div>

                <div className="space-y-3.5">
                  {ranked.map((entry) => {
                    const { bid, votes, voteSharePct, citizenBonusPts, totalScore, rank } =
                      entry;
                    const isVotedByUser = userVotedBidId === bid.id;
                    const isInspected = !!expandedBidIds[bid.id];
                    const isLeading = rank === 1;
                    const isSME = bid.enterpriseType === 'Local SME';

                    return (
                      <div
                        key={bid.id}
                        className={`rounded-xl border transition-all duration-200 ${
                          isVotedByUser
                            ? 'bg-[#F2FAFB] border-[#087E83] ring-1 ring-[#087E83]/30'
                            : isLeading
                            ? 'bg-[#FCFBF6] border-[#D4AF37]/75'
                            : 'bg-[#FAFBFD] border-[#DCE5EE]'
                        }`}
                      >
                        <div className="p-4 sm:p-5">
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                            {/* Rank & Enterprise Name */}
                            <div className="lg:col-span-4 space-y-1">
                              <div className="flex items-center gap-2 text-xs">
                                <span
                                  className={`font-mono font-bold ${
                                    isLeading ? 'text-[#A6831B]' : 'text-[#5A7188]'
                                  }`}
                                >
                                  #{rank} {isLeading ? 'Leading' : 'Rank'}
                                </span>
                                {isLeading && (
                                  <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                                )}
                                <span className="text-[#CBD5E1]" aria-hidden="true">
                                  ·
                                </span>
                                <span
                                  className={`font-semibold ${
                                    isSME ? 'text-[#087E83]' : 'text-[#4A6178]'
                                  }`}
                                >
                                  {bid.enterpriseType}
                                </span>
                              </div>

                              <h4 className="font-display text-base font-bold text-[#0F2942]">
                                {bid.companyName}
                              </h4>

                              <p className="text-xs text-[#647B92]">
                                {bid.city} · Est. {bid.foundedYear} · Offer{' '}
                                <span className="font-mono font-semibold text-[#0F2942] tabular-nums">
                                  {formatDH(bid.bidPriceDH)}
                                </span>
                              </p>
                            </div>

                            {/* Dual-Segment Score Bar & Exact Breakdown */}
                            <div className="lg:col-span-5 space-y-2">
                              <div className="flex items-baseline justify-between text-xs">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <span className="text-[#4A6178]">
                                    Tech/Price:{' '}
                                    <strong className="font-mono text-[#0F2942] tabular-nums">
                                      {bid.technicalPriceScore}/85
                                    </strong>
                                  </span>
                                  <span className="text-[#4A6178]">
                                    Citizen Bonus:{' '}
                                    <strong className="font-mono text-[#087E83] tabular-nums">
                                      +{citizenBonusPts.toFixed(2)}/15
                                    </strong>
                                  </span>
                                </div>
                                <span className="font-mono text-base font-extrabold text-[#0F2942] tabular-nums">
                                  {totalScore.toFixed(2)}
                                  <span className="text-[11px] font-medium text-[#647B92]">
                                    /100
                                  </span>
                                </span>
                              </div>

                              {/* Segmented Score Bar */}
                              <div className="h-3 w-full bg-[#E5ECF3] rounded-full overflow-hidden flex">
                                <div
                                  className="h-full bg-[#0F2942] transition-all duration-300"
                                  style={{ width: `${bid.technicalPriceScore}%` }}
                                  title={`Technical & Price Score: ${bid.technicalPriceScore} pts`}
                                />
                                <div
                                  className="h-full bg-[#087E83] transition-all duration-300"
                                  style={{ width: `${citizenBonusPts}%` }}
                                  title={`Citizen Vote Bonus: +${citizenBonusPts.toFixed(2)} pts`}
                                />
                              </div>

                              <div className="flex items-center justify-between text-[11.5px] text-[#5A7188]">
                                <span className="font-mono tabular-nums">
                                  {votes.toLocaleString('en-US')} citizen votes (
                                  {voteSharePct.toFixed(1)}% share)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleInspectBid(bid.id)}
                                  className="inline-flex items-center gap-1 font-semibold text-[#0F2942] hover:text-[#087E83] transition-colors cursor-pointer"
                                >
                                  <span>{isInspected ? 'Hide Offer' : 'Inspect Offer'}</span>
                                  {isInspected ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Action Button: Verified Vote or Locked */}
                            <div className="lg:col-span-3 flex lg:justify-end">
                              {!isPremiumUnlocked ? (
                                <button
                                  type="button"
                                  onClick={onGoToAllocator}
                                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EDF2F7] text-[#5A7188] border border-[#D8E2EC] hover:border-[#0F2942] hover:text-[#0F2942] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Pay Tax to Vote</span>
                                </button>
                              ) : isVotedByUser ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F2942] text-[#F4DF8F] border border-[#D4AF37] text-xs font-bold whitespace-nowrap"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                                  <span>Verified Vote Cast</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onCastVote(tender.id, bid.id)}
                                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#087E83] text-white hover:bg-[#06676B] text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.99]"
                                >
                                  <Vote className="w-3.5 h-3.5" />
                                  <span>
                                    {userVotedBidId ? 'Switch Vote Here' : 'Cast Verified Vote'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expandable Detailed Offer Specifications */}
                          {isInspected && (
                            <div className="mt-4 pt-4 border-t border-[#DCE5EE] space-y-3">
                              <p className="text-xs sm:text-sm text-[#3B5268] leading-relaxed">
                                {bid.summary}
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                                <div className="p-3 rounded-lg bg-white border border-[#E5ECF3]">
                                  <p className="text-[11px] text-[#647B92]">Bid Offer Price</p>
                                  <p className="font-mono text-xs sm:text-sm font-bold text-[#0F2942] tabular-nums mt-0.5">
                                    {formatDH(bid.bidPriceDH)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-white border border-[#E5ECF3]">
                                  <p className="text-[11px] text-[#647B92] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Delivery Timeline
                                  </p>
                                  <p className="font-mono text-xs sm:text-sm font-bold text-[#0F2942] tabular-nums mt-0.5">
                                    {bid.deliveryMonths} months
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-white border border-[#E5ECF3]">
                                  <p className="text-[11px] text-[#647B92] flex items-center gap-1">
                                    <Leaf className="w-3 h-3 text-[#087E83]" />
                                    Eco-Rating
                                  </p>
                                  <p className="font-mono text-xs sm:text-sm font-bold text-[#087E83] mt-0.5">
                                    Grade {bid.ecoRating}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-white border border-[#E5ECF3]">
                                  <p className="text-[11px] text-[#647B92] flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Local Jobs Created
                                  </p>
                                  <p className="font-mono text-xs sm:text-sm font-bold text-[#0F2942] tabular-nums mt-0.5">
                                    {bid.localJobsCreated} regional jobs
                                  </p>
                                </div>
                              </div>
                              <p className="text-xs text-[#5A7188]">
                                Credentials: <span className="font-medium text-[#0F2942]">{bid.certifications}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
