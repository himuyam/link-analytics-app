import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getIpLocation } from '@/lib/geolocation';
import { getClientIp, extractBrowserInfo, hashSessionId } from '@/lib/security';
import { updateAnalytics } from '@/lib/analytics';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const link = await prisma.link.findUnique({
      where: { slug: params.slug },
    });

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    // Check if link is active
    if (!link.active) {
      return NextResponse.json(
        { error: 'Link is disabled' },
        { status: 410 }
      );
    }

    // Check if link is expired
    if (link.expiresAt && link.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Link has expired' },
        { status: 410 }
      );
    }

    const body = await request.json();
    const { consentGiven } = body;

    // Get client info
    const clientIp = getClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || null;
    const language = request.headers.get('accept-language')?.split(',')[0] || null;
    const { browser, os, deviceType } = extractBrowserInfo(userAgent);

    // Get approximate location from IP
    const ipLocation = await getIpLocation(clientIp);

    // Create session hash for privacy-preserving visitor identification
    const sessionHash = hashSessionId(userAgent, clientIp);

    // Create visitor record
    const visitor = await prisma.visitor.create({
      data: {
        linkId: link.id,
        consentGiven: consentGiven ?? false,
        consentVersion: '1.0',
        consentTimestamp: consentGiven ? new Date() : null,
        approximateCountry: ipLocation.country,
        approximateRegion: ipLocation.region,
        approximateCity: ipLocation.city,
        approximateLatitude: ipLocation.latitude,
        approximateLongitude: ipLocation.longitude,
        approximateAccuracy: ipLocation.accuracy,
        userAgent,
        browser,
        operatingSystem: os,
        deviceType,
        referrer,
        language,
        timezone: body.timezone || null,
        sessionHash,
      },
    });

    // Update analytics
    await updateAnalytics(link.id);

    return NextResponse.json(
      {
        success: true,
        visitor: {
          id: visitor.id,
          consentGiven: visitor.consentGiven,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Visitor tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to record visit' },
      { status: 500 }
    );
  }
}
