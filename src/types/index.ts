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
  inCircle?: boolean;
  sessionAttendances?: SessionAttendee[];
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

export interface MentorCircle {
  id: number;
  name: string;
  coordinator: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  semester: string;
  location: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  sessions?: CircleSession[];
}

export interface CircleSession {
  id: number;
  circleId: number;
  date: string;
  notes: string | null;
  cancelled: boolean;
  createdAt: string;
  attendees?: SessionAttendee[];
  circle?: MentorCircle;
}

export interface SessionAttendee {
  id: number;
  sessionId: number;
  mentorId: number;
  status: string;
  createdAt: string;
  mentor?: Mentor;
  session?: CircleSession;
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
