export interface Company {
  id: number;
  name: string;
  website: string | null;
  location: string | null;
  industry: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyRequest {
  name: string;
  website: string | null;
  location: string | null;
  industry: string | null;
  notes: string | null;
}
