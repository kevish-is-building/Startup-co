import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { auth } from '../../../lib/auth';
import { generateBlueprint } from '../../../lib/blueprint-generator';

const VALID_INDUSTRIES = ['food', 'saas', 'consumer', 'healthcare', 'fintech', 'edtech'];
const VALID_STAGES = ['ideation', 'mvp', 'growth'];
const VALID_GOALS = ['build_mvp', 'validate_demand', 'register_entity', 'raise_funding', 'hire_team'];
const VALID_SKILLS = ['product', 'operations', 'marketing', 'sales', 'engineering', 'design'];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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
      foundingTeam: foundingTeamData
    } = body;

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED"
      }, { status: 400 });
    }

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json({
        error: "Full name is required and must be a non-empty string",
        code: "MISSING_FULL_NAME"
      }, { status: 400 });
    }

    if (!startupName || typeof startupName !== 'string' || !startupName.trim()) {
      return NextResponse.json({
        error: "Startup name is required and must be a non-empty string",
        code: "MISSING_STARTUP_NAME"
      }, { status: 400 });
    }

    if (!industry || !VALID_INDUSTRIES.includes(industry)) {
      return NextResponse.json({
        error: `Industry must be one of: ${VALID_INDUSTRIES.join(', ')}`,
        code: "INVALID_INDUSTRY"
      }, { status: 400 });
    }

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json({
        error: `Stage must be one of: ${VALID_STAGES.join(', ')}`,
        code: "INVALID_STAGE"
      }, { status: 400 });
    }

    if (!founderCount || typeof founderCount !== 'number' || founderCount < 1) {
      return NextResponse.json({
        error: "Founder count is required and must be a positive number",
        code: "INVALID_FOUNDER_COUNT"
      }, { status: 400 });
    }

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json({
        error: "Goals is required and must be a non-empty array",
        code: "MISSING_GOALS"
      }, { status: 400 });
    }

    const invalidGoals = goals.filter(goal => !VALID_GOALS.includes(goal));
    if (invalidGoals.length > 0) {
      return NextResponse.json({
        error: `Goals must contain only valid values: ${VALID_GOALS.join(', ')}`,
        code: "INVALID_GOALS"
      }, { status: 400 });
    }

    if (!foundingTeamData || !Array.isArray(foundingTeamData) || foundingTeamData.length === 0) {
      return NextResponse.json({
        error: "Founding team is required and must be a non-empty array",
        code: "MISSING_FOUNDING_TEAM"
      }, { status: 400 });
    }

    for (let i = 0; i < foundingTeamData.length; i++) {
      const member = foundingTeamData[i];
      
      if (!member.name || typeof member.name !== 'string' || !member.name.trim()) {
        return NextResponse.json({
          error: `Founding team member at index ${i} must have a name`,
          code: "INVALID_TEAM_MEMBER_NAME"
        }, { status: 400 });
      }

      if (!member.skills || !Array.isArray(member.skills) || member.skills.length === 0) {
        return NextResponse.json({
          error: `Founding team member at index ${i} must have skills array`,
          code: "INVALID_TEAM_MEMBER_SKILLS"
        }, { status: 400 });
      }

      const invalidSkills = member.skills.filter(skill => !VALID_SKILLS.includes(skill));
      if (invalidSkills.length > 0) {
        return NextResponse.json({
          error: `Founding team member at index ${i} has invalid skills. Valid skills: ${VALID_SKILLS.join(', ')}`,
          code: "INVALID_SKILLS"
        }, { status: 400 });
      }
    }

    const startupDataForBlueprint = {
      startupName,
      industry,
      stage,
      domainPurchased: domainPurchased ?? false,
      trademarkCompleted: trademarkCompleted ?? false,
      entityRegistered: entityRegistered ?? false,
      goals: goals
    };

    const blueprintContent = generateBlueprint(startupDataForBlueprint, foundingTeamData);

    const newStartup = await prisma.startup.create({
      data: {
        userId: session.user.id,
        fullName: fullName.trim(),
        startupName: startupName.trim(),
        industry,
        stage,
        founderCount,
        domainPurchased: domainPurchased ?? false,
        trademarkCompleted: trademarkCompleted ?? false,
        entityRegistered: entityRegistered ?? false,
        goals: JSON.stringify(goals),
        onboardingCompleted: true,
        foundingTeam: {
          create: foundingTeamData.map((member: any) => ({
            name: member.name.trim(),
            skills: JSON.stringify(member.skills),
          }))
        },
        blueprints: {
          create: {
            content: JSON.stringify(blueprintContent),
            generatedAt: new Date(),
          }
        }
      },
      include: {
        foundingTeam: true
      }
    });

    const result = {
      ...newStartup,
      goals: JSON.parse(newStartup.goals),
      foundingTeam: newStartup.foundingTeam.map(member => ({
        ...member,
        skills: JSON.parse(member.skills),
      })),
    };

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    const where: any = { userId: session.user.id };
    
    if (search) {
      where.OR = [
        { startupName: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
        { stage: { contains: search, mode: 'insensitive' } },
      ];
    }

    const results = await prisma.startup.findMany({
      where,
      include: {
        foundingTeam: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    const startupsWithTeams = results.map(startup => ({
      ...startup,
      goals: JSON.parse(startup.goals),
      foundingTeam: startup.foundingTeam.map(member => ({
        ...member,
        skills: JSON.parse(member.skills),
      })),
    }));

    return NextResponse.json(startupsWithTeams, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}