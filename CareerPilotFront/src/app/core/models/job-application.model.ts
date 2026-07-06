import {
  EmploymentType,
  WorkMode
} from './job-offer.model';

export type ApplicationStatus =
  | 'SAVED'
  | 'APPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED';

export interface JobApplication {
  id: number;
  status: ApplicationStatus;
  appliedDate: string | null;
  interviewDate: string | null;
  nextFollowUpDate: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;

  jobOfferId: number;
  jobTitle: string;
  jobLocation: string | null;
  workMode: WorkMode;
  employmentType: EmploymentType;
  sourceUrl: string | null;

  companyId: number;
  companyName: string;

  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationRequest {
  jobOfferId: number;
  status: ApplicationStatus;
  appliedDate: string | null;
  interviewDate: string | null;
  nextFollowUpDate: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
}

export interface ApplicationStatusRequest {
  status: ApplicationStatus;
}

export type ApplicationBoard =
  Record<ApplicationStatus, JobApplication[]>;
