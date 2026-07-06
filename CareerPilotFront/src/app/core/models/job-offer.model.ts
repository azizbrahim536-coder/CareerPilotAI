export type WorkMode =
  | 'ONSITE'
  | 'HYBRID'
  | 'REMOTE';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'INTERNSHIP'
  | 'CONTRACT'
  | 'FREELANCE';

export interface JobOffer {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  workMode: WorkMode;
  employmentType: EmploymentType;
  sourceUrl: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  deadline: string | null;
  companyId: number;
  companyName: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobOfferRequest {
  companyId: number;
  title: string;
  description: string | null;
  location: string | null;
  workMode: WorkMode;
  employmentType: EmploymentType;
  sourceUrl: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  deadline: string | null;
}
