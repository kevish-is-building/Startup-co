export interface UserProfile {
  id: string;
  startupName: string;
  industry: string;
  stage: string;
  goals: string[];
  teamSkills: string[];
  founderCount: number;
  domainPurchased: boolean;
  trademarkCompleted: boolean;
  entityRegistered: boolean;
}

export interface ContentRecommendation {
  id: string;
  title: string;
  category: string;
  relevanceScore: number;
  summary: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

export interface AIRecommendationResponse {
  recommendations: ContentRecommendation[];
  personalizationDetails: {
    matchedGoals: string[];
    skillGaps: string[];
    nextMilestones: string[];
    industryInsights: string[];
  };
  cacheHit: boolean;
  tokensUsed?: {
    prompt: number;
    completion: number;
    cached: number;
  };
}

export interface TaskPriority {
  taskId: string;
  taskTitle: string;
  priority: number;
  reasoning: string;
  estimatedDays: number;
}

export interface PlaybookRecommendation {
  articleSlug: string;
  title: string;
  relevance: number;
  reasoning: string;
  readTimeMinutes: number;
}

export interface TemplateRecommendation {
  templateName: string;
  category: string;
  priority: number;
  reasoning: string;
  urgency: 'immediate' | 'soon' | 'later';
}

export interface PromptCache {
  cacheId: string;
  userProfileHash: string;
  recommendations: ContentRecommendation[];
  createdAt: number;
  expiresAt: number;
}
