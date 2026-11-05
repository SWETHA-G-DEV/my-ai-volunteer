export type UserRole = 'student' | 'college_admin' | 'ngo_organizer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  college?: string;
  department?: string;
  year?: string;
  studentId?: string;
  bio?: string;
  interests: string[];
  skills: string[];
  availableHoursPerWeek: number;
  totalVerifiedHours: number;
  totalPoints: number;
  badges: string[];
  joinedDate: string;
  organizationName?: string; // For NGO
  organizationType?: string; // For NGO
  verifiedOrg?: boolean;
}

export type EventCategory = 
  | 'Tree Plantation'
  | 'Food Distribution'
  | 'Teaching & Education'
  | 'Cleanliness Drive'
  | 'Health & Awareness'
  | 'Animal Welfare'
  | 'Disaster & Emergency Relief'
  | 'Elderly Support';

export type ImpactType = 
  | 'trees_planted'
  | 'people_served'
  | 'students_taught'
  | 'kg_waste_collected'
  | 'people_reached';

export interface EventLocation {
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // For geofence verification
}

export interface VolunteerEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizerId: string;
  organizerName: string;
  organizerRole: 'college_admin' | 'ngo_organizer';
  location: EventLocation;
  startDateTime: string; // ISO
  endDateTime: string; // ISO
  hoursCredited: number;
  requiredVolunteers: number;
  registeredCount: number;
  skillsRequired: string[];
  impactType: ImpactType;
  targetImpactAmount: number;
  verifiedImpactAmount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  qrSecretCode: string;
  imageUrl?: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  teamId?: string;
  teamName?: string;
  registeredAt: string;
  status: 'registered' | 'cancelled';
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCollege: string;
  scannedAt: string;
  geoVerified: boolean;
  distanceMeters?: number;
  studentCoordinates?: {
    latitude: number;
    longitude: number;
  };
  status: 'pending_approval' | 'approved' | 'rejected';
  organizerId: string;
  approvedAt?: string;
  approvedBy?: string;
  hoursAwarded: number;
  pointsAwarded: number;
  rejectionReason?: string;
}

export interface TeamMember {
  studentId: string;
  studentName: string;
  studentEmail: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface VolunteerTeam {
  id: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  college: string;
  members: TeamMember[];
  targetHours: number;
  totalTeamHours: number;
  createdAt: string;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredHours: number;
  category?: EventCategory | 'general';
  tier: 'bronze' | 'silver' | 'gold' | 'hero' | 'specialist';
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  studentId: string;
  studentName: string;
  studentCollege: string;
  studentDepartment?: string;
  eventId: string;
  eventTitle: string;
  eventCategory: EventCategory;
  organizerName: string;
  hoursVerified: number;
  issuedAt: string;
  qrVerificationUrl: string;
  signatureTitle: string;
}

export interface ImpactSummary {
  treesPlanted: { verified: number; estimated: number; label: string; unit: string };
  peopleServed: { verified: number; estimated: number; label: string; unit: string };
  studentsTaught: { verified: number; estimated: number; label: string; unit: string };
  kgWasteCollected: { verified: number; estimated: number; label: string; unit: string };
  peopleReached: { verified: number; estimated: number; label: string; unit: string };
}

export interface EmergencyRequest {
  id: string;
  title: string;
  description: string;
  organizationId: string;
  organizationName: string;
  location: string;
  urgencyLevel: 'critical' | 'high' | 'urgent';
  volunteersNeeded: number;
  volunteersApplied: number;
  skillsRequired: string[];
  contactPhone: string;
  contactEmail: string;
  deadline: string;
  status: 'active' | 'fulfilled' | 'closed';
  createdAt: string;
  applicants: {
    studentId: string;
    studentName: string;
    studentEmail: string;
    appliedAt: string;
    status: 'pending' | 'accepted' | 'declined';
  }[];
}

export interface AIMatchResult {
  eventId: string;
  matchScore: number; // 0-100
  matchReason: string;
  highlightedSkills: string[];
  recommendedRole: string;
}
