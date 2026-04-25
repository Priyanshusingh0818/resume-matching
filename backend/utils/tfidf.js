const STOP_WORDS = new Set([
  'a','an','the','and','or','but','in','on','at','to','for','of','with','by',
  'from','is','are','was','were','be','been','being','have','has','had','do',
  'does','did','will','would','shall','should','may','might','can','could',
  'this','that','these','those','i','me','my','we','our','you','your','he',
  'him','his','she','her','it','its','they','them','their','what','which',
  'who','whom','when','where','why','how','all','each','every','both','few',
  'more','most','other','some','such','no','not','only','same','so','than',
  'too','very','just','about','above','after','again','also','as','because',
  'before','between','during','if','into','through','under','up','out','then',
]);

function stem(word) {
  // Lightweight suffix stripping (Porter-like for common English suffixes)
  word = word.toLowerCase().replace(/[^a-z0-9+#.]/g, '');
  if (word.length < 4) return word;
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('tion') && word.length > 5) return word.slice(0, -4);
  if (word.endsWith('ment') && word.length > 5) return word.slice(0, -4);
  if (word.endsWith('ness') && word.length > 5) return word.slice(0, -4);
  if (word.endsWith('able') && word.length > 5) return word.slice(0, -4);
  if (word.endsWith('ous') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ful') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ly') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('er') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
}

export function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w))
    .map(stem);
}

export function computeTF(tokens) {
  const tf = {};
  const total = tokens.length || 1;
  for (const token of tokens) {
    tf[token] = (tf[token] || 0) + 1;
  }
  for (const key of Object.keys(tf)) {
    tf[key] = tf[key] / total;
  }
  return tf;
}

export function computeIDF(documents) {
  const idf = {};
  const N = documents.length || 1;
  const docFreq = {};

  for (const doc of documents) {
    const uniqueTokens = new Set(doc);
    for (const token of uniqueTokens) {
      docFreq[token] = (docFreq[token] || 0) + 1;
    }
  }

  for (const [token, freq] of Object.entries(docFreq)) {
    idf[token] = Math.log((N + 1) / (freq + 1)) + 1;
  }

  return idf;
}

export function computeTFIDF(tf, idf) {
  const tfidf = {};
  for (const [token, tfVal] of Object.entries(tf)) {
    tfidf[token] = tfVal * (idf[token] || 1);
  }
  return tfidf;
}

export function cosineSimilarity(vecA, vecB) {
  const allKeys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const key of allKeys) {
    const a = vecA[key] || 0;
    const b = vecB[key] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

export function jaccardSimilarity(setA, setB) {
  if (setA.length === 0 && setB.length === 0) return 1;
  const a = new Set(setA.map(s => s.toLowerCase()));
  const b = new Set(setB.map(s => s.toLowerCase()));
  const intersection = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}
