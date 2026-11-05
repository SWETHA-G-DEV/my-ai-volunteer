import React, { useEffect, useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  Award, 
  Calendar, 
  QrCode, 
  Users2, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Bot,
  FileCheck2,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, VolunteerEvent, EventRegistration, CertificateRecord, VolunteerTeam, BadgeDefinition, AIMatchResult } from '../../types';
import { fetchAIMatches } from '../../services/aiService';

interface StudentDashboardProps {
  currentUser: UserProfile;
  events: VolunteerEvent[];
  registrations: EventRegistration[];
  certificates: CertificateRecord[];
  teams: VolunteerTeam[];
  badges: BadgeDefinition[];
  onOpenQRAttendance: (eventId?: string) => void;
  onNavigateTab: (tab: any) => void;
  onRegisterEvent: (eventId: string) => void;
  onOpenAIChat: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  events,
  registrations,
  certificates,
  teams,
  badges,
  onOpenQRAttendance,
  onNavigateTab,
  onRegisterEvent,
  onOpenAIChat,
}) => {
  const [aiMatches, setAiMatches] = useState<AIMatchResult[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Active registered events
  const registeredEventIds = new Set(
    registrations.filter(r => r.studentId === currentUser.id && r.status === 'registered').map(r => r.eventId)
  );
  const myRegisteredEvents = events.filter(e => registeredEventIds.has(e.id));

  // Determine next milestone
  const hours = currentUser.totalVerifiedHours;
  let nextBadgeTarget = 5;
  let nextBadgeName = 'Bronze Volunteer';
  let badgeTierIcon = '🥉';

  if (hours < 5) {
    nextBadgeTarget = 5;
    nextBadgeName = 'Bronze Volunteer';
    badgeTierIcon = '🥉';
  } else if (hours < 10) {
    nextBadgeTarget = 10;
    nextBadgeName = 'Silver Champion';
    badgeTierIcon = '🥈';
  } else if (hours < 25) {
    nextBadgeTarget = 25;
    nextBadgeName = 'Gold Benefactor';
    badgeTierIcon = '🥇';
  } else if (hours < 50) {
    nextBadgeTarget = 50;
    nextBadgeName = 'Community Hero';
    badgeTierIcon = '🏆';
  } else {
    nextBadgeTarget = 100;
    nextBadgeName = 'Legendary Philanthropist';
    badgeTierIcon = '👑';
  }

  const hoursToNext = Math.max(0, nextBadgeTarget - hours);
  const progressPercent = Math.min(100, Math.round((hours / nextBadgeTarget) * 100));

  // Fetch top AI matched events for this student
  useEffect(() => {
    let isMounted = true;
    async function loadMatches() {
      setLoadingMatches(true);
      try {
        const available = events.filter(e => e.status === 'upcoming' && !registeredEventIds.has(e.id));
        const res = await fetchAIMatches(currentUser, available);
        if (isMounted) {
          setAiMatches(res.slice(0, 2));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoadingMatches(false);
      }
    }
    loadMatches();
    return () => {
      isMounted = false;
    };
  }, [currentUser.id, events.length]);

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-8 border border-emerald-500/30 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                Verified Student Portfolio
              </span>
              <span className="text-xs text-slate-400 font-mono">{currentUser.studentId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {currentUser.name}! 👋
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentUser.department} • {currentUser.college}
            </p>
          </div>

          {/* Gamification Progress Capsule */}
          <div className="bg-slate-950/70 backdrop-blur-md p-4 rounded-xl border border-slate-800 md:min-w-[280px]">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Next Milestone</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                {badgeTierIcon} {nextBadgeName}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{currentUser.totalVerifiedHours} hrs verified</span>
              <span>{hoursToNext > 0 ? `${hoursToNext} hrs to unlock` : 'Max Tier Unlocked'}</span>
            </div>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verified Hours */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Verified Service</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{currentUser.totalVerifiedHours}</span>
            <span className="text-xs text-emerald-400 font-bold">Hours</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">100% verified by organizers</p>
        </div>

        {/* Impact Points */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-teal-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Impact Points</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{currentUser.totalPoints}</span>
            <span className="text-xs text-teal-400 font-bold">Points</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">1 hr = 10 gamified points</p>
        </div>

        {/* Badges Earned */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Badges Unlocked</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{currentUser.badges.length}</span>
            <span className="text-xs text-amber-400 font-bold">Badges</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-sm">
            {currentUser.badges.slice(0, 4).map(bId => {
              const def = badges.find(b => b.id === bId);
              return <span key={bId} title={def?.name}>{def?.icon || '🎖️'}</span>;
            })}
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Certificates</span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">{certificates.length}</span>
            <span className="text-xs text-sky-400 font-bold">Issued</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Downloadable official PDFs</p>
        </div>
      </div>

      {/* Main Grid: AI Recommendations & Registered Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): AI Matching Spotlight & Upcoming Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Matching Spotlight */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">AI Opportunity Matches</h2>
                  <p className="text-xs text-slate-400">Matched to your skills & interests by Gemini API</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('events')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingMatches ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Analyzing actual events against your skills profile with Gemini AI...
              </div>
            ) : aiMatches.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No new unmatched events found right now.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiMatches.map(match => {
                  const evt = events.find(e => e.id === match.eventId);
                  if (!evt) return null;
                  return (
                    <div
                      key={evt.id}
                      className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {evt.category}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {match.matchScore}% Match
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">{evt.title}</h3>
                        <p className="text-xs text-slate-300 line-clamp-2 mb-2 leading-relaxed">
                          {match.matchReason}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-3">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{evt.location.city}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>{evt.hoursCredited} hrs</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRegisterEvent(evt.id)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-950/50"
                      >
                        Register with 1-Click
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Registered Events Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  My Registered Initiatives
                </h2>
                <p className="text-xs text-slate-400">Events you are scheduled to attend</p>
              </div>
              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {myRegisteredEvents.length} Active
              </span>
            </div>

            {myRegisteredEvents.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-800/60 p-6">
                <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No events registered yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Explore available drives in the Events tab to earn verified hours and impact badges.
                </p>
                <button
                  onClick={() => onNavigateTab('events')}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Browse Events
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myRegisteredEvents.map(evt => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          {evt.category}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(evt.startDateTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white">{evt.title}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{evt.location.address}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onOpenQRAttendance(evt.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Scan QR Check-in</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Team Card & AI Quick Assist */}
        <div className="space-y-6">
          {/* My Volunteer Team */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Users2 className="w-4 h-4 text-emerald-400" /> My Volunteer Team
              </h3>
              <button
                onClick={() => onNavigateTab('teams')}
                className="text-xs text-emerald-400 font-bold hover:underline"
              >
                Manage
              </button>
            </div>

            {teams.length > 0 ? (
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{teams[0].name}</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                    {teams[0].members.length} Members
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{teams[0].description}</p>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Team Goal</span>
                    <span className="font-bold text-white">{teams[0].totalTeamHours} / {teams[0].targetHours} hrs</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((teams[0].totalTeamHours / teams[0].targetHours) * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-slate-400">
                You haven't joined a team yet. Create or join one to volunteer with friends!
              </div>
            )}
          </div>

          {/* Quick AI Assistant Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Ask VolunteerBot AI</h4>
                <p className="text-[11px] text-slate-400">Grounded in actual college events & your stats</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Wondering which events fit your schedule, how to qualify for the next badge, or need guidance on QR check-ins?
            </p>
            <button
              onClick={onOpenAIChat}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Open Volunteer Assistant</span>
            </button>
          </div>

          {/* Digital Skill Passport Quick Link */}
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-300">Digital Skill Passport</p>
              <p className="text-[11px] text-slate-400">Export official PDF for resume & LinkedIn</p>
            </div>
            <button
              onClick={() => onNavigateTab('passport')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shrink-0"
            >
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
