import React, { useState } from 'react';
import { 
  UserCircle, 
  Save, 
  Sparkles, 
  Clock, 
  Plus, 
  X, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, BadgeDefinition } from '../../types';
import { useToast } from '../common/Toast';

interface StudentProfileProps {
  currentUser: UserProfile;
  badges: BadgeDefinition[];
  onSaveProfile: (updated: Partial<UserProfile> & { id: string }) => void;
}

const COMMON_INTERESTS = [
  'Environmental Conservation',
  'STEM Education',
  'Community Cleanliness',
  'Food Security',
  'Disaster Relief',
  'Healthcare & Blood Donation',
  'Animal Welfare',
  'Elderly Care',
  'Digital Literacy',
  'Rural Empowerment',
];

const COMMON_SKILLS = [
  'Team Coordination',
  'Teaching & Tutoring',
  'First Aid & Safety',
  'Logistics Management',
  'Public Speaking',
  'Event Photography',
  'Coding & Web Design',
  'Physical Stamina',
  'Waste Segregation',
  'Crowd Management',
];

export const StudentProfile: React.FC<StudentProfileProps> = ({
  currentUser,
  badges,
  onSaveProfile,
}) => {
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [college, setCollege] = useState(currentUser.college || '');
  const [department, setDepartment] = useState(currentUser.department || '');
  const [year, setYear] = useState(currentUser.year || '3rd Year');
  const [studentId, setStudentId] = useState(currentUser.studentId || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [availableHours, setAvailableHours] = useState(currentUser.availableHoursPerWeek || 6);
  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [skills, setSkills] = useState<string[]>(currentUser.skills || []);

  const [customInterestInput, setCustomInterestInput] = useState('');
  const [customSkillInput, setCustomSkillInput] = useState('');

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter(i => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const addCustomInterest = () => {
    if (customInterestInput.trim() && !interests.includes(customInterestInput.trim())) {
      setInterests([...interests, customInterestInput.trim()]);
      setCustomInterestInput('');
    }
  };

  const toggleSkill = (item: string) => {
    if (skills.includes(item)) {
      setSkills(skills.filter(s => s !== item));
    } else {
      setSkills([...skills, item]);
    }
  };

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !skills.includes(customSkillInput.trim())) {
      setSkills([...skills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      id: currentUser.id,
      name,
      email,
      college,
      department,
      year,
      studentId,
      bio,
      availableHoursPerWeek: Number(availableHours),
      interests,
      skills,
    });
    showToast('Student profile updated successfully! AI matching criteria refreshed.', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <UserCircle className="w-6 h-6 text-emerald-400" />
            Student Profile & Skills Matrix
          </h1>
          <p className="text-sm text-slate-400">
            Define your academic details, skills, and weekly availability for personalized Gemini AI volunteer matching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{currentUser.totalVerifiedHours} hrs verified</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Academic Info Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <GraduationCap className="w-4 h-4 text-emerald-400" /> Academic & Personal Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Institutional Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">College / University</label>
              <input
                type="text"
                value={college}
                onChange={e => setCollege(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Department / Branch</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
              <select
                value={year}
                onChange={e => setYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Roll / Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bio & Social Mission Statement</label>
            <textarea
              rows={2}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="What community issues or causes are you passionate about?"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>
        </div>

        {/* Availability Slider */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Available Volunteering Commitment
            </h2>
            <span className="text-emerald-400 font-extrabold text-sm px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {availableHours} Hours / Week
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Helps Gemini AI filter out commitments that conflict with your study workload.
          </p>

          <input
            type="range"
            min={1}
            max={25}
            step={1}
            value={availableHours}
            onChange={e => setAvailableHours(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Light (1-3 hrs)</span>
            <span>Balanced (4-8 hrs)</span>
            <span>Active Leader (10-15 hrs)</span>
            <span>Intensive (20+ hrs)</span>
          </div>
        </div>

        {/* Interests Selector */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Cause Interests
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select the social impact sectors you care most about:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_INTERESTS.map(item => {
              const selected = interests.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleInterest(item)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    selected
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {selected && '✓ '}
                  {item}
                </button>
              );
            })}
          </div>

          {/* Custom Interest Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add another cause interest..."
              value={customInterestInput}
              onChange={e => setCustomInterestInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomInterest();
                }
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={addCustomInterest}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Skills Selector */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> Core Skills & Strengths
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Highlight capabilities you can deploy in the field:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_SKILLS.map(item => {
              const selected = skills.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleSkill(item)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    selected
                      ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                      : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {selected && '✓ '}
                  {item}
                </button>
              );
            })}
          </div>

          {/* Custom Skill Input */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Add specialized skill (e.g., Drone Mapping, Solar Wiring)..."
              value={customSkillInput}
              onChange={e => setCustomSkillInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSkill();
                }
              }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-950/50"
          >
            <Save className="w-4 h-4" /> Save Profile & Update Matching
          </button>
        </div>
      </form>
    </div>
  );
};
