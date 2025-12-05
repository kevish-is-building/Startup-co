import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';

const VALID_INDUSTRIES = ['food', 'saas', 'consumer', 'healthcare', 'fintech', 'edtech'];
const VALID_STAGES = ['ideation', 'mvp', 'growth'];
const VALID_GOALS = ['build_mvp', 'validate_demand', 'register_entity', 'raise_funding', 'hire_team'];
const VALID_SKILLS = ['product', 'operations', 'marketing', 'sales', 'engineering', 'design'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid startup ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const startupId = parseInt(id);

    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        foundingTeam: true,
        blueprints: true
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

    const result = {
      ...startup,
      goals: JSON.parse(startup.goals),
      foundingTeam: startup.foundingTeam.map(member => ({
        ...member,
        skills: JSON.parse(member.skills),
      })),
      blueprint: startup.blueprints[0] || null,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('GET startup error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid startup ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const startupId = parseInt(id);

    const existingStartup = await prisma.startup.findUnique({
      where: { id: startupId }
    });

    if (!existingStartup) {
      return NextResponse.json(
        { error: 'Startup not found', code: 'STARTUP_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (existingStartup.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this startup', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      startupName,
      industry,
      stage,
      founderCount,
      domainPurchased,
      trademarkCompleted,
      entityRegistered,
      goals,
      onboardingCompleted,
      foundingTeam: teamMembers,
    } = body;

    if (industry && !VALID_INDUSTRIES.includes(industry)) {
      return NextResponse.json(
        {
          error: `Invalid industry. Must be one of: ${VALID_INDUSTRIES.join(', ')}`,
          code: 'INVALID_INDUSTRY',
        },
        { status: 400 }
      );
    }

    if (stage && !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        {
          error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}`,
          code: 'INVALID_STAGE',
        },
        { status: 400 }
      );
    }

    if (goals) {
      if (!Array.isArray(goals)) {
        return NextResponse.json(
          { error: 'Goals must be an array', code: 'INVALID_GOALS_FORMAT' },
          { status: 400 }
        );
      }
      const invalidGoals = goals.filter((goal) => !VALID_GOALS.includes(goal));
      if (invalidGoals.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid goals: ${invalidGoals.join(', ')}. Must be one of: ${VALID_GOALS.join(', ')}`,
            code: 'INVALID_GOALS',
          },
          { status: 400 }
        );
      }
    }

    if (teamMembers) {
      if (!Array.isArray(teamMembers)) {
        return NextResponse.json(
          { error: 'foundingTeam must be an array', code: 'INVALID_TEAM_FORMAT' },
          { status: 400 }
        );
      }
      for (const member of teamMembers) {
        if (!member.name) {
          return NextResponse.json(
            { error: 'Team member name is required', code: 'MISSING_TEAM_NAME' },
            { status: 400 }
          );
        }
        if (!member.skills || !Array.isArray(member.skills)) {
          return NextResponse.json(
            { error: 'Team member skills must be an array', code: 'INVALID_SKILLS_FORMAT' },
            { status: 400 }
          );
        }
        const invalidSkills = member.skills.filter((skill: string) => !VALID_SKILLS.includes(skill));
        if (invalidSkills.length > 0) {
          return NextResponse.json(
            {
              error: `Invalid skills: ${invalidSkills.join(', ')}. Must be one of: ${VALID_SKILLS.join(', ')}`,
              code: 'INVALID_SKILLS',
            },
            { status: 400 }
          );
        }
      }
    }

    const updateData: any = {};

    if (fullName !== undefined) updateData.fullName = fullName;
    if (startupName !== undefined) updateData.startupName = startupName;
    if (industry !== undefined) updateData.industry = industry;
    if (stage !== undefined) updateData.stage = stage;
    if (founderCount !== undefined) updateData.founderCount = founderCount;
    if (domainPurchased !== undefined) updateData.domainPurchased = domainPurchased;
    if (trademarkCompleted !== undefined) updateData.trademarkCompleted = trademarkCompleted;
    if (entityRegistered !== undefined) updateData.entityRegistered = entityRegistered;
    if (goals !== undefined) updateData.goals = JSON.stringify(goals);
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;

    const updatedStartup = await prisma.startup.update({
      where: { id: startupId },
      data: updateData,
      include: {
        foundingTeam: true
      }
    });

    if (teamMembers) {
      await prisma.foundingTeam.deleteMany({
        where: { startupId }
      });

      if (teamMembers.length > 0) {
        await prisma.foundingTeam.createMany({
          data: teamMembers.map((member: { name: string; skills: string[] }) => ({
            startupId,
            name: member.name,
            skills: JSON.stringify(member.skills),
          }))
        });
      }
    }

    const team = await prisma.foundingTeam.findMany({
      where: { startupId }
    });

    const result = {
      ...updatedStartup,
      goals: JSON.parse(updatedStartup.goals),
      foundingTeam: team.map(member => ({
        ...member,
        skills: JSON.parse(member.skills),
      })),
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('PUT startup error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}