import { UserProfile } from './types/ai';

export function buildPersonalizationPrompt(userProfile: UserProfile): string {
  const industryInsights = getIndustryInsights(userProfile.industry);
  const stageDescription = getStageDescription(userProfile.stage);
  
  return `You are an expert startup advisor and content recommendation engine for tech founders.

USER STARTUP PROFILE:
- Startup Name: ${userProfile.startupName || 'New Startup'}
- Industry: ${userProfile.industry} (${industryInsights})
- Stage: ${userProfile.stage} (${stageDescription})
- Founder Team Size: ${userProfile.founderCount}
- Team Skills: ${userProfile.teamSkills?.join(', ') || 'Not specified'}
- Primary Goals: ${Array.isArray(userProfile.goals) ? userProfile.goals.join(', ') : 'Not specified'}

CURRENT PROGRESS:
- Domain Purchased: ${userProfile.domainPurchased ? 'Yes' : 'No'}
- Trademark Search Completed: ${userProfile.trademarkCompleted ? 'Yes' : 'No'}
- Business Entity Registered: ${userProfile.entityRegistered ? 'Yes' : 'No'}

TASK:
Generate 6 highly personalized content recommendations that will help this specific startup achieve their goals. Consider:
1. Their industry-specific challenges and opportunities
2. Their current stage and what comes next
3. Skill gaps in their founding team
4. What they've already completed vs what's still needed
5. Timing - what they need RIGHT NOW (not generic advice)

For each recommendation provide:
- title: Clear, specific title
- category: One of [Legal, Product, Growth, Fundraising, Operations, Hiring]
- relevanceScore: 0-100 (be honest, only recommend truly relevant content)
- summary: 2-sentence description of what this recommendation covers
- reason: Explain WHY this is relevant to their specific situation (mention their industry, stage, or goals)
- priority: "high", "medium", or "low"

Focus on actionable, specific recommendations - not generic startup advice.

RESPONSE FORMAT:
Return ONLY valid JSON with this structure:
{
  "recommendations": [
    {
      "title": "...",
      "category": "...",
      "relevanceScore": 95,
      "summary": "...",
      "reason": "...",
      "priority": "high"
    }
  ],
  "skillGaps": ["specific skill 1", "specific skill 2"],
  "nextMilestones": ["milestone 1", "milestone 2", "milestone 3"],
  "industryInsights": ["insight 1", "insight 2"]
}`;
}

export function buildTaskPrioritizationPrompt(
  userProfile: UserProfile,
  tasks: Array<{ id: string; title: string; category: string }>
): string {
  return `You are a startup advisor helping prioritize tasks for a ${userProfile.industry} startup at the ${userProfile.stage} stage.

STARTUP PROFILE:
- Industry: ${userProfile.industry}
- Stage: ${userProfile.stage}
- Goals: ${Array.isArray(userProfile.goals) ? userProfile.goals.join(', ') : 'Not specified'}
- Current Progress: Domain=${userProfile.domainPurchased}, Trademark=${userProfile.trademarkCompleted}, Entity=${userProfile.entityRegistered}

TASKS TO PRIORITIZE:
${tasks.map((t, i) => `${i + 1}. [${t.category}] ${t.title}`).join('\n')}

Based on their specific situation, assign a priority score (0-100) and estimated days to complete for each task.
Focus on what will move the needle for their current stage and goals.

Return ONLY valid JSON array:
[
  {
    "taskId": "task-id-here",
    "priority": 95,
    "reasoning": "Why this task is critical now...",
    "estimatedDays": 7
  }
]`;
}

export function buildPlaybookFilterPrompt(
  userProfile: UserProfile,
  articles: Array<{ slug: string; title: string; description: string; category: string }>
): string {
  return `You are filtering playbook articles for a ${userProfile.industry} startup at the ${userProfile.stage} stage.

STARTUP PROFILE:
- Industry: ${userProfile.industry}
- Stage: ${userProfile.stage}
- Team Size: ${userProfile.founderCount} founders
- Goals: ${Array.isArray(userProfile.goals) ? userProfile.goals.join(', ') : 'Not specified'}

AVAILABLE ARTICLES:
${articles.map((a, i) => `${i + 1}. [${a.category}] ${a.title}\n   ${a.description}`).join('\n\n')}

Select the top 5 most relevant articles for this startup RIGHT NOW. Consider:
- Current stage (don't recommend fundraising articles to ideation stage)
- Industry-specific needs
- Their stated goals
- Practical value for their situation

Return ONLY valid JSON array:
[
  {
    "articleSlug": "slug-here",
    "relevance": 95,
    "reasoning": "Why this article matters to them...",
    "readTimeMinutes": 8
  }
]`;
}

export function buildTemplateRecommendationPrompt(
  userProfile: UserProfile,
  templates: Array<{ name: string; category: string; description: string }>
): string {
  return `You are recommending legal and business templates for a ${userProfile.industry} startup at the ${userProfile.stage} stage.

STARTUP PROFILE:
- Industry: ${userProfile.industry}
- Stage: ${userProfile.stage}
- Entity Registered: ${userProfile.entityRegistered ? 'Yes' : 'No'}
- Goals: ${Array.isArray(userProfile.goals) ? userProfile.goals.join(', ') : 'Not specified'}

AVAILABLE TEMPLATES:
${templates.map((t, i) => `${i + 1}. [${t.category}] ${t.name}\n   ${t.description}`).join('\n\n')}

Recommend the top 4 templates they should prioritize based on:
- What they need at their current stage
- Legal requirements for their industry
- Their stated goals (e.g., if they want to raise funding, recommend SAFE agreement)

Return ONLY valid JSON array:
[
  {
    "templateName": "template-name",
    "priority": 95,
    "reasoning": "Why they need this now...",
    "urgency": "immediate"
  }
]`;
}

function getIndustryInsights(industry: string): string {
  const insights: Record<string, string> = {
    food: 'Food industry requires health permits, supplier agreements, and often significant upfront inventory costs',
    saas: 'SaaS businesses focus on product-market fit, unit economics, and scalable customer acquisition',
    consumer: 'Consumer products require brand building, distribution channels, and customer feedback loops',
    healthcare: 'Healthcare startups must navigate HIPAA compliance, FDA regulations, and complex insurance systems',
    fintech: 'Fintech requires banking partnerships, regulatory compliance (licenses), and strong security infrastructure',
    edtech: 'EdTech must consider FERPA/COPPA compliance, user engagement metrics, and educational outcomes',
  };
  return insights[industry.toLowerCase()] || 'Tech startup with unique industry challenges';
}

function getStageDescription(stage: string): string {
  const descriptions: Record<string, string> = {
    ideation: 'Pre-product, validating problem and solution, forming founding team',
    mvp: 'Building first product version, getting initial users, iterating based on feedback',
    growth: 'Product-market fit achieved, scaling team and operations, expanding market reach',
  };
  return descriptions[stage.toLowerCase()] || stage;
}