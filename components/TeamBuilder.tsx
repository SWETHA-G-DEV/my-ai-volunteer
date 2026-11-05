import React, { useState } from 'react';
import { 
  Users2, 
  Plus, 
  UserPlus, 
  Trophy, 
  Target, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  Shield,
  Sparkles
} from 'lucide-react';
import { UserProfile, VolunteerTeam, VolunteerEvent } from '../../types';
import { useToast } from '../common/Toast';

interface TeamBuilderProps {
  currentUser: UserProfile;
  teams: VolunteerTeam[];
  allUsers: UserProfile[];
  events: VolunteerEvent[];
  onCreateTeam: (name: string, description: string, targetHours: number) => void;
  onJoinTeam: (teamId: string) => void;
  onRegisterTeamForEvent: (eventId: string, teamId: string, teamName: string) => void;
}

export const TeamBuilder: React.FC<TeamBuilderProps> = ({
  currentUser,
  teams,
  allUsers,
  events,
  onCreateTeam,
  onJoinTeam,
  onRegisterTeamForEvent,
}) => {
  const { showToast } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [targetHours, setTargetHours] = useState(100);

  const [selectedEventId, setSelectedEventId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  // Find teams current user belongs to
  const myTeams = teams.filter(t => t.members.some(m => m.studentId === currentUser.id));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    onCreateTeam(teamName.trim(), teamDescription.trim(), Number(targetHours));
    showToast(`Team "${teamName}" created successfully!`, 'success');
    setTeamName('');
    setTeamDescription('');
    setShowCreateModal(false);
  };

  const handleGroupRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !selectedTeamId) {
      showToast('Please select both an event and your team.', 'error');
      return;
    }
    const team = teams.find(t => t.id === selectedTeamId);
    if (!team) return;

    onRegisterTeamForEvent(selectedEventId, team.id, team.name);
    setSelectedEventId('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users2 className="w-6 h-6 text-emerald-400" />
            Volunteer Team Builder
          </h1>
          <p className="text-sm text-slate-400">
            Form student teams, invite friends, set collective community impact targets, and register together for drives.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Team
        </button>
      </div>

      {/* Group Event Registration Card (if user belongs to at least one team) */}
      {myTeams.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950/60 p-5 rounded-2xl border border-emerald-500/30">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Register as a Team for an Initiative</h2>
          </div>
          <form onSubmit={handleGroupRegister} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select
              value={selectedTeamId}
              onChange={e => setSelectedTeamId(e.target.value)}
              required
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select My Team...</option>
              {myTeams.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.members.length} members)</option>
              ))}
            </select>

            <select
              value={selectedEventId}
              onChange={e => setSelectedEventId(e.target.value)}
              required
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Select Volunteer Event...</option>
              {events.filter(e => e.status === 'upcoming').map(e => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.hoursCredited} hrs • {e.category})
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950/50 flex items-center justify-center gap-1.5"
            >
              <Users2 className="w-4 h-4" />
              <span>Register Group</span>
            </button>
          </form>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams.map(team => {
          const isMember = team.members.some(m => m.studentId === currentUser.id);
          const isLeader = team.leaderId === currentUser.id;
          const progressPercent = Math.min(100, Math.round((team.totalTeamHours / team.targetHours) * 100));

          return (
            <div
              key={team.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-white">{team.name}</h3>
                      {isLeader && (
                        <span className="bg-amber-500/15 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                          <Shield className="w-3 h-3" /> Leader
                        </span>
                      )}
                      {isMember && !isLeader && (
                        <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Member
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{team.college}</p>
                  </div>

                  <span className="bg-slate-800 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0">
                    {team.members.length} Volunteers
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{team.description}</p>

                {/* Progress Bar */}
                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Target className="w-3.5 h-3.5 text-emerald-400" /> Team Impact Goal
                    </span>
                    <span className="font-bold text-white">{team.totalTeamHours} / {team.targetHours} Hours</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>{progressPercent}% achieved</span>
                    <span>Led by {team.leaderName}</span>
                  </div>
                </div>

                {/* Members list */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Team Roster</h4>
                  <div className="space-y-1.5">
                    {team.members.map(member => (
                      <div
                        key={member.studentId}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60"
                      >
                        <span className="text-slate-200 font-medium">{member.studentName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {member.role === 'leader' ? '⭐ Founder' : 'Volunteer'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-800">
                {!isMember ? (
                  <button
                    onClick={() => {
                      onJoinTeam(team.id);
                      showToast(`Joined team "${team.name}"!`, 'success');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 hover:border-emerald-500 flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Join Team
                  </button>
                ) : (
                  <div className="text-center text-xs text-emerald-400 font-semibold py-1">
                    ✓ You are active in this squad
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Team */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users2 className="w-5 h-5 text-emerald-400" /> Create Volunteer Team
            </h2>
            <p className="text-xs text-slate-400">
              Form a squad with your classmates to pool community service hours and reach badges faster.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Team Name</label>
                <input
                  type="text"
                  placeholder="e.g. EcoEngineers KIOT, DigitalCare Squad"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Collective Hours</label>
                <input
                  type="number"
                  min={20}
                  max={500}
                  step={10}
                  value={targetHours}
                  onChange={e => setTargetHours(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Team Mission & Description</label>
                <textarea
                  rows={3}
                  placeholder="What causes does your group focus on?"
                  value={teamDescription}
                  onChange={e => setTeamDescription(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950/50"
                >
                  Launch Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
