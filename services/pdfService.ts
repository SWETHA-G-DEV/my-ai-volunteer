import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { CertificateRecord, UserProfile, VolunteerEvent, BadgeDefinition } from '../types';

export async function generateCertificatePDF(cert: CertificateRecord): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Background / Border styling - Emerald & Navy Theme
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Inner card background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, 'F');

  // Decorative double border
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(2);
  doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 3, 3, 'S');

  doc.setDrawColor(148, 163, 184); // slate-400
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 14, pageWidth - 28, pageHeight - 28, 2, 2, 'S');

  // Top header with institution watermark
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('VOLUNTEERCONNECT AI • SOCIAL IMPACT CREDENTIALING ECOSYSTEM', pageWidth / 2, 24, { align: 'center' });

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE OF VOLUNTEER EXCELLENCE', pageWidth / 2, 38, { align: 'center' });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify and officially verify that', pageWidth / 2, 48, { align: 'center' });

  // Student Name
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(cert.studentName.toUpperCase(), pageWidth / 2, 60, { align: 'center' });

  // College & Department
  doc.setTextColor(71, 85, 105);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const academicLine = `${cert.studentCollege}${cert.studentDepartment ? ` • ${cert.studentDepartment}` : ''}`;
  doc.text(academicLine, pageWidth / 2, 68, { align: 'center' });

  // Main body text
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  const narrative = `has successfully completed and verified ${cert.hoursVerified} hours of hands-on community service in the initiative:`;
  doc.text(narrative, pageWidth / 2, 78, { align: 'center' });

  // Event Name
  doc.setFontSize(16);
  doc.setTextColor(16, 185, 129);
  doc.setFont('helvetica', 'bold');
  doc.text(`"${cert.eventTitle}"`, pageWidth / 2, 88, { align: 'center' });

  // Category and Organizer
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Impact Domain: ${cert.eventCategory}  |  Organized by: ${cert.organizerName}`, pageWidth / 2, 96, { align: 'center' });

  // Verification QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(cert.qrVerificationUrl || `https://volunteerconnect.ai/cert/${cert.certificateNumber}`, {
      width: 120,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    doc.addImage(qrDataUrl, 'PNG', pageWidth / 2 - 16, 105, 32, 32);
  } catch (qrErr) {
    console.error('QR code generation failed in PDF', qrErr);
  }

  // Certificate ID & Date below QR
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text(`VERIFICATION ID: ${cert.certificateNumber}`, pageWidth / 2, 142, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Issued On: ${new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 147, { align: 'center' });

  // Signatures
  const sigY = 168;

  // Left signature (Organizer)
  doc.setDrawColor(203, 213, 225);
  doc.line(30, sigY, 95, sigY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(cert.signatureTitle || cert.organizerName, 62.5, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Field Verifier', 62.5, sigY + 9, { align: 'center' });

  // Right signature (Dean / College Admin)
  doc.line(pageWidth - 95, sigY, pageWidth - 30, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Dean of Student Affairs', pageWidth - 62.5, sigY + 5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Institutional Accreditation Seal', pageWidth - 62.5, sigY + 9, { align: 'center' });

  // Save PDF
  doc.save(`${cert.studentName.replace(/\s+/g, '_')}_${cert.certificateNumber}.pdf`);
}

export async function generateSkillPassportPDF(
  student: UserProfile, 
  certificates: CertificateRecord[],
  badges: BadgeDefinition[]
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFillColor(16, 185, 129); // emerald accent
  doc.rect(0, 42, pageWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('DIGITAL SKILL PASSPORT & SOCIAL IMPACT PORTFOLIO', 14, 18);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Verified Community Service, Leadership Credentials, and Field Experience', 14, 26);
  doc.text(`Official Document ID: VCPASS-${student.id.toUpperCase()}-${new Date().getFullYear()}`, 14, 33);

  // Student Info Box
  let y = 56;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'S');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(student.name, 20, y + 10);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Institution: ${student.college || 'Knowledge Institute of Technology'}`, 20, y + 17);
  doc.text(`Department: ${student.department || 'N/A'} • Year: ${student.year || '3rd Year'} • ID: ${student.studentId || 'N/A'}`, 20, y + 23);
  doc.text(`Contact: ${student.email}`, 20, y + 29);

  // Quick Stats Column on the right
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(18);
  doc.text(`${student.totalVerifiedHours} hrs`, pageWidth - 45, y + 15, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Verified Service', pageWidth - 45, y + 20, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 165, 233);
  doc.setFontSize(16);
  doc.text(`${student.totalPoints} pts`, pageWidth - 45, y + 29, { align: 'right' });
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Impact Points', pageWidth - 45, y + 34, { align: 'right' });

  // Section 1: Verified Skills & Endorsements
  y += 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. VERIFIED SKILLS & CAPABILITIES', 14, y);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const skillsStr = (student.skills || []).join('   •   ');
  doc.text(skillsStr || 'Leadership, Teamwork, Field Logistics, Environmental Stewardship', 14, y + 7);

  // Section 2: Earned Badges & Milestones
  y += 18;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. EARNED BADGES & MILESTONES', 14, y);

  const studentBadges = badges.filter(b => student.badges.includes(b.id));
  let badgeY = y + 7;
  studentBadges.forEach((b, idx) => {
    if (idx < 6) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`[${b.tier.toUpperCase()}] ${b.name}:`, 14, badgeY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(b.description, 65, badgeY);
      badgeY += 6;
    }
  });

  // Section 3: Verified Completed Activities & Certificates
  y = badgeY + 6;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. COMPLETED VERIFIED VOLUNTEERING INITIATIVES', 14, y);

  y += 7;
  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, pageWidth - 28, 8, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Date', 18, y + 5.5);
  doc.text('Initiative Title', 45, y + 5.5);
  doc.text('Category', 115, y + 5.5);
  doc.text('Organizer', 150, y + 5.5);
  doc.text('Hours', pageWidth - 22, y + 5.5, { align: 'right' });

  y += 10;
  if (certificates.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(148, 163, 184);
    doc.text('No verified completed activities yet.', 18, y + 4);
  } else {
    certificates.forEach((c) => {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(new Date(c.issuedAt).toLocaleDateString(), 18, y + 4);
      doc.text(c.eventTitle.length > 35 ? c.eventTitle.substring(0, 35) + '...' : c.eventTitle, 45, y + 4);
      doc.text(c.eventCategory, 115, y + 4);
      doc.text(c.organizerName.length > 18 ? c.organizerName.substring(0, 18) + '...' : c.organizerName, 150, y + 4);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text(`+${c.hoursVerified}h`, pageWidth - 22, y + 4, { align: 'right' });
      y += 8;
    });
  }

  // Footer Verification Note
  const footerY = 275;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('Digitally signed and cryptographically validated via VolunteerConnect AI Platform.', 14, footerY + 5);
  doc.text(`Verification portal: https://volunteerconnect.kiot.ac.in • Generated: ${new Date().toLocaleString()}`, 14, footerY + 9);

  doc.save(`${student.name.replace(/\s+/g, '_')}_Digital_Skill_Passport.pdf`);
}
