// Canonical skill name mapping — normalizes abbreviations and variants
const SKILL_ALIASES = {
  'js': 'javascript', 'javascript': 'javascript',
  'ts': 'typescript', 'typescript': 'typescript',
  'py': 'python', 'python': 'python',
  'node': 'node.js', 'nodejs': 'node.js', 'node.js': 'node.js',
  'react': 'react', 'reactjs': 'react', 'react.js': 'react',
  'vue': 'vue.js', 'vuejs': 'vue.js', 'vue.js': 'vue.js',
  'angular': 'angular', 'angularjs': 'angular',
  'next': 'next.js', 'nextjs': 'next.js', 'next.js': 'next.js',
  'express': 'express.js', 'expressjs': 'express.js', 'express.js': 'express.js',
  'mongo': 'mongodb', 'mongodb': 'mongodb',
  'postgres': 'postgresql', 'postgresql': 'postgresql', 'psql': 'postgresql',
  'mysql': 'mysql', 'sql': 'sql',
  'aws': 'aws', 'amazon web services': 'aws',
  'gcp': 'google cloud', 'google cloud': 'google cloud', 'google cloud platform': 'google cloud',
  'azure': 'azure', 'microsoft azure': 'azure',
  'docker': 'docker', 'k8s': 'kubernetes', 'kubernetes': 'kubernetes',
  'ci/cd': 'ci/cd', 'cicd': 'ci/cd',
  'git': 'git', 'github': 'github', 'gitlab': 'gitlab',
  'html': 'html', 'html5': 'html',
  'css': 'css', 'css3': 'css',
  'sass': 'sass', 'scss': 'sass',
  'tailwind': 'tailwindcss', 'tailwindcss': 'tailwindcss',
  'bootstrap': 'bootstrap',
  'graphql': 'graphql',
  'rest': 'rest api', 'restful': 'rest api', 'rest api': 'rest api',
  'ml': 'machine learning', 'machine learning': 'machine learning',
  'ai': 'artificial intelligence', 'artificial intelligence': 'artificial intelligence',
  'dl': 'deep learning', 'deep learning': 'deep learning',
  'nlp': 'natural language processing', 'natural language processing': 'natural language processing',
  'c++': 'c++', 'cpp': 'c++',
  'c#': 'c#', 'csharp': 'c#',
  'java': 'java', 'kotlin': 'kotlin', 'swift': 'swift',
  'go': 'go', 'golang': 'go',
  'rust': 'rust', 'ruby': 'ruby',
  'php': 'php', 'laravel': 'laravel',
  'django': 'django', 'flask': 'flask', 'fastapi': 'fastapi',
  'spring': 'spring', 'spring boot': 'spring boot',
  'redis': 'redis', 'elasticsearch': 'elasticsearch',
  'kafka': 'kafka', 'rabbitmq': 'rabbitmq',
  'terraform': 'terraform', 'ansible': 'ansible',
  'jenkins': 'jenkins', 'nginx': 'nginx',
  'linux': 'linux', 'unix': 'unix',
  'agile': 'agile', 'scrum': 'scrum',
  'jira': 'jira', 'figma': 'figma',
  'tensorflow': 'tensorflow', 'pytorch': 'pytorch',
  'pandas': 'pandas', 'numpy': 'numpy',
  'r': 'r', 'matlab': 'matlab', 'tableau': 'tableau', 'power bi': 'power bi',
};

// Categorize skills for weighted scoring
const SKILL_CATEGORIES = {
  hard: new Set([
    'javascript','typescript','python','java','c++','c#','go','rust','ruby','php',
    'kotlin','swift','r','matlab','sql',
  ]),
  framework: new Set([
    'react','vue.js','angular','next.js','express.js','django','flask','fastapi',
    'spring','spring boot','laravel','node.js','tailwindcss','bootstrap',
  ]),
  tool: new Set([
    'docker','kubernetes','aws','azure','google cloud','git','github','gitlab',
    'jenkins','terraform','ansible','redis','elasticsearch','kafka','rabbitmq',
    'nginx','linux','jira','figma','ci/cd','mongodb','postgresql','mysql',
    'graphql','rest api','tableau','power bi',
  ]),
  soft: new Set([
    'agile','scrum','leadership','communication','teamwork','problem solving',
    'project management','critical thinking','time management',
  ]),
};

export function normalizeSkill(skill) {
  if (!skill || typeof skill !== 'string') return '';
  const lower = skill.toLowerCase().trim();
  return SKILL_ALIASES[lower] || lower;
}

export function normalizeSkills(skills) {
  if (!Array.isArray(skills)) return [];
  return [...new Set(skills.map(normalizeSkill).filter(Boolean))];
}

export function categorizeSkill(normalizedSkill) {
  for (const [category, skillSet] of Object.entries(SKILL_CATEGORIES)) {
    if (skillSet.has(normalizedSkill)) return category;
  }
  return 'tool'; // Default to tool category
}

export function cleanResumeText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  return rawText
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable chars
    .trim();
}

export function extractYearsOfExperience(text) {
  if (!text) return 0;
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience|exp)/gi,
    /(?:experience|exp)\s*[:.]?\s*(\d+)\+?\s*(?:years?|yrs?)/gi,
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:in\s+(?:the\s+)?(?:industry|field|sector))/gi,
  ];

  let maxYears = 0;
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const years = parseInt(match[1], 10);
      if (years > 0 && years < 50) {
        maxYears = Math.max(maxYears, years);
      }
    }
  }
  return maxYears;
}

export function detectResumeSections(text) {
  const lower = text.toLowerCase();
  return {
    hasContact: /(?:email|phone|tel|mobile|address|linkedin|github)/i.test(lower),
    hasSummary: /(?:summary|objective|profile|about\s*me)/i.test(lower),
    hasExperience: /(?:experience|employment|work\s*history|professional)/i.test(lower),
    hasEducation: /(?:education|academic|university|college|degree|school)/i.test(lower),
    hasSkills: /(?:skills|technologies|tech\s*stack|competencies|proficiencies)/i.test(lower),
    hasCertifications: /(?:certif|licens|credential|award)/i.test(lower),
    hasProjects: /(?:project|portfolio)/i.test(lower),
  };
}

export function countActionVerbs(text) {
  const actionVerbs = [
    'developed','built','designed','implemented','created','managed','led',
    'optimized','deployed','architected','automated','delivered','maintained',
    'improved','increased','reduced','launched','established','coordinated',
    'analyzed','integrated','engineered','configured','administered','resolved',
    'streamlined','mentored','collaborated','contributed','executed','migrated',
  ];
  const lower = text.toLowerCase();
  let count = 0;
  for (const verb of actionVerbs) {
    const regex = new RegExp(`\\b${verb}\\b`, 'g');
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

export function extractDegreeLevel(educationText) {
  if (!educationText) return 0;
  const lower = educationText.toLowerCase();
  if (/\bph\.?d\b|\bdoctor/i.test(lower)) return 4;
  if (/\bmaster|\bm\.?s\.?\b|\bm\.?a\.?\b|\bm\.?tech\b|\bm\.?eng\b|\bmba\b/i.test(lower)) return 3;
  if (/\bbachelor|\bb\.?s\.?\b|\bb\.?a\.?\b|\bb\.?tech\b|\bb\.?eng\b|\bundergrad/i.test(lower)) return 2;
  if (/\bassociate|\ba\.?s\.?\b|\bdiploma/i.test(lower)) return 1;
  return 0;
}
