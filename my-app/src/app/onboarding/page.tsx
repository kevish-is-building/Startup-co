"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Rocket,
  Plus,
  Trash2,
  Users,
  Building2,
  Target,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { useSession } from "../../lib/auth-client";
import { toast } from "sonner";

const steps = ["Basics", "Founders", "Team Details", "Progress", "Goals", "Review"];

const INDUSTRIES = [
  { value: "food", label: "Food" },
  { value: "saas", label: "SaaS" },
  { value: "consumer", label: "Consumer" },
  { value: "healthcare", label: "Healthcare" },
  { value: "fintech", label: "Fintech" },
  { value: "edtech", label: "EdTech" },
];

const STAGES = [
  { value: "ideation", label: "Ideation" },
  { value: "mvp", label: "MVP" },
  { value: "growth", label: "Growth" },
];

const SKILLS = [
  { value: "product", label: "Product" },
  { value: "operations", label: "Operations" },
  { value: "marketing", label: "Marketing" },
  { value: "sales", label: "Sales" },
  { value: "engineering", label: "Engineering" },
  { value: "design", label: "Design" },
];

const GOALS = [
  { value: "build_mvp", label: "Build MVP" },
  { value: "validate_demand", label: "Validate Demand" },
  { value: "register_entity", label: "Register Entity" },
  { value: "raise_funding", label: "Raise Funding" },
  { value: "hire_team", label: "Hire Team" },
];

interface FounderInfo {
  name: string;
  skills: string[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    startupName: "",
    industry: "",
    stage: "",
    founderCount: 1,
    founders: [{ name: "", skills: [] }] as FounderInfo[],
    domainPurchased: false,
    trademarkCompleted: false,
    entityRegistered: false,
    goals: [] as string[],
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (session?.user) {
        try {
          const token = localStorage.getItem("bearer_token");
          const response = await fetch("/api/startups", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const startups = await response.json();
            const hasCompletedOnboarding = startups.some((s: any) => s.onboardingCompleted);
            if (hasCompletedOnboarding) {
              router.push("/dashboard");
            }
          }
        } catch (error) {
          console.error("Failed to check onboarding status", error);
        }
      }
    };

    if (!isPending && session?.user) {
      checkOnboardingStatus();
    }
  }, [session, isPending, router]);

  // Pre-fill name from session
  useEffect(() => {
    if (session?.user?.name && !formData.fullName) {
      setFormData((prev) => ({
        ...prev,
        fullName: session.user.name,
        founders: [{ name: session.user.name, skills: [] }],
      }));
    }
  }, [session]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFounderCountChange = (count: number) => {
    const newFounders = [...formData.founders];
    if (count > newFounders.length) {
      // Add new founders
      for (let i = newFounders.length; i < count; i++) {
        newFounders.push({ name: "", skills: [] });
      }
    } else {
      // Remove excess founders
      newFounders.splice(count);
    }
    setFormData((prev) => ({
      ...prev,
      founderCount: count,
      founders: newFounders,
    }));
  };

  const handleFounderNameChange = (index: number, name: string) => {
    const newFounders = [...formData.founders];
    newFounders[index] = { ...newFounders[index], name };
    setFormData((prev) => ({ ...prev, founders: newFounders }));
  };

  const handleFounderSkillToggle = (index: number, skill: string) => {
    const newFounders = [...formData.founders];
    const currentSkills = newFounders[index].skills;
    if (currentSkills.includes(skill)) {
      newFounders[index] = {
        ...newFounders[index],
        skills: currentSkills.filter((s) => s !== skill),
      };
    } else {
      newFounders[index] = {
        ...newFounders[index],
        skills: [...currentSkills, skill],
      };
    }
    setFormData((prev) => ({ ...prev, founders: newFounders }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return (
          formData.fullName.trim() &&
          formData.startupName.trim() &&
          formData.industry &&
          formData.stage
        );
      case 1: // Founders count
        return formData.founderCount >= 1;
      case 2: // Team Details
        return formData.founders.every(
          (f) => f.name.trim() && f.skills.length > 0
        );
      case 3: // Progress - always can proceed
        return true;
      case 4: // Goals
        return formData.goals.length > 0;
      case 5: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");

      // Create startup with founding team
      const startupResponse = await fetch("/api/startups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          startupName: formData.startupName,
          industry: formData.industry,
          stage: formData.stage,
          founderCount: formData.founderCount,
          domainPurchased: formData.domainPurchased,
          trademarkCompleted: formData.trademarkCompleted,
          entityRegistered: formData.entityRegistered,
          goals: formData.goals,
          foundingTeam: formData.founders,
        }),
      });

      if (!startupResponse.ok) {
        const error = await startupResponse.json();
        throw new Error(error.error || "Failed to create startup");
      }

      toast.success("Your personalized blueprint is ready!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-blue-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <Rocket className="h-12 w-12 text-teal-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome to Startup CoPilot
          </h1>
          <p className="text-gray-600">
            Let's create your personalized legal + operational blueprint
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                      index <= currentStep
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-2 hidden text-xs sm:block ${
                      index <= currentStep
                        ? "font-medium text-teal-600"
                        : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 transition-all ${
                      index < currentStep ? "bg-teal-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {currentStep === 0 && <Building2 className="h-6 w-6 text-teal-600" />}
              {currentStep === 1 && <Users className="h-6 w-6 text-teal-600" />}
              {currentStep === 2 && <Users className="h-6 w-6 text-teal-600" />}
              {currentStep === 3 && <CheckSquare className="h-6 w-6 text-teal-600" />}
              {currentStep === 4 && <Target className="h-6 w-6 text-teal-600" />}
              {currentStep === 5 && <Rocket className="h-6 w-6 text-teal-600" />}
              <div>
                <CardTitle>{steps[currentStep]}</CardTitle>
                <CardDescription>
                  {currentStep === 0 && "Tell us about yourself and your startup"}
                  {currentStep === 1 && "How many founders are on your team?"}
                  {currentStep === 2 && "Tell us about each founder"}
                  {currentStep === 3 && "What have you completed so far?"}
                  {currentStep === 4 && "What are your primary goals?"}
                  {currentStep === 5 && "Review your information"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step 0: Basics */}
            {currentStep === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="e.g., John Doe"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startupName">Startup Name *</Label>
                  <Input
                    id="startupName"
                    placeholder="e.g., TechFlow AI"
                    value={formData.startupName}
                    onChange={(e) => handleInputChange("startupName", e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => handleInputChange("industry", value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stage">Stage *</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => handleInputChange("stage", value)}
                    disabled={loading}
                  >
                    <SelectTrigger id="stage">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stg) => (
                        <SelectItem key={stg.value} value={stg.value}>
                          {stg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Step 1: Number of Founders */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="founderCount">Number of Founders *</Label>
                  <Select
                    value={formData.founderCount.toString()}
                    onValueChange={(value) =>
                      handleFounderCountChange(parseInt(value))
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="founderCount">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "Founder" : "Founders"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-gray-500">
                  You'll provide details about each founder in the next step.
                </p>
              </div>
            )}

            {/* Step 2: Team Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                {formData.founders.map((founder, index) => (
                  <div
                    key={index}
                    className="space-y-4 rounded-lg border bg-gray-50 p-4"
                  >
                    <h4 className="font-medium text-gray-900">
                      Founder {index + 1}
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor={`founder-name-${index}`}>Name *</Label>
                      <Input
                        id={`founder-name-${index}`}
                        placeholder="Enter founder's name"
                        value={founder.name}
                        onChange={(e) =>
                          handleFounderNameChange(index, e.target.value)
                        }
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Skills * (select all that apply)</Label>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {SKILLS.map((skill) => (
                          <div
                            key={skill.value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`founder-${index}-skill-${skill.value}`}
                              checked={founder.skills.includes(skill.value)}
                              onCheckedChange={() =>
                                handleFounderSkillToggle(index, skill.value)
                              }
                              disabled={loading}
                            />
                            <Label
                              htmlFor={`founder-${index}-skill-${skill.value}`}
                              className="cursor-pointer text-sm font-normal"
                            >
                              {skill.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Progress */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Check all that you've already completed:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <Checkbox
                      id="domainPurchased"
                      checked={formData.domainPurchased}
                      onCheckedChange={(checked) =>
                        handleInputChange("domainPurchased", checked as boolean)
                      }
                      disabled={loading}
                    />
                    <div>
                      <Label
                        htmlFor="domainPurchased"
                        className="cursor-pointer font-medium"
                      >
                        Domain Purchased
                      </Label>
                      <p className="text-sm text-gray-500">
                        You've secured a domain name for your startup
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <Checkbox
                      id="trademarkCompleted"
                      checked={formData.trademarkCompleted}
                      onCheckedChange={(checked) =>
                        handleInputChange("trademarkCompleted", checked as boolean)
                      }
                      disabled={loading}
                    />
                    <div>
                      <Label
                        htmlFor="trademarkCompleted"
                        className="cursor-pointer font-medium"
                      >
                        Trademark Search Completed
                      </Label>
                      <p className="text-sm text-gray-500">
                        You've searched for trademark conflicts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border p-4">
                    <Checkbox
                      id="entityRegistered"
                      checked={formData.entityRegistered}
                      onCheckedChange={(checked) =>
                        handleInputChange("entityRegistered", checked as boolean)
                      }
                      disabled={loading}
                    />
                    <div>
                      <Label
                        htmlFor="entityRegistered"
                        className="cursor-pointer font-medium"
                      >
                        Business Entity Registered
                      </Label>
                      <p className="text-sm text-gray-500">
                        You've registered your LLC or Corporation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Goals */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Select your primary goals for the next 90 days:
                </p>
                <div className="space-y-3">
                  {GOALS.map((goal) => (
                    <div
                      key={goal.value}
                      className="flex items-center space-x-3 rounded-lg border p-4"
                    >
                      <Checkbox
                        id={goal.value}
                        checked={formData.goals.includes(goal.value)}
                        onCheckedChange={() => handleGoalToggle(goal.value)}
                        disabled={loading}
                      />
                      <Label
                        htmlFor={goal.value}
                        className="cursor-pointer font-medium"
                      >
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Startup Information
                  </h3>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Full Name:</dt>
                      <dd className="font-medium">{formData.fullName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Startup Name:</dt>
                      <dd className="font-medium">{formData.startupName}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Industry:</dt>
                      <dd className="font-medium capitalize">{formData.industry}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Stage:</dt>
                      <dd className="font-medium capitalize">{formData.stage}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Founding Team ({formData.founderCount})
                  </h3>
                  {formData.founders.map((founder, index) => (
                    <div key={index} className="mb-2 text-sm">
                      <span className="font-medium">{founder.name}</span>
                      <span className="text-gray-500">
                        {" "}
                        — {founder.skills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Current Progress
                  </h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      {formData.domainPurchased ? "✅" : "⬜"} Domain Purchased
                    </li>
                    <li className="flex items-center gap-2">
                      {formData.trademarkCompleted ? "✅" : "⬜"} Trademark Search Completed
                    </li>
                    <li className="flex items-center gap-2">
                      {formData.entityRegistered ? "✅" : "⬜"} Business Entity Registered
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Primary Goals
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {formData.goals.map((goal) => (
                      <li key={goal} className="flex items-center gap-2">
                        ✅ {GOALS.find((g) => g.value === goal)?.label}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border-2 border-teal-200 bg-teal-50 p-4">
                  <p className="text-sm text-teal-900">
                    <strong>Ready to launch!</strong> We'll generate a personalized legal + operational blueprint tailored to your {formData.industry} startup at the {formData.stage} stage.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="gap-2 bg-teal-600 hover:bg-teal-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2 bg-teal-600 hover:bg-teal-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating Blueprint...
                </>
              ) : (
                <>
                  Generate Blueprint
                  <Rocket className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}