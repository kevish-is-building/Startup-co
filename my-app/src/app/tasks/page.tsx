"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Loader2 } from "lucide-react";
import Header from "../../components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { useSession } from "../../lib/auth-client";
import { toast } from "sonner";

interface Task {
  task: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  description: string;
}

export default function TasksPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [startupId, setStartupId] = useState<number | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
      return;
    }

    if (session?.user) {
      loadTasks();
    }
  }, [session, isPending, router]);

  const loadTasks = async () => {
    try {
      const token = localStorage.getItem("bearer_token");

      // Get startup first
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

        // Get blueprint with tasks
        const blueprintResponse = await fetch(`/api/blueprints/${startupIdValue}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (blueprintResponse.ok) {
          const blueprint = await blueprintResponse.json();
          const legalTasks = blueprint.content?.legalTasks || [];
          setTasks(legalTasks);
          setFilteredTasks(legalTasks);
        } else if (blueprintResponse.status === 404) {
          toast.error("No blueprint found. Please complete onboarding first.");
          router.push("/onboarding");
        }
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...tasks];

    if (priorityFilter !== "all") {
      filtered = filtered.filter((t) => t.priority === priorityFilter);
    }

    if (statusFilter === "completed") {
      filtered = filtered.filter((t) => t.completed);
    } else if (statusFilter === "pending") {
      filtered = filtered.filter((t) => !t.completed);
    }

    setFilteredTasks(filtered);
  }, [priorityFilter, statusFilter, tasks]);

  const handleTaskToggle = async (taskIndex: number) => {
    if (!startupId) return;

    const updatedTasks = [...tasks];
    const newCompletedState = !updatedTasks[taskIndex].completed;
    updatedTasks[taskIndex].completed = newCompletedState;
    setTasks(updatedTasks);

    try {
      const token = localStorage.getItem("bearer_token");
      
      // Get current blueprint to preserve other content fields
      const getBlueprintResponse = await fetch(`/api/blueprints/${startupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!getBlueprintResponse.ok) {
        throw new Error("Failed to fetch current blueprint");
      }
      
      const currentBlueprint = await getBlueprintResponse.json();
      
      // Update with full content, not just legalTasks
      const response = await fetch(`/api/blueprints/${startupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: {
            ...currentBlueprint.content,
            legalTasks: updatedTasks,
          },
        }),
      });

      if (response.ok) {
        toast.success(
          newCompletedState ? "Task marked as complete!" : "Task marked as incomplete"
        );
      } else {
        // Revert on error
        updatedTasks[taskIndex].completed = !newCompletedState;
        setTasks(updatedTasks);
        toast.error("Failed to update task status");
      }
    } catch (error) {
      // Revert on error
      updatedTasks[taskIndex].completed = !newCompletedState;
      setTasks(updatedTasks);
      console.error("Error updating task:", error);
      toast.error("Failed to update task status");
    }
  };

  const clearFilters = () => {
    setPriorityFilter("all");
    setStatusFilter("all");
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

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-teal-600" />
            <p className="text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-gray-600">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              {(priorityFilter !== "all" || statusFilter !== "all") && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => {
              const actualIndex = tasks.findIndex((t) => t.task === task.task);
              return (
                <div
                  key={index}
                  className={`rounded-lg border p-4 transition-all ${
                    task.completed ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`task-${index}`}
                      checked={task.completed}
                      onCheckedChange={() => handleTaskToggle(actualIndex)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`task-${index}`}
                        className={`cursor-pointer text-base font-medium ${
                          task.completed ? "text-gray-500 line-through" : "text-gray-900"
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
              );
            })
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">
                  No tasks match your filters. Try adjusting your search criteria.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}