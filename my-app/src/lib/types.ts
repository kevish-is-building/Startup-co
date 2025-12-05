export interface Profile {
  id: string;
  companyName: string;
  industry: string;
  stage: string;
  founderCount: number;
  fundingGoal: string;
  currentState: string;
  goals: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  week: number;
  title: string;
  description: string;
  category: 'legal' | 'product' | 'marketing' | 'fundraising' | 'operations';
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  dependencies?: string[];
  resources?: string[];
  completed?: boolean;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  fileType: string;
  content: string;
}

export interface PlaybookArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: number;
  excerpt: string;
  content: string;
  tags: string[];
}

export interface BlueprintRule {
  condition: {
    stage?: string[];
    industry?: string[];
    fundingGoal?: string[];
    goals?: string[];
  };
  tasks: string[];
}

export interface MockData {
  sampleProfile: Profile;
  tasks: Task[];
  templates: Template[];
  playbook: PlaybookArticle[];
  blueprintRules: BlueprintRule[];
}
