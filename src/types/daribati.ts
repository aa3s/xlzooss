export type ActiveTab = 'allocator' | 'tenders' | 'profile';

export type TaxCategory =
  | 'IR — Impôt sur le Revenu'
  | 'Taxe d\'Habitation'
  | 'Taxe Professionnelle'
  | 'Combined Annual Civic Tax';

export type PaymentMethod = 'cmi_card' | 'fatourati' | 'bank_transfer';

export interface SubSector {
  id: string;
  name: string;
  targetDH: number;
  currentDH: number;
  description: string;
}

export interface Sector {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  targetDH: number;
  initialPercent: number;
  accentTop: string;
  accentBottom: string;
  accentLight: string;
  subSectors: SubSector[];
}

export interface AllocationItem {
  sectorId: string;
  sectorTitle: string;
  subSectorId: string;
  subSectorName: string;
  amountDH: number;
}

export interface TaxReceipt {
  id: string;
  paidAt: string;
  taxCategory: TaxCategory;
  totalAmountDH: number;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  citizenName: string;
  citizenCIN: string;
  citizenCity: string;
  allocations: AllocationItem[];
}

export interface EnterpriseBid {
  id: string;
  companyName: string;
  enterpriseType: 'Large Corporate' | 'Local SME';
  city: string;
  foundedYear: number;
  technicalPriceScore: number; // Max 85 pts
  initialCitizenVotes: number;
  bidPriceDH: number;
  deliveryMonths: number;
  ecoRating: 'A+' | 'A' | 'B+' | 'B';
  localJobsCreated: number;
  certifications: string;
  summary: string;
}

export interface PublicTender {
  id: string;
  code: string;
  title: string;
  region: string;
  sectorTitle: string;
  budgetDH: number;
  deadlineDate: string;
  imageUrl: string;
  summary: string;
  bids: EnterpriseBid[];
}

export interface CitizenProfile {
  fullName: string;
  cin: string;
  city: string;
  taxIdIF: string;
}
