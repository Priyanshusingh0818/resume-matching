import db from '../db.js';

export function computeUserAnalytics(userId) {
  const jobsRow = db.prepare('SELECT COUNT(*) as cnt FROM jobs').get();
  const totalJobs = jobsRow.cnt;

  const matchCntRow = db.prepare('SELECT COUNT(*) as cnt FROM matches WHERE user_id = ?').get(userId);
  const jobsMatched = matchCntRow.cnt;

  const matchAvgRow = db.prepare('SELECT AVG(score) as avg FROM matches WHERE user_id = ? AND score > 0').get(userId);
  const averageScore = matchAvgRow.avg ? Math.round(matchAvgRow.avg) : 0;

  const resumeRow = db.prepare('SELECT score FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
  const resumeScore = resumeRow ? Math.round(resumeRow.score) : 0;

  // Real skill gap: find skills that appear in matched jobs but are missing from the user's resume
  const skillGap = computeSkillGap(userId);

  // Score breakdown averages
  const breakdownRow = db.prepare(`
    SELECT AVG(skills_score) as avg_skills, AVG(experience_score) as avg_exp,
           AVG(education_score) as avg_edu, AVG(keyword_score) as avg_kw,
           AVG(quality_score) as avg_qual
    FROM matches WHERE user_id = ? AND score > 0
  `).get(userId);

  const scoreBreakdown = {
    skills: Math.round(breakdownRow?.avg_skills || 0),
    experience: Math.round(breakdownRow?.avg_exp || 0),
    education: Math.round(breakdownRow?.avg_edu || 0),
    keywords: Math.round(breakdownRow?.avg_kw || 0),
    quality: Math.round(breakdownRow?.avg_qual || 0),
  };

  // Top matched jobs with scores
  const topMatches = db.prepare(`
    SELECT m.score, m.skills_score, m.experience_score, j.title, j.company
    FROM matches m JOIN jobs j ON m.job_id = j.id
    WHERE m.user_id = ? ORDER BY m.score DESC LIMIT 5
  `).all(userId);

  const jobRoleData = topMatches.map(job => ({
    role: job.title,
    score: Math.round(job.score),
    company: job.company,
    color: job.score >= 80 ? '#10B981' : job.score >= 60 ? '#6366F1' : '#F59E0B',
  }));

  return {
    totalJobs,
    jobsMatched,
    averageScore,
    resumeScore,
    skillGap,
    scoreBreakdown,
    jobRoleData,
  };
}

export function computeSkillGap(userId) {
  // Get user's resume skills
  const resumeRow = db.prepare('SELECT content FROM resumes WHERE user_id = ? ORDER BY created_at DESC LIMIT 1').get(userId);
  let userSkills = [];
  if (resumeRow) {
    try {
      const parsed = JSON.parse(resumeRow.content || '{}');
      userSkills = (parsed.skills || []).map(s => s.toLowerCase());
    } catch {}
  }

  // Get all skills from matched jobs
  const matchedJobs = db.prepare(`
    SELECT j.skills FROM matches m JOIN jobs j ON m.job_id = j.id WHERE m.user_id = ?
  `).all(userId);

  const skillDemand = {};
  for (const job of matchedJobs) {
    let jobSkills = [];
    try { jobSkills = JSON.parse(job.skills); } catch {}
    if (!Array.isArray(jobSkills)) continue;

    for (const skill of jobSkills) {
      const lower = skill.toLowerCase();
      if (!userSkills.includes(lower)) {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      }
    }
  }

  // Return top missing skills sorted by demand
  return Object.entries(skillDemand)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));
}

export function computeAdminAnalytics() {
  const jobsRow = db.prepare('SELECT COUNT(*) as cnt FROM jobs').get();
  const totalJobsPosted = jobsRow.cnt;

  const resumesRow = db.prepare('SELECT COUNT(*) as cnt FROM resumes').get();
  const totalResumes = resumesRow.cnt;

  const matchAvgRow = db.prepare('SELECT AVG(score) as avg FROM matches WHERE score > 0').get();
  const avgMatchScore = matchAvgRow.avg ? Math.round(matchAvgRow.avg) : 0;

  const studentsRow = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'").get();
  const activeStudents = studentsRow.cnt;

  // Real job demand data: count jobs by title category
  const jobsAll = db.prepare('SELECT title, skills FROM jobs').all();
  const titleCounts = {};
  for (const job of jobsAll) {
    // Use full title for clarity, not just first word
    const key = job.title.length > 30 ? job.title.substring(0, 30) + '…' : job.title;
    titleCounts[key] = (titleCounts[key] || 0) + 1;
  }
  const jobDemandData = Object.entries(titleCounts)
    .map(([skill, demand]) => ({ skill, demand }))
    .sort((a, b) => b.demand - a.demand)
    .slice(0, 8);

  // Real missing skills: aggregate across all matches
  const allMatchedJobs = db.prepare(`
    SELECT j.skills, r.content as resume_content
    FROM matches m
    JOIN jobs j ON m.job_id = j.id
    JOIN resumes r ON m.user_id = r.user_id
    WHERE m.score > 0
  `).all();

  const globalSkillGap = {};
  for (const row of allMatchedJobs) {
    let jobSkills = [];
    try { jobSkills = JSON.parse(row.skills); } catch {}
    if (!Array.isArray(jobSkills)) continue;

    let userSkills = [];
    try {
      const parsed = JSON.parse(row.resume_content || '{}');
      userSkills = (parsed.skills || []).map(s => s.toLowerCase());
    } catch {}

    for (const skill of jobSkills) {
      if (!userSkills.includes(skill.toLowerCase())) {
        globalSkillGap[skill] = (globalSkillGap[skill] || 0) + 1;
      }
    }
  }

  const missingSkillsData = Object.entries(globalSkillGap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Quality distribution from real match scores
  const qDataRow = db.prepare('SELECT score FROM matches WHERE score > 0').all();
  const ranges = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '50-59': 0, 'Below 50': 0 };
  for (const m of qDataRow) {
    if (m.score >= 90) ranges['90-100']++;
    else if (m.score >= 80) ranges['80-89']++;
    else if (m.score >= 70) ranges['70-79']++;
    else if (m.score >= 60) ranges['60-69']++;
    else if (m.score >= 50) ranges['50-59']++;
    else ranges['Below 50']++;
  }
  const qualityColors = { '90-100': '#10B981', '80-89': '#6366F1', '70-79': '#8B5CF6', '60-69': '#F59E0B', '50-59': '#F97316', 'Below 50': '#EF4444' };
  const qualityData = Object.entries(ranges)
    .filter(([, v]) => v > 0)
    .map(([range, value]) => ({ range, value, color: qualityColors[range] }));

  if (qualityData.length === 0) qualityData.push({ range: 'No Data', value: 1, color: '#475569' });

  // Recent candidates
  const recentCandidates = db.prepare(`
    SELECT m.id as match_id, u.name, j.title as role, m.score,
           m.skills_score, m.experience_score, m.status, p.education
    FROM matches m
    JOIN users u ON m.user_id = u.id
    JOIN jobs j ON m.job_id = j.id
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE m.is_applied = 1
    ORDER BY m.created_at DESC LIMIT 10
  `).all();

  const formattedCandidates = recentCandidates.map(c => {
    let university = 'Not specified';
    try {
      const eduArray = JSON.parse(c.education || '[]');
      if (eduArray.length > 0 && eduArray[0].school) university = eduArray[0].school;
    } catch {}
    return {
      id: c.match_id,
      name: c.name,
      role: c.role,
      score: Math.round(c.score),
      skillsScore: Math.round(c.skills_score || 0),
      experienceScore: Math.round(c.experience_score || 0),
      status: c.status || 'Pending',
      university,
    };
  });

  return {
    totalJobsPosted,
    totalResumes,
    avgMatchScore,
    activeStudents,
    jobDemandData: jobDemandData.length > 0 ? jobDemandData : [{ skill: 'No jobs posted', demand: 0 }],
    qualityData,
    missingSkillsData,
    recentCandidates: formattedCandidates,
  };
}

export function logAnalyticsEvent(userId, eventType, data = {}) {
  try {
    db.prepare('INSERT INTO analytics_logs (user_id, event_type, data) VALUES (?, ?, ?)').run(
      userId, eventType, JSON.stringify(data)
    );
  } catch (err) {
    console.error('[analyticsService] Failed to log event:', err.message);
  }
}
