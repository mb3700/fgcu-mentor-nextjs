export interface Mentor {
  id: number;
  name: string;
  status: string;
  businessName: string | null;
  title: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  biography: string | null;
  fgcuAlumni: boolean;
  domainExpertise: string[];
  sectorExpertise: string[];
  programs: string[];
  workStatus: string | null;
  potentialSpeaker: boolean;
  potentialJudge: boolean;
  mentorCoordinator: string | null;
  veteranStatus: boolean;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  interactions?: Interaction[];
}

export interface Interaction {
  id: number;
  mentorId: number;
  type: string;
  subject: string | null;
  notes: string | null;
  date: string;
  createdBy: string | null;
  createdAt: string;
}

export interface StatsData {
  total: number;
  available: number;
  pending: number;
  speakers: number;
  judges: number;
  alumni: number;
  veterans: number;
  programs: Record<string, number>;
  domains: Record<string, number>;
  sectors: Record<string, number>;
  workStatuses: Record<string, number>;
}

export interface FilterParams {
  search?: string;
  program?: string;
  domain?: string;
  sector?: string;
  status?: string;
  workStatus?: string;
  alumni?: boolean;
  veteran?: boolean;
  speaker?: boolean;
  judge?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface MatchRequest {
  domainExpertise: string[];
  sectorExpertise: string[];
  programs?: string[];
}

export interface MatchResult {
  mentor: Mentor;
  score: number;
  matchedDomains: string[];
  matchedSectors: string[];
  matchedPrograms: string[];
  matchPercentage: number;
}

export interface ImportedMentor {
  name: string;
  status: string;
  businessName: string | null;
  title: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  biography: string | null;
  fgcuAlumni: boolean;
  domainExpertise: string[];
  sectorExpertise: string[];
  programs: string[];
  workStatus: string | null;
  potentialSpeaker: boolean;
  potentialJudge: boolean;
  mentorCoordinator: string | null;
  veteranStatus: boolean;
}
