import {
  ApplicationStatus
} from './job-application.model';

export interface DashboardApplicationItem {
  applicationId: number;
  status: ApplicationStatus;

  jobOfferId: number;
  jobTitle: string;

  companyId: number;
  companyName: string;

  location: string | null;

  appliedDate: string | null;
  interviewDate: string | null;
  nextFollowUpDate: string | null;
  updatedAt: string;
}

export interface DashboardStatistics {
  totalApplications: number;
  savedApplications: number;
  appliedApplications: number;
  interviewApplications: number;
  offerApplications: number;
  rejectedApplications: number;

  activeApplications: number;
  applicationsThisMonth: number;

  responseRate: number;
  offerRate: number;

  statusDistribution:
    Record<ApplicationStatus, number>;

  upcomingInterviews:
    DashboardApplicationItem[];

  upcomingFollowUps:
    DashboardApplicationItem[];

  recentApplications:
    DashboardApplicationItem[];
}
