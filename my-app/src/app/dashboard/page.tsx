"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Target,
  Loader2,
  Users,
  Building2,
  Scale,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import Header from "../../components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useSession } from "../../lib/auth-client";
import type { AIRecommendationResponse, UserProfile } from "../../lib/types/ai";

interface Startup {
  id: number;
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
  foundingTeam: Array<{ name: string; skills: string[] }>;
  blueprint?: {
    content: {
      legalTasks: Array<{ task: string; priority: string; completed: boolean; description: string }>;
      teamRecommendations: Array<{ role: string; priority: string; reason: string }>;
      operationalMilestones: Array<{ milestone: string; priority: string; relatedGoal: string }>;
      industryInsights: string;
      nextSteps: string[];
    };
    generatedAt: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [startup, setStartup] = useState<Startup | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendationResponse | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchStartupData();
    }
  }, [session, isPending, router]);

  const fetchStartupData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/startups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const startups = await response.json();
        if (startups.length > 0) {
          // Get the most recent startup with full details
          const startupResponse = await fetch(`/api/startups/${startups[0].id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (startupResponse.ok) {
            const fullStartup = await startupResponse.json();
            setStartup(fullStartup);
            
            // Fetch AI recommendations
            await fetchRecommendations(fullStartup);
          }
        } else {
          // No startup found, redirect to onboarding
          router.push("/onboarding");
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching startup data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (startupData: Startup) => {
    setLoadingRecommendations(true);
    try {
      const userProfile: UserProfile = {
        id: startupData.id.toString(),
        startupName: startupData.startupName,
        industry: startupData.industry,
        stage: startupData.stage,
        goals: startupData.goals,
        teamSkills: startupData.foundingTeam.flatMap((f) => f.skills),
        founderCount: startupData.founderCount,
        domainPurchased: startupData.domainPurchased,
        trademarkCompleted: startupData.trademarkCompleted,
        entityRegistered: startupData.entityRegistered,
      };

      const response = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session?.user?.id,
          userProfile,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-teal-600" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="max-w-md text-center">
            <CardContent className="py-12">
              <Building2 className="mx-auto mb-4 h-12 w-12 text-teal-600" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                No Startup Found
              </h3>
              <p className="mb-6 text-gray-600">
                Complete the onboarding to get your personalized blueprint.
              </p>
              <Link href="/onboarding">
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Start Onboarding
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const blueprint = startup.blueprint?.content;
  const legalTasksTotal = blueprint?.legalTasks?.length || 0;
  const legalTasksCompleted = blueprint?.legalTasks?.filter((t) => t.completed).length || 0;
  const progressItems = [
    startup.domainPurchased,
    startup.trademarkCompleted,
    startup.entityRegistered,
  ];
  const progressCompleted = progressItems.filter(Boolean).length;
  const progressPercentage = legalTasksTotal > 0 
    ? Math.round(((progressCompleted + legalTasksCompleted) / (3 + legalTasksTotal)) * 100)
    : Math.round((progressCompleted / 3) * 100);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "legal":
        return "⚖️";
      case "product":
        return "🚀";
      case "growth":
        return "📈";
      case "fundraising":
        return "💰";
      case "operations":
        return "⚙️";
      case "hiring":
        return "👥";
      default:
        return "💡";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome back, {startup.fullName.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your progress on {startup.startupName}'s journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressPercentage}%</div>
              <p className="text-xs text-gray-500">Overall completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stage</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{startup.stage}</div>
              <p className="text-xs text-gray-500">{startup.industry} industry</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{startup.founderCount}</div>
              <p className="text-xs text-gray-500">
                {startup.founderCount === 1 ? "Founder" : "Founders"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Legal Tasks</CardTitle>
              <Scale className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {legalTasksCompleted}/{legalTasksTotal}
              </div>
              <p className="text-xs text-gray-500">Tasks completed</p>
            </CardContent>
          </Card>
        </div>

        {/* AI-Powered Personalized Recommendations */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-teal-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Personalized For You
              </h2>
              {recommendations?.cacheHit && (
                <Badge variant="outline" className="gap-1 text-xs">
                  <Zap className="h-3 w-3" />
                  Instant
                </Badge>
              )}
            </div>
          </div>

          {loadingRecommendations ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-teal-600" />
                  <p className="text-sm text-gray-600">
                    Analyzing your startup profile and generating personalized recommendations...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : recommendations ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.recommendations.slice(0, 6).map((rec) => (
                  <Card
                    key={rec.id}
                    className="transition-all hover:shadow-lg hover:border-teal-200"
                  >
                    <CardHeader>
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-2xl">{getCategoryIcon(rec.category)}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getPriorityColor(rec.priority)}`}
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <CardTitle className="text-base leading-tight">
                        {rec.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {rec.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-gray-600">{rec.summary}</p>
                      <div className="rounded-lg bg-teal-50 p-3">
                        <p className="text-xs text-teal-800">
                          <span className="font-semibold">Why this matters:</span>{" "}
                          {rec.reason}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full bg-teal-600 transition-all"
                            style={{ width: `${rec.relevanceScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {rec.relevanceScore}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Skill Gaps & Next Milestones */}
              {(recommendations.personalizationDetails.skillGaps.length > 0 ||
                recommendations.personalizationDetails.nextMilestones.length > 0) && (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {recommendations.personalizationDetails.skillGaps.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-orange-900">
                          🎯 Skill Gaps to Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {recommendations.personalizationDetails.skillGaps.map(
                            (skill, idx) => (
                              <li key={idx} className="text-sm text-orange-800">
                                • {skill}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {recommendations.personalizationDetails.nextMilestones.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader>
                        <CardTitle className="text-sm text-blue-900">
                          🎯 Upcoming Milestones
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {recommendations.personalizationDetails.nextMilestones.map(
                            (milestone, idx) => (
                              <li key={idx} className="text-sm text-blue-800">
                                • {milestone}
                              </li>
                            )
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </>
          ) : (
            <Card className="border-gray-300">
              <CardContent className="py-8 text-center">
                <p className="text-sm text-gray-600">
                  No recommendations available at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Checklist */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started Checklist</CardTitle>
              <CardDescription>
                Complete these essential tasks to establish your startup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {startup.domainPurchased ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={
                      startup.domainPurchased
                        ? "text-gray-600 line-through"
                        : "text-gray-900"
                    }
                  >
                    Purchase domain name
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {startup.trademarkCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={
                      startup.trademarkCompleted
                        ? "text-gray-600 line-through"
                        : "text-gray-900"
                    }
                  >
                    Complete trademark search
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {startup.entityRegistered ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Clock className="h-5 w-5 text-gray-400" />
                  )}
                  <span
                    className={
                      startup.entityRegistered
                        ? "text-gray-600 line-through"
                        : "text-gray-900"
                    }
                  >
                    Register business entity
                  </span>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Link href="/blueprint" className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Full Blueprint
                  </Button>
                </Link>
                <Link href="/legal" className="flex-1">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700">
                    Legal Toolkit
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        {blueprint?.nextSteps && blueprint.nextSteps.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Next Steps</h2>
              <Link
                href="/blueprint"
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                View blueprint <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {blueprint.nextSteps.slice(0, 3).map((step, index) => (
                <Card key={index} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-teal-100">
                      <span className="text-sm font-bold text-teal-600">
                        {index + 1}
                      </span>
                    </div>
                    <CardTitle className="text-base">{step}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Industry Insights */}
        {blueprint?.industryInsights && (
          <div className="mb-8">
            <Card className="border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-teal-600" />
                  <CardTitle className="text-teal-900">
                    Industry Insights for {startup.industry}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{blueprint.industryInsights}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Links */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900">Resources</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/legal">
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span>📋</span>
                    Legal Toolkit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Essential legal documents and checklists
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/templates">
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span>📄</span>
                    Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Download ready-to-use business templates
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/playbook">
              <Card className="transition-all hover:shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <span>📚</span>
                    Playbook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Learn from expert guides and articles
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}