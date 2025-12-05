"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../lib/auth-client";
import Header from "../../components/Header";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

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

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [loading, setLoading] = useState(false);
  const [startupLoading, setStartupLoading] = useState(false);
  
  // Profile Form Data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    image: "",
  });

  // Startup Form Data
  const [startupId, setStartupId] = useState<number | null>(null);
  const [startupData, setStartupData] = useState({
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

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    } else if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || "",
      });
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
          const startup = startups[0];
          setStartupId(startup.id);
          setStartupData({
            startupName: startup.startupName,
            industry: startup.industry,
            stage: startup.stage,
            founderCount: startup.founderCount,
            founders: startup.foundingTeam.map((f: any) => ({
              name: f.name,
              skills: Array.isArray(f.skills) ? f.skills : JSON.parse(f.skills || "[]"),
            })),
            domainPurchased: startup.domainPurchased,
            trademarkCompleted: startup.trademarkCompleted,
            entityRegistered: startup.entityRegistered,
            goals: Array.isArray(startup.goals) ? startup.goals : JSON.parse(startup.goals || "[]"),
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch startup data", error);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          image: profileData.image,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      await refetch();
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleStartupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startupId) return;
    
    setStartupLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/startups/${startupId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          startupName: startupData.startupName,
          industry: startupData.industry,
          stage: startupData.stage,
          founderCount: startupData.founderCount,
          foundingTeam: startupData.founders,
          domainPurchased: startupData.domainPurchased,
          trademarkCompleted: startupData.trademarkCompleted,
          entityRegistered: startupData.entityRegistered,
          goals: startupData.goals,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update startup details");
      }

      toast.success("Startup details updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setStartupLoading(false);
    }
  };

  // Startup Form Handlers
  const handleFounderCountChange = (count: number) => {
    const newFounders = [...startupData.founders];
    if (count > newFounders.length) {
      for (let i = newFounders.length; i < count; i++) {
        newFounders.push({ name: "", skills: [] });
      }
    } else {
      newFounders.splice(count);
    }
    setStartupData((prev) => ({
      ...prev,
      founderCount: count,
      founders: newFounders,
    }));
  };

  const handleFounderNameChange = (index: number, name: string) => {
    const newFounders = [...startupData.founders];
    newFounders[index] = { ...newFounders[index], name };
    setStartupData((prev) => ({ ...prev, founders: newFounders }));
  };

  const handleFounderSkillToggle = (index: number, skill: string) => {
    const newFounders = [...startupData.founders];
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
    setStartupData((prev) => ({ ...prev, founders: newFounders }));
  };

  const handleGoalToggle = (goal: string) => {
    setStartupData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto max-w-4xl py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>
        
        <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="startup">Startup Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email address cannot be changed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Profile Image URL</Label>
                  <Input
                    id="image"
                    value={profileData.image}
                    onChange={(e) =>
                      setProfileData({ ...profileData, image: e.target.value })
                    }
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="startup">
          <Card>
            <CardHeader>
              <CardTitle>Startup Details</CardTitle>
              <CardDescription>
                Update your startup information and progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!startupId ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No startup found. Please complete onboarding first.</p>
                  <Button 
                    className="mt-4 bg-teal-600 hover:bg-teal-700"
                    onClick={() => router.push("/onboarding")}
                  >
                    Go to Onboarding
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleStartupSubmit} className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="startupName">Startup Name</Label>
                        <Input
                          id="startupName"
                          value={startupData.startupName}
                          onChange={(e) =>
                            setStartupData({ ...startupData, startupName: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={startupData.industry}
                          onValueChange={(value) =>
                            setStartupData({ ...startupData, industry: value })
                          }
                        >
                          <SelectTrigger>
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
                        <Label htmlFor="stage">Stage</Label>
                        <Select
                          value={startupData.stage}
                          onValueChange={(value) =>
                            setStartupData({ ...startupData, stage: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Team */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Founding Team</h3>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleFounderCountChange(startupData.founderCount - 1)}
                          disabled={startupData.founderCount <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{startupData.founderCount}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleFounderCountChange(startupData.founderCount + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {startupData.founders.map((founder, index) => (
                        <div key={index} className="rounded-lg border p-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Founder {index + 1} Name</Label>
                            <Input
                              value={founder.name}
                              onChange={(e) => handleFounderNameChange(index, e.target.value)}
                              placeholder="Enter name"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Skills</Label>
                            <div className="flex flex-wrap gap-2">
                              {SKILLS.map((skill) => (
                                <div
                                  key={skill.value}
                                  className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-colors ${
                                    founder.skills.includes(skill.value)
                                      ? "bg-teal-100 text-teal-700 border-teal-200 border"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-transparent border"
                                  }`}
                                  onClick={() => handleFounderSkillToggle(index, skill.value)}
                                >
                                  {skill.label}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Progress & Legal</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="domain"
                          checked={startupData.domainPurchased}
                          onCheckedChange={(checked) =>
                            setStartupData({ ...startupData, domainPurchased: checked as boolean })
                          }
                        />
                        <Label htmlFor="domain">Domain name purchased</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="trademark"
                          checked={startupData.trademarkCompleted}
                          onCheckedChange={(checked) =>
                            setStartupData({ ...startupData, trademarkCompleted: checked as boolean })
                          }
                        />
                        <Label htmlFor="trademark">Trademark application filed</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="entity"
                          checked={startupData.entityRegistered}
                          onCheckedChange={(checked) =>
                            setStartupData({ ...startupData, entityRegistered: checked as boolean })
                          }
                        />
                        <Label htmlFor="entity">Business entity registered</Label>
                      </div>
                    </div>
                  </div>

                  {/* Goals */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Goals</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {GOALS.map((goal) => (
                        <div
                          key={goal.value}
                          className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors ${
                            startupData.goals.includes(goal.value)
                              ? "border-teal-600 bg-teal-50"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleGoalToggle(goal.value)}
                        >
                          <Checkbox
                            checked={startupData.goals.includes(goal.value)}
                            onCheckedChange={() => handleGoalToggle(goal.value)}
                          />
                          <span className="text-sm font-medium">{goal.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={startupLoading} className="bg-teal-600 hover:bg-teal-700">
                      {startupLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
