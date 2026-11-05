import React, { useState, useEffect } from 'react';
import { storage } from './services/storageService';
import { 
  UserProfile, 
  VolunteerEvent, 
  EventRegistration, 
  AttendanceRecord, 
  VolunteerTeam, 
  BadgeDefinition, 
  CertificateRecord, 
  EmergencyRequest, 
  UserRole 
} from './types';
import { ToastProvider, useToast } from './components/common/Toast';
import { Navbar } from './components/common/Navbar';
import { Sidebar, NavTab } from './components/common/Sidebar';

import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentProfile } from './components/student/StudentProfile';
import { DigitalSkillPassport } from './components/student/DigitalSkillPassport';
import { TeamBuilder } from './components/student/TeamBuilder';

import { EventsExplorer } from './components/events/EventsExplorer';
import { EventDetailModal } from './components/events/EventDetailModal';
import { EventCreateModal } from './components/events/EventCreateModal';

import { QRAttendanceModal } from './components/attendance/QRAttendanceModal';
import { AttendanceApprovalPanel } from './components/attendance/AttendanceApprovalPanel';

import { ImpactTracker } from './components/impact/ImpactTracker';
import { GamificationHub } from './components/gamification/GamificationHub';
import { EmergencyRequestsView } from './components/emergency/EmergencyRequestsView';
import { CertificatesView } from './components/certificates/CertificatesView';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AIAssistantModal } from './components/ai/AIAssistantModal';

function AppContent() {
  const { showToast } = useToast();

  // Reactive state from storage
  const [currentUser, setCurrentUser] = useState<UserProfile>(storage.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(storage.getUsers());
  const [events, setEvents] = useState<VolunteerEvent[]>(storage.getEvents());
  const [registrations, setRegistrations] = useState<EventRegistration[]>(storage.getRegistrations());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(storage.getAttendanceRecords());
  const [teams, setTeams] = useState<VolunteerTeam[]>(storage.getTeams());
  const [badges, setBadges] = useState<BadgeDefinition[]>(storage.getBadges());
  const [certificates, setCertificates] = useState<CertificateRecord[]>(storage.getCertificates());
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>(storage.getEmergencyRequests());

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Modals state
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrModalInitialEventId, setQrModalInitialEventId] = useState<string | undefined>(undefined);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<VolunteerEvent | null>(null);

  // Subscribe to storage mutations
  useEffect(() => {
    const syncState = () => {
      setCurrentUser(storage.getCurrentUser());
      setAllUsers(storage.getUsers());
      setEvents(storage.getEvents());
      setRegistrations(storage.getRegistrations());
      setAttendance(storage.getAttendanceRecords());
      setTeams(storage.getTeams());
      setBadges(storage.getBadges());
      setCertificates(storage.getCertificates());
      setEmergencyRequests(storage.getEmergencyRequests());
    };

    const unsubscribe = storage.subscribe(syncState);
    return () => unsubscribe();
  }, []);

  // Handlers
  const handleSwitchUser = (userId: string) => {
    storage.setCurrentUser(userId);
    const u = storage.getCurrentUser();
    showToast(`Switched user to ${u.name} (${u.role.replace('_', ' ')})`, 'info');
  };

  const handleSwitchRole = (role: UserRole) => {
    storage.switchRole(role);
    const u = storage.getCurrentUser();
    showToast(`Active persona switched to ${u.role === 'student' ? 'Student' : u.role === 'college_admin' ? 'College Admin' : 'NGO Organizer'} (${u.name})`, 'info');
    setCurrentTab('dashboard');
  };

  const handleResetData = () => {
    storage.resetToDefault();
    showToast('Platform reset to default initial state with fresh demo records!', 'info');
    setCurrentTab('dashboard');
  };

  const handleOpenQRModal = (eventId?: string) => {
    setQrModalInitialEventId(eventId);
    setIsQRModalOpen(true);
  };

  const handleRegisterEvent = (eventId: string, teamId?: string, teamName?: string) => {
    const res = storage.registerForEvent(eventId, currentUser, teamId, teamName);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCancelRegistration = (eventId: string) => {
    const res = storage.cancelRegistration(eventId, currentUser.id);
    if (res.success) {
      showToast(res.message, 'info');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleCreateEvent = (data: any) => {
    storage.createEvent(data);
  };

  const handleSubmitAttendance = (payload: any) => {
    return storage.submitAttendance(payload);
  };

  const handleApproveAttendance = (recordId: string, approverName: string) => {
    return storage.approveAttendance(recordId, approverName);
  };

  const handleRejectAttendance = (recordId: string, reason: string) => {
    return storage.rejectAttendance(recordId, reason);
  };

  const handleSaveProfile = (updated: any) => {
    storage.updateProfile(updated);
  };

  const handleCreateTeam = (name: string, description: string, targetHours: number) => {
    storage.createTeam(name, description, currentUser, targetHours);
  };

  const handleJoinTeam = (teamId: string) => {
    return storage.joinTeam(teamId, currentUser);
  };

  const handleApplyEmergency = (requestId: string) => {
    return storage.applyForEmergencyRequest(requestId, currentUser);
  };

  const handleCreateEmergency = (data: any) => {
    storage.createEmergencyRequest(data);
  };

  const pendingApprovalsCount = attendance.filter(a => a.status === 'pending_approval').length;
  const activeEmergenciesCount = emergencyRequests.filter(r => r.status === 'active').length;
  const impactSummary = storage.getImpactSummary();

  const isStudent = currentUser.role === 'student';
  const isOrganizer = currentUser.role === 'college_admin' || currentUser.role === 'ngo_organizer';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        onSwitchRole={handleSwitchRole}
        onResetData={handleResetData}
        onOpenAIChat={() => setIsAIChatOpen(true)}
        onOpenEmergency={() => setCurrentTab('emergency')}
        emergencyCount={activeEmergenciesCount}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Modern Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            currentUser={currentUser}
            pendingApprovalsCount={pendingApprovalsCount}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-4 overflow-x-auto pb-1 flex gap-2">
            {[
              { id: 'dashboard', label: 'Overview' },
              { id: 'events', label: 'Events' },
              ...(isStudent ? [{ id: 'attendance', label: 'QR Scan' }] : []),
              ...(isOrganizer ? [{ id: 'approvals', label: `Verify (${pendingApprovalsCount})` }] : []),
              { id: 'impact', label: 'Impact' },
              ...(isStudent ? [{ id: 'passport', label: 'Passport' }] : []),
              { id: 'certificates', label: 'Certificates' },
              { id: 'teams', label: 'Teams' },
              { id: 'gamification', label: 'Ranks' },
              { id: 'emergency', label: 'Urgent' },
              ...(isOrganizer ? [{ id: 'analytics', label: 'Analytics' }] : []),
              { id: 'profile', label: 'Profile' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as NavTab)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap border transition-all ${
                  currentTab === tab.id
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: Dashboard */}
          {currentTab === 'dashboard' && (
            <>
              {isStudent ? (
                <StudentDashboard
                  currentUser={currentUser}
                  events={events}
                  registrations={registrations}
                  certificates={certificates.filter(c => c.studentId === currentUser.id)}
                  teams={teams}
                  badges={badges}
                  onOpenQRAttendance={handleOpenQRModal}
                  onNavigateTab={setCurrentTab}
                  onRegisterEvent={handleRegisterEvent}
                  onOpenAIChat={() => setIsAIChatOpen(true)}
                />
              ) : (
                <AdminAnalytics
                  currentUser={currentUser}
                  allUsers={allUsers}
                  events={events}
                  registrations={registrations}
                  attendance={attendance}
                  impactSummary={impactSummary}
                />
              )}
            </>
          )}

          {/* TAB 2: Events Explorer */}
          {currentTab === 'events' && (
            <EventsExplorer
              currentUser={currentUser}
              events={events}
              registrations={registrations}
              onOpenCreateEvent={() => setIsCreateEventOpen(true)}
              onSelectEvent={setSelectedEventForDetail}
              onRegisterEvent={handleRegisterEvent}
              onOpenQR={handleOpenQRModal}
            />
          )}

          {/* TAB 3: Student QR Attendance Check-in */}
          {currentTab === 'attendance' && isStudent && (
            <div className="space-y-4">
              <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <h2 className="text-xl font-bold text-white">QR Code & Geolocation Attendance Verification</h2>
                <p className="text-xs text-slate-300">
                  Select your registered initiative below to open the camera scanner or trigger verified check-in.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => handleOpenQRModal()}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50"
                  >
                    Open Live QR Scanner & Geo Check-in
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Organizer Attendance Approvals */}
          {currentTab === 'approvals' && isOrganizer && (
            <AttendanceApprovalPanel
              currentUser={currentUser}
              attendanceRecords={attendance}
              events={events}
              onApprove={handleApproveAttendance}
              onReject={handleRejectAttendance}
              onViewCertificates={() => setCurrentTab('certificates')}
            />
          )}

          {/* TAB 5: Social Impact Tracker */}
          {currentTab === 'impact' && (
            <ImpactTracker
              impactSummary={impactSummary}
              events={events}
            />
          )}

          {/* TAB 6: Digital Skill Passport */}
          {currentTab === 'passport' && isStudent && (
            <DigitalSkillPassport
              currentUser={currentUser}
              certificates={certificates.filter(c => c.studentId === currentUser.id)}
              badges={badges}
              events={events}
            />
          )}

          {/* TAB 7: Certificates Repository */}
          {currentTab === 'certificates' && (
            <CertificatesView
              currentUser={currentUser}
              certificates={certificates}
            />
          )}

          {/* TAB 8: Volunteer Team Builder */}
          {currentTab === 'teams' && (
            <TeamBuilder
              currentUser={currentUser}
              teams={teams}
              allUsers={allUsers}
              events={events}
              onCreateTeam={handleCreateTeam}
              onJoinTeam={handleJoinTeam}
              onRegisterTeamForEvent={handleRegisterEvent}
            />
          )}

          {/* TAB 9: Gamification & Leaderboard */}
          {currentTab === 'gamification' && (
            <GamificationHub
              currentUser={currentUser}
              badges={badges}
              allUsers={allUsers}
            />
          )}

          {/* TAB 10: Emergency Requests */}
          {currentTab === 'emergency' && (
            <EmergencyRequestsView
              currentUser={currentUser}
              emergencyRequests={emergencyRequests}
              onApply={handleApplyEmergency}
              onCreateRequest={handleCreateEmergency}
            />
          )}

          {/* TAB 11: Admin Analytics */}
          {currentTab === 'analytics' && isOrganizer && (
            <AdminAnalytics
              currentUser={currentUser}
              allUsers={allUsers}
              events={events}
              registrations={registrations}
              attendance={attendance}
              impactSummary={impactSummary}
            />
          )}

          {/* TAB 12: Profile Editor */}
          {currentTab === 'profile' && (
            <StudentProfile
              currentUser={currentUser}
              badges={badges}
              onSaveProfile={handleSaveProfile}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <QRAttendanceModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        currentUser={currentUser}
        events={events}
        registrations={registrations}
        initialEventId={qrModalInitialEventId}
        onSubmitAttendance={handleSubmitAttendance}
      />

      <EventDetailModal
        event={selectedEventForDetail}
        isOpen={!!selectedEventForDetail}
        onClose={() => setSelectedEventForDetail(null)}
        currentUser={currentUser}
        isRegistered={selectedEventForDetail ? storage.isStudentRegistered(selectedEventForDetail.id, currentUser.id) : false}
        teams={teams}
        onRegister={handleRegisterEvent}
        onCancelRegistration={handleCancelRegistration}
        onOpenQR={handleOpenQRModal}
      />

      <EventCreateModal
        currentUser={currentUser}
        isOpen={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        onCreateEvent={handleCreateEvent}
      />

      <AIAssistantModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        currentUser={currentUser}
        events={events}
        emergencyRequests={emergencyRequests}
        onNavigateTab={setCurrentTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
