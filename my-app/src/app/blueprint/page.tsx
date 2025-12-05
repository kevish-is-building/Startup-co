"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import Header from "../../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { useSession } from "../../lib/auth-client";
import { toast } from "sonner";

interface LegalTask {
  task: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  description: string;
}

interface TeamRecommendation {
  role: string;
  priority: "high" | "medium" | "low";
  reason: string;
}

interface OperationalMilestone {
  milestone: string;
  priority: "high" | "medium" | "low";
  relatedGoal: string;
}

interface BlueprintContent {
  startupName: string;
  industry: string;
  stage: string;
  legalTasks: LegalTask[];
  teamRecommendations: TeamRecommendation[];
  operationalMilestones: OperationalMilestone[];
  industryInsights: string;
  nextSteps: string[];
}

interface Blueprint {
  id: number;
  startupId: number;
  content: BlueprintContent;
  generatedAt: string;
}

export default function BlueprintPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [startupId, setStartupId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["legal", "team", "milestones"])
  );
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      fetchBlueprint();
    }
  }, [session, isPending, router]);

  const fetchBlueprint = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      
      const startupsResponse = await fetch("/api/startups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (startupsResponse.ok) {
        const startups = await startupsResponse.json();
        if (startups.length === 0) {
          router.push("/onboarding");
          return;
        }

        const startupIdValue = startups[0].id;
        setStartupId(startupIdValue);

        const blueprintResponse = await fetch(`/api/blueprints/${startupIdValue}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (blueprintResponse.ok) {
          const blueprintData = await blueprintResponse.json();
          setBlueprint(blueprintData);
        } else if (blueprintResponse.status === 404) {
          toast.error("No blueprint found. Please complete onboarding first.");
          router.push("/onboarding");
        }
      }
    } catch (error) {
      console.error("Error fetching blueprint:", error);
      toast.error("Failed to load blueprint");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleTaskToggle = async (taskIndex: number) => {
    if (!blueprint || !startupId) return;

    setUpdatingTaskId(taskIndex);

    const updatedTasks = [...blueprint.content.legalTasks];
    const newCompletedState = !updatedTasks[taskIndex].completed;
    updatedTasks[taskIndex].completed = newCompletedState;

    const updatedContent = {
      ...blueprint.content,
      legalTasks: updatedTasks,
    };

    setBlueprint({ ...blueprint, content: updatedContent });

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/blueprints/${startupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: updatedContent }),
      });

      if (response.ok) {
        toast.success(
          newCompletedState
            ? "Task marked as complete!"
            : "Task marked as incomplete"
        );
      } else {
        updatedTasks[taskIndex].completed = !newCompletedState;
        setBlueprint({ ...blueprint, content: { ...blueprint.content, legalTasks: updatedTasks } });
        toast.error("Failed to update task status");
      }
    } catch (error) {
      updatedTasks[taskIndex].completed = !newCompletedState;
      setBlueprint({ ...blueprint, content: { ...blueprint.content, legalTasks: updatedTasks } });
      console.error("Error updating task:", error);
      toast.error("Failed to update task status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const calculateProgress = () => {
    if (!blueprint?.content?.legalTasks) return 0;
    const completed = blueprint.content.legalTasks.filter((t) => t.completed).length;
    const total = blueprint.content.legalTasks.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-teal-600" />
            <p className="text-gray-600">Loading your blueprint...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <Card className="max-w-md text-center">
            <CardContent className="py-12">
              <p className="text-gray-600">No blueprint found. Please complete onboarding first.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {blueprint.content.startupName} Blueprint
          </h1>
          <p className="text-gray-600">
            Your personalized legal + operational roadmap for {blueprint.content.industry} at{" "}
            {blueprint.content.stage} stage
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {blueprint.content?.legalTasks?.filter((t) => t.completed).length || 0} of{" "}
                {blueprint.content?.legalTasks?.length || 0} legal tasks completed
              </span>
              <span className="text-sm font-semibold text-teal-600">{progress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {blueprint.content.nextSteps && blueprint.content.nextSteps.length > 0 && (
          <Card className="mb-8 border-teal-200 bg-gradient-to-r from-teal-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-teal-900">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {blueprint.content.nextSteps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {blueprint.content?.legalTasks && blueprint.content.legalTasks.length > 0 && (
          <Card className="mb-8">
            <CardHeader
              className="cursor-pointer"
              onClick={() => toggleSection("legal")}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    📋 Legal Tasks
                    <span className="text-sm font-normal text-gray-500">
                      ({blueprint.content.legalTasks.filter((t) => t.completed).length}/
                      {blueprint.content.legalTasks.length})
                    </span>
                  </CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  {expandedSections.has("legal") ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedSections.has("legal") && (
              <CardContent>
                <div className="space-y-4">
                  {blueprint.content.legalTasks.map((task, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border p-4 transition-all ${
                        task.completed ? "bg-gray-50" : "bg-white"
                      } ${updatingTaskId === index ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {updatingTaskId === index ? (
                          <Loader2 className="mt-1 h-4 w-4 animate-spin text-teal-600" />
                        ) : (
                          <Checkbox
                            id={`task-${index}`}
                            checked={task.completed}
                            onCheckedChange={() => handleTaskToggle(index)}
                            className="mt-1"
                          />
                        )}
                        <div className="flex-1">
                          <label
                            htmlFor={`task-${index}`}
                            className={`cursor-pointer text-base font-medium ${
                              task.completed
                                ? "text-gray-500 line-through"
                                : "text-gray-900"
                            }`}
                          >
                            {task.task}
                          </label>
                          <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                          <div className="mt-2">
                            <span
                              className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority.toUpperCase()} PRIORITY
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {blueprint.content.teamRecommendations &&
          blueprint.content.teamRecommendations.length > 0 && (
            <Card className="mb-8">
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleSection("team")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    👥 Team Building Recommendations
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    {expandedSections.has("team") ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedSections.has("team") && (
                <CardContent>
                  <div className="space-y-4">
                    {blueprint.content.teamRecommendations.map((rec, index) => (
                      <div key={index} className="rounded-lg border bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{rec.role}</h4>
                            <p className="mt-1 text-sm text-gray-600">{rec.reason}</p>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                              rec.priority
                            )}`}
                          >
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

        {blueprint.content.operationalMilestones &&
          blueprint.content.operationalMilestones.length > 0 && (
            <Card className="mb-8">
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleSection("milestones")}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    🎯 Operational Milestones
                  </CardTitle>
                  <Button variant="ghost" size="sm">
                    {expandedSections.has("milestones") ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {expandedSections.has("milestones") && (
                <CardContent>
                  <div className="space-y-4">
                    {blueprint.content.operationalMilestones.map((milestone, index) => (
                      <div key={index} className="rounded-lg border bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">
                              {milestone.milestone}
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              Related goal: {milestone.relatedGoal.replace(/_/g, " ")}
                            </p>
                          </div>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getPriorityColor(
                              milestone.priority
                            )}`}
                          >
                            {milestone.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          )}

        {blueprint.content.industryInsights && (
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                💡 Industry Insights for {blueprint.content.industry}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{blueprint.content.industryInsights}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
