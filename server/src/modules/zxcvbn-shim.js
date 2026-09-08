const COMMON_PASSWORDS = new Set([
  'password', 'password1', '123456', '12345678', '123456789', '1234567890',
  'qwerty', 'qwerty123', 'abc123', 'letmein', 'admin', 'admin123', 'welcome',
  'iloveyou', 'monkey', 'dragon', 'football', 'baseball', 'whatever',
  'trustno1', 'sunshine', 'master', 'hello', 'charlie', 'aa123456',
  'donald', 'password123', 'qazwsx', 'asdfgh', 'zxcvbn', 'p@ssw0rd',
]);

const COMMON_NAMES = new Set([
  'john', 'mike', 'robert', 'james', 'david', 'steve', 'paul', 'mark',
  'alex', 'daniel', 'sarah', 'jessica', 'emma', 'laura', 'anna', 'andy',
  'jack', 'mary', 'kerri', 'nicole', 'sharon', 'michelle', 'karen', 'amy',
]);

function bruteForceScore(password) {
  let lower = /[a-z]/.test(password);
  let upper = /[A-Z]/.test(password);
  let digits = /[0-9]/.test(password);
  let symbols = /[^A-Za-z0-9]/.test(password);

  const pool = (lower ? 26 : 0) + (upper ? 26 : 0) + (digits ? 10 : 0) + (symbols ? 32 : 0) + 1;
  const entropy = Math.log2(pool) * password.length;
  return { score: Math.min(4, Math.max(0, Math.floor(entropy / 22))), entropy };
}

function zxcvbn(password) {
  const lower = password.toLowerCase();
  
  if (!password) {
    return { score: 0, crack_times_display: { offline_slow_hashing_1e4_per_second: 'instant' }, crack_times_seconds: { offline_slow_hashing_1e4_per_second: 0 }, sequence: [] };
  }

  const brute = bruteForceScore(password);
  const sequence = [];
  let score = brute.score;

  if (COMMON_PASSWORDS.has(lower)) {
    score = 0;
    sequence.push({ pattern: 'dictionary', token: password, matchedWord: lower });
  }

  for (const name of COMMON_NAMES) {
    if (lower.includes(name)) {
      score = Math.min(score, 1);
      sequence.push({ pattern: 'dictionary', token: name, matchedWord: name });
      break;
    }
  }

  if (/^\d+$/.test(password)) {
    score = Math.min(score, 1);
    sequence.push({ pattern: 'bruteforce', token: password });
  }

  const dateMatch = password.match(/(19|20)\d{2}/);
  if (dateMatch) {
    score = Math.min(score, 1 + (score > 1 ? 1 : 0));
    sequence.push({ pattern: 'date', token: dateMatch[0] });
  }

  for (const seq of ['abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890']) {
    for (let i = 0; i < seq.length; i++) {
      for (let j = i + 3; j <= seq.length; j++) {
        if (lower.includes(seq.slice(i, j))) {
          score = Math.min(score, Math.max(0, 3 - Math.floor((j - i) / 4)));
          sequence.push({ pattern: 'sequence', token: seq.slice(i, j) });
          i = j;
          break;
        }
      }
    }
  }

  if (/(.)\1{2,}/.test(password)) {
    score = Math.min(score, 2);
    sequence.push({ pattern: 'repeat', token: password.match(/(.)\1{2,}/)[0] });
  }

  const crackSec = Math.pow(10, (score + 3) * 2.2);
  const display = crackSec < 1 ? 'instant' : crackSec < 60 ? `${Math.round(crackSec)} seconds` : crackSec < 3600 ? `${Math.round(crackSec / 60)} minutes` : crackSec < 86400 ? `${Math.round(crackSec / 3600)} hours` : crackSec < 31536000 ? `${Math.round(crackSec / 86400)} days` : crackSec < 315360000 ? `${Math.round(crackSec / 31536000)} years` : 'centuries';

  return {
    score,
    sequence,
    crack_times_seconds: { offline_slow_hashing_1e4_per_second: crackSec },
    crack_times_display: { offline_slow_hashing_1e4_per_second: display },
  };
}

export { zxcvbn };