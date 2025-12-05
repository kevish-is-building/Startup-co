
export interface BlueprintContent {
  startupName: string;
  industry: string;
  stage: string;
  legalTasks: Array<{
    task: string;
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
    description: string;
  }>;
  teamRecommendations: Array<{
    role: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
  operationalMilestones: Array<{
    milestone: string;
    priority: 'high' | 'medium' | 'low';
    relatedGoal: string;
  }>;
  industryInsights: string;
  nextSteps: string[];
}

export function generateBlueprint(
  startup: any,
  team: any[]
): BlueprintContent {
  const legalTasks: BlueprintContent['legalTasks'] = [];
  const teamRecommendations: BlueprintContent['teamRecommendations'] = [];
  const operationalMilestones: BlueprintContent['operationalMilestones'] = [];

  if (!startup.domainPurchased) {
    legalTasks.push({
      task: 'Purchase domain name',
      priority: 'high',
      completed: false,
      description: 'Secure your brand identity by purchasing your primary domain name and relevant variations.',
    });
  }

  if (!startup.trademarkCompleted) {
    const priority = startup.stage === 'ideation' ? 'medium' : 'high';
    legalTasks.push({
      task: 'File trademark application',
      priority,
      completed: false,
      description: 'Protect your brand by filing a trademark application with the USPTO or relevant authority.',
    });
  }

  if (!startup.entityRegistered) {
    legalTasks.push({
      task: 'Register business entity (LLC/C-Corp)',
      priority: 'high',
      completed: false,
      description: 'Establish your legal business structure to protect personal assets and enable fundraising.',
    });
  }

  legalTasks.push({
    task: 'Draft founders agreement',
    priority: 'high',
    completed: false,
    description: 'Create a comprehensive founders agreement outlining equity splits, vesting schedules, and responsibilities.',
  });

  legalTasks.push({
    task: 'Set up cap table',
    priority: 'high',
    completed: false,
    description: 'Establish a clear capitalization table to track equity ownership and future dilution.',
  });

  const allSkills = team.flatMap((member) => {
    const skills = typeof member.skills === 'string' ? JSON.parse(member.skills) : member.skills;
    return Array.isArray(skills) ? skills : [];
  });
  
  const hasEngineering = allSkills.some((skill: string) => 
    ['engineering', 'technical', 'development', 'developer'].includes(skill.toLowerCase())
  );
  const hasMarketing = allSkills.some((skill: string) => 
    ['marketing', 'growth', 'sales'].includes(skill.toLowerCase())
  );
  const hasProduct = allSkills.some((skill: string) => 
    ['product', 'product management', 'pm'].includes(skill.toLowerCase())
  );

  const goals = typeof startup.goals === 'string' ? JSON.parse(startup.goals) : startup.goals;

  if (!hasEngineering && goals.includes('build_mvp')) {
    teamRecommendations.push({
      role: 'Technical Co-founder or Lead Engineer',
      priority: 'high',
      reason: 'Critical for MVP development. You need technical expertise to build and iterate on your product.',
    });
  }

  if (!hasMarketing) {
    const priority = startup.stage === 'growth' ? 'high' : startup.stage === 'mvp' ? 'medium' : 'low';
    teamRecommendations.push({
      role: 'Marketing Lead',
      priority,
      reason: 'Essential for customer acquisition and brand building. Will help validate demand and grow user base.',
    });
  }

  if (!hasProduct && goals.includes('build_mvp')) {
    teamRecommendations.push({
      role: 'Product Manager',
      priority: 'medium',
      reason: 'Needed to bridge business goals and technical execution. Will ensure product-market fit.',
    });
  }

  const goalMilestoneMap: Record<string, { milestone: string; priority: 'high' | 'medium' | 'low' }> = {
    build_mvp: {
      milestone: 'Complete MVP development and testing',
      priority: 'high',
    },
    validate_demand: {
      milestone: 'Conduct customer interviews and gather feedback',
      priority: 'high',
    },
    register_entity: {
      milestone: 'Complete business entity registration',
      priority: 'high',
    },
    raise_funding: {
      milestone: 'Prepare pitch deck and financial projections',
      priority: 'medium',
    },
    hire_team: {
      milestone: 'Define roles and begin recruitment process',
      priority: 'medium',
    },
  };

  goals.forEach((goal: string) => {
    if (goalMilestoneMap[goal]) {
      operationalMilestones.push({
        milestone: goalMilestoneMap[goal].milestone,
        priority: goalMilestoneMap[goal].priority,
        relatedGoal: goal,
      });
    }
  });

  const industryInsights = generateIndustryInsights(startup.industry);
  const nextSteps = generateNextSteps(startup, legalTasks, teamRecommendations, operationalMilestones);

  return {
    startupName: startup.startupName,
    industry: startup.industry,
    stage: startup.stage,
    legalTasks,
    teamRecommendations,
    operationalMilestones,
    industryInsights,
    nextSteps,
  };
}

function generateIndustryInsights(industry: string): string {
  const insights: Record<string, string> = {
    technology: 'The technology sector moves fast—prioritize rapid iteration and user feedback. Consider open-source contributions to build credibility. Focus on scalability from day one as technical debt compounds quickly.',
    healthcare: 'Healthcare requires careful regulatory compliance and data privacy considerations. Build relationships with medical advisors early. HIPAA compliance and FDA regulations may apply depending on your product category.',
    fintech: 'Financial technology is heavily regulated—prioritize legal compliance and security. Partner with established financial institutions when possible. PCI-DSS compliance and banking regulations will be critical to your success.',
    ecommerce: 'E-commerce success depends on logistics and customer experience. Focus on unit economics and customer acquisition cost. Build strong supplier relationships and invest in seamless checkout experiences.',
    saas: 'SaaS businesses thrive on recurring revenue and low churn. Prioritize product-market fit and customer success. Focus on metrics like MRR, LTV, and CAC to guide growth decisions.',
    education: 'EdTech requires understanding pedagogy and user engagement. Partner with educators to validate your approach. Compliance with FERPA and COPPA may be necessary depending on your target audience.',
    edtech: 'EdTech requires understanding pedagogy and user engagement. Partner with educators to validate your approach. Compliance with FERPA and COPPA may be necessary depending on your target audience. Focus on learning outcomes and accessibility.',
    food: 'Food industry requires health permits, safety certifications, and supply chain management. Build relationships with suppliers and distributors early. Focus on food safety, quality control, and regulatory compliance.',
    consumer: 'Consumer products need strong branding and distribution strategies. Focus on product-market fit and customer feedback. Build a compelling brand story and invest in customer acquisition.',
    default: 'Focus on understanding your target market deeply and validating assumptions early. Build relationships with potential customers and industry experts. Stay lean and iterate based on real-world feedback.',
  };

  return insights[industry.toLowerCase()] || insights.default;
}

function generateNextSteps(
  startup: any,
  legalTasks: any[],
  teamRecommendations: any[],
  operationalMilestones: any[]
): string[] {
  const steps: string[] = [];

  const highPriorityLegal = legalTasks.filter((t) => t.priority === 'high');
  if (highPriorityLegal.length > 0) {
    steps.push(`Complete critical legal setup: ${highPriorityLegal[0].task}`);
  }

  const highPriorityTeam = teamRecommendations.filter((t) => t.priority === 'high');
  if (highPriorityTeam.length > 0) {
    steps.push(`Begin recruiting for: ${highPriorityTeam[0].role}`);
  }

  const highPriorityOps = operationalMilestones.filter((m) => m.priority === 'high');
  if (highPriorityOps.length > 0) {
    steps.push(`Focus on: ${highPriorityOps[0].milestone}`);
  }

  if (startup.stage === 'ideation') {
    steps.push('Conduct market research and validate your problem statement with potential customers');
    steps.push('Create a detailed business plan and financial projections');
  } else if (startup.stage === 'mvp') {
    steps.push('Set up analytics and tracking to measure user engagement');
    steps.push('Establish a feedback loop with early adopters');
  } else if (startup.stage === 'growth') {
    steps.push('Optimize your customer acquisition channels and reduce CAC');
    steps.push('Build scalable systems and processes for operations');
  }

  if (steps.length < 3) {
    steps.push('Network with other founders and seek mentorship in your industry');
  }
  if (steps.length < 4) {
    steps.push('Establish key performance metrics and tracking systems');
  }
  if (steps.length < 5) {
    steps.push('Build a strong brand presence on relevant social and professional platforms');
  }

  return steps.slice(0, 5);
}
