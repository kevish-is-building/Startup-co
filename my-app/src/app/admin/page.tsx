"use client"

import { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../hooks/use-toast';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [rulesJson, setRulesJson] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadRules = async () => {
      // Check for custom rules first
      const customRules = localStorage.getItem('startup_copilot_custom_rules');
      
      if (customRules) {
        setRulesJson(customRules);
      } else {
        // Load default rules from static file
        const response = await fetch('/sampleData.json');
        const data = await response.json();
        setRulesJson(JSON.stringify(data.blueprintRules, null, 2));
      }
      
      setLoading(false);
    };

    loadRules();
  }, []);

  const validateAndSave = () => {
    setError('');
    
    try {
      const parsed = JSON.parse(rulesJson);
      
      // Basic validation
      if (!Array.isArray(parsed)) {
        throw new Error('Rules must be an array');
      }

      // Save to localStorage
      localStorage.setItem('startup_copilot_custom_rules', rulesJson);
      
      toast({
        title: 'Rules Saved',
        description: 'Blueprint generation rules have been updated successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON format';
      setError(errorMessage);
      toast({
        title: 'Save Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const resetToDefaults = async () => {
    const response = await fetch('/sampleData.json');
    const data = await response.json();
    setRulesJson(JSON.stringify(data.blueprintRules, null, 2));
    localStorage.removeItem('startup_copilot_custom_rules');
    setError('');
    
    toast({
      title: 'Reset Complete',
      description: 'Rules have been reset to default values.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            <p className="text-gray-600">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center md:justify-start">
            <Settings className="h-12 w-12 text-gray-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">
            Edit blueprint generation rules (stored in localStorage)
          </p>
        </div>

        {/* Warning */}
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Developer Tool:</strong> This admin panel allows you to customize the 
              rule engine that generates personalized blueprints. Changes are saved to localStorage 
              and will affect blueprint generation for all profiles.
            </p>
          </CardContent>
        </Card>

        {/* Rules Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Blueprint Generation Rules</CardTitle>
            <CardDescription>
              Rules are evaluated against user profiles to determine which tasks to include in their blueprint
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Rules JSON
              </label>
              <Textarea
                value={rulesJson}
                onChange={(e) => setRulesJson(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Enter rules JSON..."
              />
              {error && (
                <p className="text-sm text-red-600">
                  Error: {error}
                </p>
              )}
            </div>

            {/* Rule Structure Help */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-4">
                <h4 className="mb-2 text-sm font-semibold text-blue-900">Rule Structure:</h4>
                <pre className="overflow-x-auto text-xs text-blue-800">
{`{
  "condition": {
    "stage": ["idea", "concept"],
    "industry": ["SaaS"],
    "fundingGoal": ["seed"],
    "goals": ["build_mvp"]
  },
  "tasks": ["task-1", "task-2"]
}`}
                </pre>
                <p className="mt-2 text-xs text-blue-800">
                  Multiple conditions are AND logic. Within arrays, it's OR logic.
                </p>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={validateAndSave}
                className="gap-2 bg-teal-600 hover:bg-teal-700"
              >
                <Save className="h-4 w-4" />
                Save Rules
              </Button>
              
              <Button
                onClick={resetToDefaults}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p>
              1. <strong>Rules are evaluated</strong> when a user completes onboarding
            </p>
            <p>
              2. <strong>Conditions are matched</strong> against the user's profile (stage, industry, goals, etc.)
            </p>
            <p>
              3. <strong>Tasks are aggregated</strong> from all matching rules
            </p>
            <p>
              4. <strong>Blueprint is generated</strong> with the selected tasks, organized by week
            </p>
            <p className="mt-4 rounded-lg bg-gray-100 p-3">
              💡 <strong>Tip:</strong> To test changes, create a new profile through the onboarding flow. 
              Existing blueprints won't be affected.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}