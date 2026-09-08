const platforms = [
  { name: 'GitHub', url: (u) => `https://github.com/${u}`, check: 'html', icon: 'github' },
  { name: 'Twitter', url: (u) => `https://x.com/${u}`, check: 'html', icon: 'twitter' },
  { name: 'Instagram', url: (u) => `https://instagram.com/${u}`, check: 'html', icon: 'instagram' },
  { name: 'Reddit', url: (u) => `https://reddit.com/user/${u}`, check: 'html', icon: 'reddit' },
  { name: 'LinkedIn', url: (u) => `https://linkedin.com/in/${u}`, check: 'html', icon: 'linkedin' },
  { name: 'YouTube', url: (u) => `https://youtube.com/@${u}`, check: 'html', icon: 'youtube' },
  { name: 'TikTok', url: (u) => `https://tiktok.com/@${u}`, check: 'html', icon: 'tiktok' },
  { name: 'Pinterest', url: (u) => `https://pinterest.com/${u}`, check: 'html', icon: 'pinterest' },
  { name: 'Medium', url: (u) => `https://medium.com/@${u}`, check: 'html', icon: 'medium' },
  { name: 'Keybase', url: (u) => `https://keybase.io/${u}`, check: 'html', icon: 'keybase' },
  { name: 'Dev.to', url: (u) => `https://dev.to/${u}`, check: 'html', icon: 'devto' },
  { name: 'HackerOne', url: (u) => `https://hackerone.com/${u}`, check: 'html', icon: 'hackerone' },
  { name: 'GitLab', url: (u) => `https://gitlab.com/${u}`, check: 'html', icon: 'gitlab' },
  { name: 'Twitch', url: (u) => `https://twitch.tv/${u}`, check: 'html', icon: 'twitch' },
  { name: 'Spotify', url: (u) => `https://open.spotify.com/user/${u}`, check: 'html', icon: 'spotify' },
  { name: 'Steam', url: (u) => `https://steamcommunity.com/id/${u}`, check: 'html', icon: 'steam' },
  { name: 'About.me', url: (u) => `https://about.me/${u}`, check: 'html', icon: 'aboutme' },
  { name: 'Behance', url: (u) => `https://behance.net/${u}`, check: 'html', icon: 'behance' },
  { name: 'Dribbble', url: (u) => `https://dribbble.com/${u}`, check: 'html', icon: 'dribbble' },
  { name: 'Flickr', url: (u) => `https://flickr.com/people/${u}`, check: 'html', icon: 'flickr' },
  { name: 'Gravatar', url: (u) => `https://en.gravatar.com/${u}`, check: 'html', icon: 'gravatar' },
  { name: 'Replit', url: (u) => `https://replit.com/@${u}`, check: 'html', icon: 'replit' },
  { name: 'HackerRank', url: (u) => `https://hackerrank.com/${u}`, check: 'html', icon: 'hackerrank' },
  { name: 'LeetCode', url: (u) => `https://leetcode.com/${u}`, check: 'html', icon: 'leetcode' },
];

async function checkPlatform(username, platform) {
  try {
    const res = await fetch(platform.url(username), {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });
    return {
      platform: platform.name,
      url: platform.url(username),
      found: res.status === 200,
      status: res.status,
      icon: platform.icon,
    };
  } catch {
    return { platform: platform.name, url: platform.url(username), found: false, status: 0, icon: platform.icon };
  }
}

export async function investigateUsername(username) {
  const results = await Promise.allSettled(
    platforms.map(p => checkPlatform(username, p))
  );

  const found = results.filter(r => r.status === 'fulfilled' && r.value.found).map(r => r.value);
  const notFound = results.filter(r => r.status === 'fulfilled' && !r.value.found).map(r => r.value);
  const errors = results.filter(r => r.status === 'rejected').length;

  return {
    module: 'username',
    target: username,
    summary: {
      totalChecked: platforms.length,
      found: found.length,
      notFound: notFound.length,
      errors,
    },
    profiles: found,
    notFound: notFound.map(n => n.platform),
    riskIndicators: [
      ...(found.length > 5 ? ['High digital footprint - found on ' + found.length + ' platforms'] : []),
      ...(found.some(f => ['HackerOne', 'Keybase'].includes(f.platform)) ? ['Security/community presence detected'] : []),
    ],
    timestamp: new Date().toISOString(),
  };
}
