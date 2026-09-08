import { zxcvbn } from './zxcvbn-shim.js';

export function checkPassword(password) {
  const result = zxcvbn(password);
  const entropy = calculateEntropy(password);
  const length = password.length;

  const strengthMap = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colorMap = ['#f43f5e', '#f59e0b', '#fbbf24', '#84cc16', '#22c55e'];

  const issues = [];
  if (length < 8) issues.push('Too short - use at least 8 characters');
  if (!/[A-Z]/.test(password)) issues.push('Missing uppercase letters');
  if (!/[a-z]/.test(password)) issues.push('Missing lowercase letters');
  if (!/[0-9]/.test(password)) issues.push('Missing numbers');
  if (!/[^A-Za-z0-9]/.test(password)) issues.push('Missing special characters');
  if (/(.)\1{2,}/.test(password)) issues.push('Contains repeated characters');
  if (/^(password|123456|qwerty|admin|letmein|12345|12345678|password1)$/i.test(password)) issues.push('Commonly used password');
  if (result.sequence && result.sequence.length > 2 && result.sequence.some(s => s.pattern === 'sequence')) issues.push('Contains keyboard/number sequences');

  return {
    module: 'password',
    score: result.score,
    label: strengthMap[result.score],
    color: colorMap[result.score],
    entropy: {
      bits: entropy.bits,
      crackTimeSec: result.crack_times_seconds ? result.crack_times_seconds.offline_slow_hashing_1e4_per_second : 0,
      crackTimeDisplay: result.crack_times_display ? result.crack_times_display.offline_slow_hashing_1e4_per_second : 'instant',
    },
    length,
    issues,
    patterns: (result.sequence || []).filter(s => s.pattern !== 'bruteforce').map(s => ({
      pattern: s.pattern,
      matchedToken: s.token,
    })),
    timestamp: new Date().toISOString(),
  };
}

function calculateEntropy(password) {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^A-Za-z0-9]/.test(password)) pool += 32;
  const bits = password.length * Math.log2(Math.max(pool, 1));
  const possibleCombin = Math.pow(pool, password.length);
  const crackTimeSec = possibleCombin / 1e10;
  return { bits, crackTimeSec };
}