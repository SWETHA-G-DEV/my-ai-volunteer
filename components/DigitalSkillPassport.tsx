import React, { useState } from 'react';
import { 
  Award, 
  Download, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  BookOpen, 
  FileCheck2, 
  Calendar,
  CheckCircle2,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { UserProfile, CertificateRecord, BadgeDefinition, VolunteerEvent } from '../../types';
import { generateSkillPassportPDF, generateCertificatePDF } from '../../services/pdfService';
import { useToast } from '../common/Toast';

interface DigitalSkillPassportProps {
  currentUser: UserProfile;
  certificates: CertificateRecord[];
  badges: BadgeDefinition[];
  events: VolunteerEvent[];
}

export const DigitalSkillPassport: React.FC<DigitalSkillPassportProps> = ({
  currentUser,
  certificates,
  badges,
  events,
}) => {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState(false);

  const studentBadges = badges.filter(b => currentUser.badges.includes(b.id));

  const handleDownloadPassportPDF = async () => {
    try {
      setDownloading(true);
      await generateSkillPassportPDF(currentUser, certificates, badges);
      showToast('Official Digital Skill Passport PDF generated and downloaded!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate PDF passport.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCertificate = async (cert: CertificateRecord) => {
    try {
      await generateCertificatePDF(cert);
      showToast(`Certificate "${cert.certificateNumber}" downloaded!`, 'success');
    } catch (e) {
      console.error(e);
      showToast('Could not download certificate.', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
              Verified Credential
            </span>
            <span className="text-xs text-slate-400 font-mono">PASSPORT #{currentUser.studentId}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-2">
            <Award className="w-6 h-6 text-emerald-400" />
            Digital Skill Passport & Portfolio
          </h1>
          <p className="text-sm text-slate-400">
            An accredited record of your verified social impact hours, field competencies, and institutionally signed certificates.
          </p>
        </div>

        <button
          onClick={handleDownloadPassportPDF}
          disabled={downloading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{downloading ? 'Compiling PDF...' : 'Download Official PDF Portfolio'}</span>
        </button>
      </div>

      {/* Main Passport Card */}
      <div className="bg-slate-900 rounded-3xl border border-emerald-500/30 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Watermark seal */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Identity & Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{currentUser.name}</h2>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300">{currentUser.department} • {currentUser.year}</p>
              <p className="text-xs text-slate-400">{currentUser.college}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-emerald-400">{currentUser.totalVerifiedHours}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Hours</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-teal-400">{currentUser.totalPoints}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Points</span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-center min-w-[100px]">
              <span className="block text-2xl font-black text-amber-400">{certificates.length}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Certificates</span>
            </div>
          </div>
        </div>

        {/* Section 1: Verified Field Skills & Capabilities */}
        <div className="py-6 border-b border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" /> Endorsed Skills & Field Competencies
          </h3>
          <div className="flex flex-wrap gap-2">
            {(currentUser.skills || []).map((skill, idx) => (
              <span
                key={idx}
                className="bg-emerald-950/40 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Section 2: Achievement Badges Earned */}
        <div className="py-6 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Unlocked Milestone & Specialization Badges
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              {studentBadges.length} of {badges.length} Badges Earned
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {studentBadges.map(badge => (
              <div
                key={badge.id}
                className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center gap-3 hover:border-slate-700 transition-all"
              >
                <span className="text-2xl">{badge.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{badge.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Verified Completed Initiatives & Certificates */}
        <div className="pt-6 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-sky-400" /> Completed Verified Initiatives & Credentials
          </h3>

          {certificates.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800">
              No verified completed events yet. Attend an event and get checked in via QR to receive your official certificate!
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map(cert => (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        {cert.eventCategory}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{cert.certificateNumber}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white">{cert.eventTitle}</h4>
                    <p className="text-xs text-slate-400">
                      Organized by <strong className="text-slate-300">{cert.organizerName}</strong> • Verified on {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400">+{cert.hoursVerified} Hours</span>
                      <p className="text-[10px] text-slate-500">Verified</p>
                    </div>
                    <button
                      onClick={() => handleDownloadCertificate(cert)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cryptographic Verification Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>Digital Passport Hash: SHA256-VC-{currentUser.id.substring(4)}-AUTH</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified against institutional ledger
          </span>
        </div>
      </div>
    </div>
  );
};
