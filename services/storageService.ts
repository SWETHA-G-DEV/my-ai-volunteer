import { 
  UserProfile, 
  VolunteerEvent, 
  EventRegistration, 
  AttendanceRecord, 
  VolunteerTeam, 
  BadgeDefinition, 
  CertificateRecord, 
  EmergencyRequest, 
  ImpactSummary,
  UserRole
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_EVENTS, 
  INITIAL_REGISTRATIONS, 
  INITIAL_ATTENDANCE, 
  INITIAL_TEAMS, 
  INITIAL_BADGES, 
  INITIAL_CERTIFICATES, 
  INITIAL_EMERGENCY_REQUESTS 
} from '../data/initialData';

const STORAGE_KEY = 'volunteerconnect_v1_database';

interface StorageState {
  users: UserProfile[];
  currentUserId: string;
  events: VolunteerEvent[];
  registrations: EventRegistration[];
  attendance: AttendanceRecord[];
  teams: VolunteerTeam[];
  badges: BadgeDefinition[];
  certificates: CertificateRecord[];
  emergencyRequests: EmergencyRequest[];
}

type Listener = () => void;

class StorageService {
  private state: StorageState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): StorageState {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.users && parsed.events) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load storage from localStorage, using initial defaults', e);
    }

    return {
      users: INITIAL_USERS,
      currentUserId: INITIAL_USERS[0].id,
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      attendance: INITIAL_ATTENDANCE,
      teams: INITIAL_TEAMS,
      badges: INITIAL_BADGES,
      certificates: INITIAL_CERTIFICATES,
      emergencyRequests: INITIAL_EMERGENCY_REQUESTS,
    };
  }

  private saveState(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    this.notify();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn) => fn());
  }

  public resetToDefault(): void {
    this.state = {
      users: INITIAL_USERS,
      currentUserId: INITIAL_USERS[0].id,
      events: INITIAL_EVENTS,
      registrations: INITIAL_REGISTRATIONS,
      attendance: INITIAL_ATTENDANCE,
      teams: INITIAL_TEAMS,
      badges: INITIAL_BADGES,
      certificates: INITIAL_CERTIFICATES,
      emergencyRequests: INITIAL_EMERGENCY_REQUESTS,
    };
    this.saveState();
  }

  // Current User & Auth
  public getCurrentUser(): UserProfile {
    const user = this.state.users.find(u => u.id === this.state.currentUserId);
    return user || this.state.users[0];
  }

  public setCurrentUser(userId: string): void {
    if (this.state.users.some(u => u.id === userId)) {
      this.state.currentUserId = userId;
      this.saveState();
    }
  }

  public switchRole(role: UserRole): void {
    const targetUser = this.state.users.find(u => u.role === role);
    if (targetUser) {
      this.state.currentUserId = targetUser.id;
      this.saveState();
    }
  }

  public getUsers(): UserProfile[] {
    return this.state.users;
  }

  public updateProfile(updated: Partial<UserProfile> & { id: string }): UserProfile {
    this.state.users = this.state.users.map(u => {
      if (u.id === updated.id) {
        return { ...u, ...updated };
      }
      return u;
    });
    this.saveState();
    return this.getCurrentUser();
  }

  // Events
  public getEvents(): VolunteerEvent[] {
    return this.state.events;
  }

  public getEventById(id: string): VolunteerEvent | undefined {
    return this.state.events.find(e => e.id === id);
  }

  public createEvent(eventData: Omit<VolunteerEvent, 'id' | 'registeredCount' | 'verifiedImpactAmount' | 'createdAt'>): VolunteerEvent {
    const newEvent: VolunteerEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      verifiedImpactAmount: 0,
      createdAt: new Date().toISOString(),
    };
    this.state.events = [newEvent, ...this.state.events];
    this.saveState();
    return newEvent;
  }

  public updateEvent(id: string, updates: Partial<VolunteerEvent>): void {
    this.state.events = this.state.events.map(e => e.id === id ? { ...e, ...updates } : e);
    this.saveState();
  }

  public deleteEvent(id: string): void {
    this.state.events = this.state.events.filter(e => e.id !== id);
    this.state.registrations = this.state.registrations.filter(r => r.eventId !== id);
    this.saveState();
  }

  // Registrations
  public getRegistrations(): EventRegistration[] {
    return this.state.registrations;
  }

  public getStudentRegistrations(studentId: string): EventRegistration[] {
    return this.state.registrations.filter(r => r.studentId === studentId && r.status === 'registered');
  }

  public isStudentRegistered(eventId: string, studentId: string): boolean {
    return this.state.registrations.some(r => r.eventId === eventId && r.studentId === studentId && r.status === 'registered');
  }

  public registerForEvent(eventId: string, student: UserProfile, teamId?: string, teamName?: string): { success: boolean; message: string } {
    const event = this.getEventById(eventId);
    if (!event) return { success: false, message: 'Event not found.' };

    if (event.status === 'completed' || event.status === 'cancelled') {
      return { success: false, message: 'Event is no longer accepting registrations.' };
    }

    if (event.registeredCount >= event.requiredVolunteers) {
      return { success: false, message: 'Event capacity is full.' };
    }

    if (this.isStudentRegistered(eventId, student.id)) {
      return { success: false, message: 'You are already registered for this event.' };
    }

    const newReg: EventRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId,
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      teamId,
      teamName,
      registeredAt: new Date().toISOString(),
      status: 'registered',
    };

    this.state.registrations = [newReg, ...this.state.registrations];
    // Increment seat count
    this.state.events = this.state.events.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e);
    this.saveState();

    return { success: true, message: `Successfully registered for "${event.title}"!` };
  }

  public cancelRegistration(eventId: string, studentId: string): { success: boolean; message: string } {
    const existing = this.state.registrations.find(r => r.eventId === eventId && r.studentId === studentId && r.status === 'registered');
    if (!existing) return { success: false, message: 'Registration not found.' };

    this.state.registrations = this.state.registrations.map(r => r.id === existing.id ? { ...r, status: 'cancelled' } : r);
    this.state.events = this.state.events.map(e => e.id === eventId ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e);
    this.saveState();
    return { success: true, message: 'Registration cancelled successfully.' };
  }

  // QR + Geo Attendance
  public getAttendanceRecords(): AttendanceRecord[] {
    return this.state.attendance;
  }

  public submitAttendance(payload: {
    eventId: string;
    student: UserProfile;
    scannedSecretCode: string;
    studentCoords?: { latitude: number; longitude: number };
  }): { success: boolean; message: string; record?: AttendanceRecord; distance?: number } {
    const event = this.getEventById(payload.eventId);
    if (!event) return { success: false, message: 'Invalid Event: Not found in database.' };

    // 1. QR code validity
    if (event.qrSecretCode !== payload.scannedSecretCode) {
      return { success: false, message: 'Invalid QR Code: Secret verification token does not match event signature.' };
    }

    // 2. Registration check
    if (!this.isStudentRegistered(event.id, payload.student.id)) {
      return { success: false, message: 'You are not registered for this event. Please register first.' };
    }

    // 3. Duplicate check
    const existingAtt = this.state.attendance.find(a => a.eventId === event.id && a.studentId === payload.student.id);
    if (existingAtt) {
      if (existingAtt.status === 'approved') {
        return { success: false, message: 'Attendance already approved and recorded for this event.' };
      }
      return { success: false, message: 'Attendance check-in already submitted and awaiting organizer review.' };
    }

    // 4. Geolocation check (if coordinates provided)
    let geoVerified = false;
    let distanceMeters: number | undefined;

    if (payload.studentCoords) {
      distanceMeters = this.calculateDistanceMeters(
        payload.studentCoords.latitude,
        payload.studentCoords.longitude,
        event.location.latitude,
        event.location.longitude
      );
      // Valid if within event geofence radius + 200m buffer for GPS accuracy
      const maxAllowed = event.location.radiusMeters + 200;
      geoVerified = distanceMeters <= maxAllowed;
    } else {
      // Remote or browser location denied
      geoVerified = false;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      studentId: payload.student.id,
      studentName: payload.student.name,
      studentEmail: payload.student.email,
      studentCollege: payload.student.college || 'Knowledge Institute of Technology',
      scannedAt: new Date().toISOString(),
      geoVerified,
      distanceMeters: distanceMeters !== undefined ? Math.round(distanceMeters) : undefined,
      studentCoordinates: payload.studentCoords,
      status: 'pending_approval', // STRICT RULE: Never award points or hours before organizer approval
      organizerId: event.organizerId,
      hoursAwarded: event.hoursCredited,
      pointsAwarded: event.hoursCredited * 10, // 1 hour = 10 points
    };

    this.state.attendance = [newRecord, ...this.state.attendance];
    this.saveState();

    return { 
      success: true, 
      message: `QR Scanned & Check-in Logged! Organizer verification is required to grant ${event.hoursCredited} verified hours.`, 
      record: newRecord,
      distance: distanceMeters !== undefined ? Math.round(distanceMeters) : undefined
    };
  }

  // Organizer Approves Attendance
  public approveAttendance(attendanceId: string, approverName: string): { success: boolean; message: string; unlockedBadge?: string } {
    const record = this.state.attendance.find(a => a.id === attendanceId);
    if (!record) return { success: false, message: 'Attendance record not found.' };

    if (record.status === 'approved') {
      return { success: false, message: 'This record is already verified and approved.' };
    }

    const event = this.getEventById(record.eventId);
    if (!event) return { success: false, message: 'Linked event does not exist.' };

    const student = this.state.users.find(u => u.id === record.studentId);
    if (!student) return { success: false, message: 'Student profile not found.' };

    // Update Attendance Record
    const approvedAt = new Date().toISOString();
    this.state.attendance = this.state.attendance.map(a => {
      if (a.id === attendanceId) {
        return {
          ...a,
          status: 'approved',
          approvedAt,
          approvedBy: approverName,
        };
      }
      return a;
    });

    // Award Points and Hours (1 hr = 10 pts)
    const newTotalHours = student.totalVerifiedHours + record.hoursAwarded;
    const newTotalPoints = student.totalPoints + record.pointsAwarded;

    // Check Badges
    const newlyUnlockedBadges: string[] = [];
    const currentBadges = new Set(student.badges);

    // 5 hours = Bronze
    if (newTotalHours >= 5 && !currentBadges.has('badge-bronze')) {
      newlyUnlockedBadges.push('badge-bronze');
      currentBadges.add('badge-bronze');
    }
    // 10 hours = Silver
    if (newTotalHours >= 10 && !currentBadges.has('badge-silver')) {
      newlyUnlockedBadges.push('badge-silver');
      currentBadges.add('badge-silver');
    }
    // 25 hours = Gold
    if (newTotalHours >= 25 && !currentBadges.has('badge-gold')) {
      newlyUnlockedBadges.push('badge-gold');
      currentBadges.add('badge-gold');
    }
    // 50 hours = Community Hero
    if (newTotalHours >= 50 && !currentBadges.has('badge-hero')) {
      newlyUnlockedBadges.push('badge-hero');
      currentBadges.add('badge-hero');
    }

    // Category specialist badges
    if (event.category === 'Tree Plantation' && !currentBadges.has('badge-green')) {
      newlyUnlockedBadges.push('badge-green');
      currentBadges.add('badge-green');
    }
    if (event.category === 'Teaching & Education' && !currentBadges.has('badge-mentor')) {
      newlyUnlockedBadges.push('badge-mentor');
      currentBadges.add('badge-mentor');
    }
    if (event.category === 'Cleanliness Drive' && !currentBadges.has('badge-eco')) {
      newlyUnlockedBadges.push('badge-eco');
      currentBadges.add('badge-eco');
    }
    if (event.category === 'Food Distribution' && !currentBadges.has('badge-feeder')) {
      newlyUnlockedBadges.push('badge-feeder');
      currentBadges.add('badge-feeder');
    }

    // Update student profile
    this.state.users = this.state.users.map(u => {
      if (u.id === student.id) {
        return {
          ...u,
          totalVerifiedHours: newTotalHours,
          totalPoints: newTotalPoints,
          badges: Array.from(currentBadges),
        };
      }
      return u;
    });

    // Update Team Hours if student is in a team
    this.state.teams = this.state.teams.map(team => {
      const isMember = team.members.some(m => m.studentId === student.id);
      if (isMember) {
        return {
          ...team,
          totalTeamHours: team.totalTeamHours + record.hoursAwarded,
        };
      }
      return team;
    });

    // Increment Verified Impact in the Event
    const estimatedIndividualContribution = Math.max(1, Math.round(event.targetImpactAmount / Math.max(1, event.requiredVolunteers)));
    this.state.events = this.state.events.map(e => {
      if (e.id === event.id) {
        return {
          ...e,
          verifiedImpactAmount: e.verifiedImpactAmount + estimatedIndividualContribution,
        };
      }
      return e;
    });

    // Generate Verified Certificate
    const certNum = `VC-CERT-${new Date().getFullYear()}-${event.category.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCertificate: CertificateRecord = {
      id: `cert-${Date.now()}`,
      certificateNumber: certNum,
      studentId: student.id,
      studentName: student.name,
      studentCollege: student.college || 'Knowledge Institute of Technology',
      studentDepartment: student.department,
      eventId: event.id,
      eventTitle: event.title,
      eventCategory: event.category,
      organizerName: event.organizerName,
      hoursVerified: record.hoursAwarded,
      issuedAt: approvedAt,
      qrVerificationUrl: `https://volunteerconnect.kiot.ac.in/verify/${certNum}`,
      signatureTitle: approverName,
    };
    this.state.certificates = [newCertificate, ...this.state.certificates];

    this.saveState();

    const badgeUnlockedMsg = newlyUnlockedBadges.length > 0 
      ? ` 🏆 Milestone unlocked: ${newlyUnlockedBadges.map(b => this.state.badges.find(x => x.id === b)?.name).join(', ')}!` 
      : '';

    return {
      success: true,
      message: `Verified and approved ${record.hoursAwarded} hours (+${record.pointsAwarded} pts) for ${student.name}. Certificate issued.${badgeUnlockedMsg}`,
      unlockedBadge: newlyUnlockedBadges[0],
    };
  }

  public rejectAttendance(attendanceId: string, reason: string): { success: boolean; message: string } {
    this.state.attendance = this.state.attendance.map(a => {
      if (a.id === attendanceId) {
        return {
          ...a,
          status: 'rejected',
          rejectionReason: reason || 'Location or time verification criteria not satisfied.',
        };
      }
      return a;
    });
    this.saveState();
    return { success: true, message: 'Attendance record marked as rejected.' };
  }

  // Certificates
  public getCertificates(): CertificateRecord[] {
    return this.state.certificates;
  }

  public getStudentCertificates(studentId: string): CertificateRecord[] {
    return this.state.certificates.filter(c => c.studentId === studentId);
  }

  // Badges
  public getBadges(): BadgeDefinition[] {
    return this.state.badges;
  }

  // Teams
  public getTeams(): VolunteerTeam[] {
    return this.state.teams;
  }

  public createTeam(name: string, description: string, leader: UserProfile, targetHours: number): VolunteerTeam {
    const newTeam: VolunteerTeam = {
      id: `team-${Date.now()}`,
      name,
      description,
      leaderId: leader.id,
      leaderName: leader.name,
      college: leader.college || 'Knowledge Institute of Technology',
      targetHours: targetHours || 100,
      totalTeamHours: 0,
      createdAt: new Date().toISOString(),
      members: [
        {
          studentId: leader.id,
          studentName: leader.name,
          studentEmail: leader.email,
          role: 'leader',
          joinedAt: new Date().toISOString(),
        }
      ]
    };
    this.state.teams = [newTeam, ...this.state.teams];
    this.saveState();
    return newTeam;
  }

  public joinTeam(teamId: string, student: UserProfile): { success: boolean; message: string } {
    const team = this.state.teams.find(t => t.id === teamId);
    if (!team) return { success: false, message: 'Team not found.' };

    if (team.members.some(m => m.studentId === student.id)) {
      return { success: false, message: 'You are already in this team.' };
    }

    const updatedMembers = [
      ...team.members,
      {
        studentId: student.id,
        studentName: student.name,
        studentEmail: student.email,
        role: 'member' as const,
        joinedAt: new Date().toISOString(),
      }
    ];

    this.state.teams = this.state.teams.map(t => t.id === teamId ? { ...t, members: updatedMembers } : t);
    this.saveState();
    return { success: true, message: `Successfully joined ${team.name}!` };
  }

  // Emergency Requests
  public getEmergencyRequests(): EmergencyRequest[] {
    return this.state.emergencyRequests;
  }

  public createEmergencyRequest(data: Omit<EmergencyRequest, 'id' | 'volunteersApplied' | 'createdAt' | 'status' | 'applicants'>): EmergencyRequest {
    const newReq: EmergencyRequest = {
      ...data,
      id: `emg-${Date.now()}`,
      volunteersApplied: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      applicants: [],
    };
    this.state.emergencyRequests = [newReq, ...this.state.emergencyRequests];
    this.saveState();
    return newReq;
  }

  public applyForEmergencyRequest(requestId: string, student: UserProfile): { success: boolean; message: string } {
    const req = this.state.emergencyRequests.find(r => r.id === requestId);
    if (!req) return { success: false, message: 'Emergency request not found.' };

    if (req.applicants.some(a => a.studentId === student.id)) {
      return { success: false, message: 'You have already applied for this emergency request.' };
    }

    const newApplicant = {
      studentId: student.id,
      studentName: student.name,
      studentEmail: student.email,
      appliedAt: new Date().toISOString(),
      status: 'pending' as const,
    };

    this.state.emergencyRequests = this.state.emergencyRequests.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          volunteersApplied: r.volunteersApplied + 1,
          applicants: [newApplicant, ...r.applicants],
        };
      }
      return r;
    });

    this.saveState();
    return { success: true, message: 'Emergency application sent! The organizer will coordinate contact immediately.' };
  }

  // Social Impact Summary Calculation
  public getImpactSummary(): ImpactSummary {
    let treesVerified = 0;
    let treesEstimated = 0;
    let peopleServedVerified = 0;
    let peopleServedEstimated = 0;
    let studentsTaughtVerified = 0;
    let studentsTaughtEstimated = 0;
    let wasteVerified = 0;
    let wasteEstimated = 0;
    let peopleReachedVerified = 0;
    let peopleReachedEstimated = 0;

    this.state.events.forEach(evt => {
      switch (evt.impactType) {
        case 'trees_planted':
          treesVerified += evt.verifiedImpactAmount;
          treesEstimated += evt.targetImpactAmount;
          break;
        case 'people_served':
          peopleServedVerified += evt.verifiedImpactAmount;
          peopleServedEstimated += evt.targetImpactAmount;
          break;
        case 'students_taught':
          studentsTaughtVerified += evt.verifiedImpactAmount;
          studentsTaughtEstimated += evt.targetImpactAmount;
          break;
        case 'kg_waste_collected':
          wasteVerified += evt.verifiedImpactAmount;
          wasteEstimated += evt.targetImpactAmount;
          break;
        case 'people_reached':
          peopleReachedVerified += evt.verifiedImpactAmount;
          peopleReachedEstimated += evt.targetImpactAmount;
          break;
      }
    });

    return {
      treesPlanted: { verified: treesVerified, estimated: treesEstimated, label: 'Trees Planted', unit: 'saplings' },
      peopleServed: { verified: peopleServedVerified, estimated: peopleServedEstimated, label: 'Food Distribution', unit: 'meals' },
      studentsTaught: { verified: studentsTaughtVerified, estimated: studentsTaughtEstimated, label: 'Teaching & Mentorship', unit: 'students' },
      kgWasteCollected: { verified: wasteVerified, estimated: wasteEstimated, label: 'Plastic Cleaned', unit: 'kg collected' },
      peopleReached: { verified: peopleReachedVerified, estimated: peopleReachedEstimated, label: 'Health & Awareness', unit: 'people reached' },
    };
  }

  // Helper: Haversine distance formula in meters
  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export const storage = new StorageService();
