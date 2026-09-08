export async function investigateWiFi(bssid) {
  const cleanBssid = bssid.replace(/[:\-\s.]/g, '').toUpperCase();
  
  if (!/^[0-9A-F]{12}$/.test(cleanBssid)) {
    return { module: 'wifi', target: bssid, error: 'Invalid BSSID format. Expected MAC address (e.g., 5C:51:88:1A:2B:3C)' };
  }

  const oui = {
    '5C5188': 'Ruckus Wireless',
    '001A2B': 'Cisco-Linksys',
    '0016B6': 'Apple',
    'F0B4B6': 'Ubiquiti Networks',
    'B0C745': 'Netgear',
    '00B32B': 'Atheros',
    '0011BF': 'Huawei',
    '0473DF': 'Broadcom',
    'D4CA6D': 'Zultys Technologies',
    '5067F0': 'Asustek Computer',
    '78CA39': 'Arcadyan Technology',
    '48EE0C': 'Intel',
    'DCA4CA': 'Kyocera',
    '0022EF': 'Murata Manufacturing',
    '002241': 'HTC',
    '001F3C': 'Samsung Electronics',
    '001E00': 'Ralink Technology',
    '001D0F': 'Samsung Electronics',
    '4419B6': 'Samsung Electronics',
    '48829E': 'AzureWave Technology',
  };

  const vendor = oui[cleanBssid.slice(0, 6)];
  const isPrivate = cleanBssid.slice(0, 2) === '02' || ['F', 'E', 'D', 'C', 'B', 'A'].includes(cleanBssid[0]);

  return {
    module: 'wifi',
    target: bssid,
    formatted: cleanBssid.replace(/(.{2})(?=.)/g, '$1:'),
    vendor: vendor || 'Unknown/Vendor not in registry',
    vendorKnown: !!vendor,
    locallyAdministered: isPrivate,
    multinational: cleanBssid.slice(0, 6) === '020000',
    macAnalysis: {
      oui: cleanBssid.slice(0, 6),
      nic: cleanBssid.slice(6),
      broadcastCapable: cleanBssid === 'FFFFFFFFFFFF',
      multicastCapable: (parseInt(cleanBssid[1], 16) & 1) === 1,
    },
    recommendations: [
      isPrivate ? 'This address uses a locally administered value - typical of virtual routers, MAC randomization, or privacy mode. Tracking reliability is LOW.' : 'Standard globally unique MAC range. Consider privacy implications.',
      vendor ? `Device manufactured by ${vendor}. Cross-reference this vendor against device category hotspots.` : 'Vendor could not be determined from the local OUI registry - consider global OUI lookup.',
      'Check for MAC randomisation (iOS private address / Android MAC randomisation) which invalidates physical tracking.',
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function investigateSSID(ssid) {
  const known = {
    'xfinitywifi': { type: 'hotspot', vendor: 'Comcast', risk: 'open' },
    'attwifi': { type: 'hotspot', vendor: 'AT&T', risk: 'open' },
    'Starbucks WiFi': { type: 'captive', vendor: 'Starbucks', risk: 'open' },
    'McDonalds Free WiFi': { type: 'captive', vendor: 'McDonald\'s', risk: 'open' },
    'Airport_Free_WiFi': { type: 'captive', vendor: 'Airport', risk: 'open' },
  };

  const normalized = ssid.toLowerCase();
  const match = Object.keys(known).find(k => k.toLowerCase() === normalized);
  const info = match ? known[match] : null;

  const riskPatterns = [];
  if (/^androidap$/i.test(ssid)) riskPatterns.push('Android hotspot default - potential device owner exposure');
  if (/^iphone-|^iP(hone|ad)/i.test(ssid)) riskPatterns.push('iOS personal hotspot (names often followed by owner name)');
  if (/\d{4,}/.test(ssid)) riskPatterns.push('Contains digits - often phone numbers in AP names');

  return {
    module: 'wifi-ssid',
    target: ssid,
    knownNetwork: !!info,
    networkInfo: info,
    riskIndicators: riskPatterns,
    riskLevel: info?.risk === 'open' ? 'high' : riskPatterns.length ? 'medium' : 'low',
    timestamp: new Date().toISOString(),
  };
}