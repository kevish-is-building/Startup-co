import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { auth } from '../../../lib/auth';

import { generateBlueprint, BlueprintContent } from '../../../lib/blueprint-generator';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { startupId } = body;

    if (!startupId) {
      return NextResponse.json(
        { error: 'startupId is required', code: 'MISSING_STARTUP_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(startupId))) {
      return NextResponse.json(
        { error: 'startupId must be a valid integer', code: 'INVALID_STARTUP_ID' },
        { status: 400 }
      );
    }

    const parsedStartupId = parseInt(startupId);

    const startup = await prisma.startup.findUnique({
      where: { id: parsedStartupId },
      include: {
        foundingTeam: true
      }
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found', code: 'STARTUP_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (startup.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to access this startup', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const blueprintContent = generateBlueprint(startup, startup.foundingTeam);

    const existingBlueprint = await prisma.blueprint.findUnique({
      where: { startupId: parsedStartupId }
    });

    const currentTimestamp = new Date();

    if (existingBlueprint) {
      const updated = await prisma.blueprint.update({
        where: { id: existingBlueprint.id },
        data: {
          content: JSON.stringify(blueprintContent),
          generatedAt: currentTimestamp,
        }
      });

      return NextResponse.json(updated, { status: 200 });
    } else {
      const newBlueprint = await prisma.blueprint.create({
        data: {
          startupId: parsedStartupId,
          content: JSON.stringify(blueprintContent),
          generatedAt: currentTimestamp,
        }
      });

      return NextResponse.json(newBlueprint, { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}



