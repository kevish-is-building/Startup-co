import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel, isGeminiConfigured } from '../../../../lib/gemini';
import { buildPersonalizationPrompt } from '../../../../lib/prompts';
import type { UserProfile, AIRecommendationResponse, ContentRecommendation } from '../../../../lib/types/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userProfile } = body as { userId: string; userProfile: UserProfile };

    if (!userId || !userProfile) {
      return NextResponse.json(
        { error: 'Missing userId or userProfile' },
        { status: 400 }
      );
    }

    // Check if Gemini is configured
    if (!isGeminiConfigured()) {
      console.log('Gemini not configured, using fallback recommendations');
      return NextResponse.json(getFallbackRecommendations(userProfile));
    }

    // Try to generate AI recommendations using Gemini
    try {
      const model = getGeminiModel();
      if (!model) {
        return NextResponse.json(getFallbackRecommendations(userProfile));
      }

      const prompt = buildPersonalizationPrompt(userProfile);

      const fullPrompt = `You are an expert startup advisor. Generate personalized recommendations based on the following startup profile. Return ONLY valid JSON in this exact format:
{
  "recommendations": [
    {
      "title": "string",
      "category": "Legal|Product|Fundraising|Hiring|Operations|Growth",
      "relevanceScore": number (0-100),
      "summary": "string",
      "reason": "string",
      "priority": "high|medium|low"
    }
  ],
  "skillGaps": ["string"],
  "nextMilestones": ["string"],
  "industryInsights": ["string"]
}

${prompt}`;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('Empty response from Gemini');
      }

      // Clean JSON response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/g, '');
      }

      // Parse AI response
      const parsed = JSON.parse(cleanContent);
      const recommendations: ContentRecommendation[] = (
        parsed.recommendations || []
      ).map((item: any, idx: number) => ({
        id: `rec-${Date.now()}-${idx}`,
        title: item.title || 'Untitled',
        category: item.category || 'General',
        relevanceScore: Math.min(100, Math.max(0, item.relevanceScore || 75)),
        summary: item.summary || '',
        reason: item.reason || '',
        priority: item.priority || 'medium',
      }));

      const aiResponse: AIRecommendationResponse = {
        recommendations,
        personalizationDetails: {
          matchedGoals: userProfile.goals?.slice(0, 3) || [],
          skillGaps: parsed.skillGaps || [],
          nextMilestones: parsed.nextMilestones || [],
          industryInsights: parsed.industryInsights || [],
        },
        cacheHit: false,
      };

      return NextResponse.json(aiResponse);
    } catch (geminiError) {
      // If Gemini fails, log the error and fall back to smart recommendations
      console.error('Gemini API Error (using fallback):', geminiError);
      return NextResponse.json(getFallbackRecommendations(userProfile));
    }
  } catch (error) {
    console.error('AI Recommendations Error:', error);
    
    // Return fallback on error
    try {
      const body = await request.json();
      if (body.userProfile) {
        return NextResponse.json(getFallbackRecommendations(body.userProfile));
      }
    } catch (parseError) {
      // If we can't parse the body, return a generic error
    }
    
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate recommendations',
      },
      { status: 500 }
    );
  }
}

// Fallback recommendations when AI is not available
function getFallbackRecommendations(userProfile: UserProfile): AIRecommendationResponse {
  const recommendations: ContentRecommendation[] = [];

  // Legal recommendations based on progress
  if (!userProfile.entityRegistered) {
    recommendations.push({
      id: 'fallback-1',
      title: 'Register Your Business Entity',
      category: 'Legal',
      relevanceScore: 95,
      summary: 'Set up your LLC or Corporation to protect personal assets and establish credibility with customers and investors.',
      reason: `Essential for ${userProfile.stage} stage startups before raising funds or signing major contracts.`,
      priority: 'high',
    });
  }

  if (!userProfile.trademarkCompleted) {
    recommendations.push({
      id: 'fallback-2',
      title: 'Complete Trademark Search',
      category: 'Legal',
      relevanceScore: 85,
      summary: 'Search USPTO database to ensure your brand name is available and avoid costly rebranding later.',
      reason: 'Protects your brand identity as you grow in the ' + userProfile.industry + ' industry.',
      priority: 'high',
    });
  }

  // Product recommendations for early stage
  if (userProfile.stage === 'ideation' || userProfile.stage === 'mvp') {
    recommendations.push({
      id: 'fallback-3',
      title: 'Build Your MVP Fast',
      category: 'Product',
      relevanceScore: 90,
      summary: 'Focus on core features that solve your target customer\'s main problem. Launch quickly and iterate based on feedback.',
      reason: `Critical for ${userProfile.stage} stage - validate your idea before investing heavily.`,
      priority: 'high',
    });
  }

  // Fundraising for those with that goal
  if (userProfile.goals.includes('raise_funding')) {
    recommendations.push({
      id: 'fallback-4',
      title: 'Prepare Your Fundraising Materials',
      category: 'Fundraising',
      relevanceScore: 88,
      summary: 'Create a compelling pitch deck, financial model, and SAFE agreement template for investor conversations.',
      reason: 'You indicated fundraising as a primary goal - start preparing early.',
      priority: 'high',
    });
  }

  // Hiring recommendations
  if (userProfile.goals.includes('hire_team') || userProfile.founderCount === 1) {
    recommendations.push({
      id: 'fallback-5',
      title: 'Build Your Founding Team',
      category: 'Hiring',
      relevanceScore: 80,
      summary: 'Identify skill gaps and recruit co-founders or early employees who complement your strengths.',
      reason: userProfile.founderCount === 1 
        ? 'Solo founders face unique challenges - consider finding a co-founder.'
        : 'Growing your team is a key goal for this stage.',
      priority: 'medium',
    });
  }

  // Industry-specific recommendation
  const industryRec = getIndustrySpecificRecommendation(userProfile.industry);
  if (industryRec) {
    recommendations.push(industryRec);
  }

  return {
    recommendations: recommendations.slice(0, 6),
    personalizationDetails: {
      matchedGoals: userProfile.goals.slice(0, 3),
      skillGaps: ['Product Management', 'Growth Marketing'],
      nextMilestones: [
        'Complete legal entity registration',
        'Launch MVP to first 10 customers',
        'Establish product-market fit',
      ],
      industryInsights: [
        `${userProfile.industry} startups typically focus on ${getIndustryFocus(userProfile.industry)}`,
      ],
    },
    cacheHit: false,
  };
}

function getIndustrySpecificRecommendation(industry: string): ContentRecommendation | null {
  const recommendations: Record<string, ContentRecommendation> = {
    saas: {
      id: 'industry-saas',
      title: 'Master SaaS Metrics and Unit Economics',
      category: 'Operations',
      relevanceScore: 85,
      summary: 'Understand CAC, LTV, churn rate, and MRR to build a sustainable SaaS business model.',
      reason: 'Essential metrics for SaaS businesses to track growth and profitability.',
      priority: 'high',
    },
    fintech: {
      id: 'industry-fintech',
      title: 'Navigate Fintech Compliance Requirements',
      category: 'Legal',
      relevanceScore: 90,
      summary: 'Understand banking regulations, KYC/AML requirements, and necessary licenses for your fintech product.',
      reason: 'Fintech has strict regulatory requirements that must be addressed early.',
      priority: 'high',
    },
    healthcare: {
      id: 'industry-healthcare',
      title: 'Ensure HIPAA Compliance from Day One',
      category: 'Legal',
      relevanceScore: 95,
      summary: 'Implement proper data security, privacy policies, and HIPAA-compliant infrastructure for healthcare data.',
      reason: 'Healthcare startups must protect patient data and comply with HIPAA regulations.',
      priority: 'high',
    },
    edtech: {
      id: 'industry-edtech',
      title: 'Navigate FERPA and COPPA Compliance',
      category: 'Legal',
      relevanceScore: 88,
      summary: 'Understand student privacy laws, parental consent requirements, and data protection for educational platforms.',
      reason: 'EdTech platforms handling student data must comply with FERPA and COPPA.',
      priority: 'high',
    },
    food: {
      id: 'industry-food',
      title: 'Obtain Food Safety Certifications',
      category: 'Operations',
      relevanceScore: 90,
      summary: 'Secure health permits, food handler certifications, and understand FDA labeling requirements.',
      reason: 'Food businesses require specific permits and safety certifications to operate legally.',
      priority: 'high',
    },
    consumer: {
      id: 'industry-consumer',
      title: 'Build a Strong Brand Identity',
      category: 'Growth',
      relevanceScore: 82,
      summary: 'Develop compelling brand story, visual identity, and customer engagement strategy for consumer products.',
      reason: 'Consumer products succeed through strong branding and emotional connection with customers.',
      priority: 'medium',
    },
  };

  return recommendations[industry.toLowerCase()] || null;
}

function getIndustryFocus(industry: string): string {
  const focuses: Record<string, string> = {
    saas: 'recurring revenue, product-market fit, and scalable customer acquisition',
    fintech: 'regulatory compliance, security infrastructure, and banking partnerships',
    healthcare: 'HIPAA compliance, clinical validation, and insurance relationships',
    edtech: 'student outcomes, engagement metrics, and privacy compliance',
    food: 'supply chain management, health certifications, and distribution channels',
    consumer: 'brand building, customer acquisition, and retention strategies',
  };
  return focuses[industry.toLowerCase()] || 'sustainable growth and customer acquisition';
}