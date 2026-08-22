import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateAnalytics(linkId: string) {
  const visitors = await prisma.visitor.findMany({
    where: { linkId },
  });

  const totalVisits = visitors.length;
  const uniqueVisitors = new Set(visitors.map((v) => v.sessionHash)).size;
  const consentGiven = visitors.filter((v) => v.consentGiven).length;
  const locationGranted = visitors.filter((v) => v.preciseLocationGrantedAt).length;

  const consentRate = totalVisits > 0 ? (consentGiven / totalVisits) * 100 : 0;
  const locationGrantRate = consentGiven > 0 ? (locationGranted / consentGiven) * 100 : 0;

  const analytics = await prisma.analytics.upsert({
    where: { linkId },
    create: {
      linkId,
      totalVisits,
      uniqueVisitors,
      consentRate,
      locationGrantRate,
    },
    update: {
      totalVisits,
      uniqueVisitors,
      consentRate,
      locationGrantRate,
      lastUpdated: new Date(),
    },
  });

  return analytics;
}

export async function getVisitorStats(linkId: string) {
  const visitors = await prisma.visitor.findMany({
    where: { linkId },
  });

  // Group by country
  const byCountry: Record<string, number> = {};
  visitors.forEach((v) => {
    if (v.approximateCountry) {
      byCountry[v.approximateCountry] = (byCountry[v.approximateCountry] || 0) + 1;
    }
  });

  // Group by browser
  const byBrowser: Record<string, number> = {};
  visitors.forEach((v) => {
    if (v.browser) {
      byBrowser[v.browser] = (byBrowser[v.browser] || 0) + 1;
    }
  });

  // Group by OS
  const byOs: Record<string, number> = {};
  visitors.forEach((v) => {
    if (v.operatingSystem) {
      byOs[v.operatingSystem] = (byOs[v.operatingSystem] || 0) + 1;
    }
  });

  // Group by device type
  const byDevice: Record<string, number> = {};
  visitors.forEach((v) => {
    if (v.deviceType) {
      byDevice[v.deviceType] = (byDevice[v.deviceType] || 0) + 1;
    }
  });

  // Visits over time (hourly)
  const visitsOverTime: Record<string, number> = {};
  visitors.forEach((v) => {
    const hour = new Date(v.visitedAt).toISOString().slice(0, 13);
    visitsOverTime[hour] = (visitsOverTime[hour] || 0) + 1;
  });

  return {
    totalVisits: visitors.length,
    uniqueVisitors: new Set(visitors.map((v) => v.sessionHash)).size,
    consentRate: (visitors.filter((v) => v.consentGiven).length / visitors.length) * 100 || 0,
    locationGrantRate:
      (visitors.filter((v) => v.preciseLocationGrantedAt).length /
        visitors.filter((v) => v.consentGiven).length) *
        100 || 0,
    byCountry,
    byBrowser,
    byOs,
    byDevice,
    visitsOverTime,
  };
}

export async function cleanupExpiredData() {
  const now = new Date();

  // Find links with expired data
  const linksToCleanup = await prisma.link.findMany({
    where: {
      retentionDays: { gt: 0 },
    },
  });

  for (const link of linksToCleanup) {
    const cutoffDate = new Date(now.getTime() - link.retentionDays * 24 * 60 * 60 * 1000);

    // Delete old visitor records
    await prisma.visitor.deleteMany({
      where: {
        linkId: link.id,
        visitedAt: { lt: cutoffDate },
      },
    });
  }
}
