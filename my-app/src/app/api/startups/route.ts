import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/auth-server';
import { generateBlueprint } from '../../../lib/blueprint-generator';

const VALID_INDUSTRIES = ['food', 'saas', 'consumer', 'healthcare', 'fintech', 'edtech'];
const VALID_STAGES = ['ideation', 'mvp', 'growth'];
const VALID_GOALS = ['build_mvp', 'validate_demand', 'register_entity', 'raise_funding', 'hire_team'];
const VALID_SKILLS = ['product', 'operations', 'marketing', 'sales', 'engineering', 'design'];

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const userId = session.user.id;

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

      const invalidSkills: string[] = member.skills.filter((skill: string) => !VALID_SKILLS.includes(skill));
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
        userId: userId,
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

    interface FoundingTeamMember {
      id: string;
      name: string;
      skills: string[];
      startupId: string;
      createdAt: Date;
      updatedAt: Date;
    }

    interface StartupResult {
      id: string;
      userId: string;
      fullName: string;
      startupName: string;
      industry: string;
      stage: string;
      founderCount: number;
      domainPurchased: boolean;
      trademarkCompleted: boolean;
      entityRegistered: boolean;
      goals: string[];
      onboardingCompleted: boolean;
      createdAt: Date;
      updatedAt: Date;
      foundingTeam: FoundingTeamMember[];
    }

        const result: any = {
          ...newStartup,
          goals: JSON.parse(newStartup.goals),
          foundingTeam: newStartup.foundingTeam.map((member: any) => ({
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
    const session = await requireAuth(request);
    const userId = session.user.id;

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    const where: any = { userId: userId };
    
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

    interface FoundingTeamMemberResponse {
      id: string;
      name: string;
      skills: string[];
      startupId: string;
      createdAt: Date;
      updatedAt: Date;
    }

    interface StartupResponse {
      id: string;
      userId: string;
      fullName: string;
      startupName: string;
      industry: string;
      stage: string;
      founderCount: number;
      domainPurchased: boolean;
      trademarkCompleted: boolean;
      entityRegistered: boolean;
      goals: string[];
      onboardingCompleted: boolean;
      createdAt: Date;
      updatedAt: Date;
      foundingTeam: FoundingTeamMemberResponse[];
    }

    interface RawFoundingTeamMember {
      id: string;
      name: string;
      skills: string;
      startupId: string;
      createdAt: Date;
      updatedAt: Date;
    }

    interface RawStartup {
      id: string;
      userId: string;
      fullName: string;
      startupName: string;
      industry: string;
      stage: string;
      founderCount: number;
      domainPurchased: boolean;
      trademarkCompleted: boolean;
      entityRegistered: boolean;
      goals: string;
      onboardingCompleted: boolean;
      createdAt: Date;
      updatedAt: Date;
      foundingTeam: RawFoundingTeamMember[];
    }

    const startupsWithTeams: StartupResponse[] = results.map((startup: any) => ({
      ...startup,
      goals: JSON.parse(startup.goals),
      foundingTeam: startup.foundingTeam.map((member: RawFoundingTeamMember) => ({
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