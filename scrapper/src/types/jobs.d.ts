export interface JobDetails {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    postedAt: Date;
    qualifications?: {
      minimum: string[];
      preferred: string[];
    };
    responsibilities?: string[];
  }