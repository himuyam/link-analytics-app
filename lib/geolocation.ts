// IP-based geolocation utility
// Using ip-api.com free tier (limited to 45 requests/minute)

export interface IpLocationData {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number; // Approximate accuracy in km
}

// Mock implementation for development
// Replace with real API in production
export async function getIpLocation(ipAddress: string): Promise<IpLocationData> {
  // Don't geolocate private/local IPs
  if (isPrivateIp(ipAddress)) {
    return {};
  }

  try {
    // Using ip-api.com free tier
    const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=country,regionName,city,lat,lon`, {
      headers: {
        'User-Agent': 'LinkAnalytics/1.0',
      },
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();

    if (data.status === 'success') {
      return {
        country: data.country,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        accuracy: 50, // Approximate accuracy in km for IP-based location
      };
    }
  } catch (error) {
    console.error('IP geolocation error:', error);
  }

  return {};
}

function isPrivateIp(ip: string): boolean {
  const privateRanges = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^localhost$/i,
    /^::1$/,
    /^fe80:/i,
  ];
  return privateRanges.some((range) => range.test(ip));
}

// Haversine formula to calculate distance between coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
