import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ startupId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { startupId } = await params;

    if (!startupId || isNaN(parseInt(startupId))) {
      return NextResponse.json(
        { error: 'Valid startup ID is required', code: 'INVALID_STARTUP_ID' },
        { status: 400 }
      );
    }

    const parsedStartupId = parseInt(startupId);

    const startup = await prisma.startup.findUnique({
      where: { id: parsedStartupId }
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found', code: 'STARTUP_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (startup.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this startup', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const blueprint = await prisma.blueprint.findUnique({
      where: { startupId: parsedStartupId }
    });

    if (!blueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found for this startup', code: 'BLUEPRINT_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(blueprint, { status: 200 });
  } catch (error) {
    console.error('GET blueprint error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ startupId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'AUTHENTICATION_REQUIRED' },
        { status: 401 }
      );
    }

    const { startupId } = await params;

    if (!startupId || isNaN(parseInt(startupId))) {
      return NextResponse.json(
        { error: 'Valid startup ID is required', code: 'INVALID_STARTUP_ID' },
        { status: 400 }
      );
    }

    const parsedStartupId = parseInt(startupId);

    const startup = await prisma.startup.findUnique({
      where: { id: parsedStartupId }
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found', code: 'STARTUP_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (startup.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this startup', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const existingBlueprint = await prisma.blueprint.findUnique({
      where: { startupId: parsedStartupId }
    });

    if (!existingBlueprint) {
      return NextResponse.json(
        { error: 'Blueprint not found for this startup', code: 'BLUEPRINT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required', code: 'MISSING_CONTENT' },
        { status: 400 }
      );
    }

    const updated = await prisma.blueprint.update({
      where: { id: existingBlueprint.id },
      data: {
        content: typeof content === 'string' ? content : JSON.stringify(content),
        generatedAt: new Date(),
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT blueprint error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}