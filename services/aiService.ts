import { UserProfile, VolunteerEvent, AIMatchResult, EmergencyRequest, ImpactSummary } from '../types';

export async function fetchAIMatches(
  studentProfile: UserProfile, 
  availableEvents: VolunteerEvent[],
  preferredCategory?: string
): Promise<AIMatchResult[]> {
  try {
    const res = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentProfile,
        availableEvents,
        preferredCategory,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: Failed to get AI recommendations`);
    }

    const data = await res.json();
    return data.matches || [];
  } catch (err) {
    console.warn('AI match fetch error, using local fallback:', err);
    // Client-side fallback matching
    const studentInterests = (studentProfile.interests || []).map(i => i.toLowerCase());
    const studentSkills = (studentProfile.skills || []).map(s => s.toLowerCase());

    return availableEvents.map(evt => {
      let score = 60;
      const matched: string[] = [];
      evt.skillsRequired.forEach(req => {
        if (studentSkills.some(s => s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))) {
          score += 10;
          matched.push(req);
        }
      });
      if (studentInterests.some(i => evt.category.toLowerCase().includes(i) || i.includes(evt.category.toLowerCase()))) {
        score += 15;
      }
      if (preferredCategory && preferredCategory !== 'All' && evt.category === preferredCategory) {
        score += 15;
      }
      score = Math.min(97, Math.max(40, score));

      return {
        eventId: evt.id,
        matchScore: score,
        matchReason: `Matched based on your declared interest in ${evt.category} and your skills in ${matched.length > 0 ? matched.join(', ') : 'community development'}.`,
        highlightedSkills: matched.length > 0 ? matched : evt.skillsRequired.slice(0, 2),
        recommendedRole: `${evt.category} Volunteer`,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }
}

export async function sendAIChatMessage(
  message: string,
  history: { role: 'user' | 'model'; parts: string }[],
  context: {
    user: UserProfile;
    events: VolunteerEvent[];
    emergencyRequests: EmergencyRequest[];
  }
): Promise<string> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        history,
        context,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.reply || 'Here to assist you with volunteering!';
  } catch (err) {
    console.warn('Chat request failed:', err);
    return `VolunteerBot note: I noticed you asked: "${message}". You can browse all active volunteering opportunities in the Events tab, track your verified hours on your Profile, or check active urgent crisis drives!`;
  }
}

export async function fetchAIImpactAnalysis(
  impactSummary: ImpactSummary,
  eventList: VolunteerEvent[]
): Promise<string> {
  try {
    const res = await fetch('/api/ai/impact-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        impactSummary,
        eventList,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.analysis;
  } catch (err) {
    return `VolunteerConnect initiatives have generated verified community outcomes across forestry, hunger relief, and educational mentorship, advancing UN SDGs 2, 4, 11, and 13. Expanding multi-student teams will drive sustainable regional growth.`;
  }
}
