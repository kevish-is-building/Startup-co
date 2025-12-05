"use client"

import { useState } from 'react';
import { Scale, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import Header from '../../components/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import Link from 'next/link';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  links?: { label: string; href: string }[];
}

const legalChecklist: ChecklistItem[] = [
  {
    id: 'entity',
    title: 'Choose Business Entity Structure',
    description: 'Decide between LLC, C-Corp, or S-Corp based on your goals',
    links: [
      { label: 'Read Guide', href: '/playbook/choosing-business-entity' },
      { label: 'Download Template', href: '/templates' },
    ],
  },
  {
    id: 'register',
    title: 'Register Your Business',
    description: 'File formation documents with your state and obtain EIN',
    links: [
      { label: 'Certificate Template', href: '/templates' },
    ],
  },
  {
    id: 'founders',
    title: 'Execute Founders\' Agreement',
    description: 'Define equity split, vesting, roles, and decision-making',
    links: [
      { label: 'Read Guide', href: '/playbook/founders-agreement' },
      { label: 'Download Template', href: '/templates' },
    ],
  },
  {
    id: 'ip',
    title: 'Assign Intellectual Property',
    description: 'Ensure all IP is properly assigned to the company',
  },
  {
    id: '83b',
    title: 'File 83(b) Elections',
    description: 'Submit within 30 days of stock grant to minimize taxes',
  },
  {
    id: 'bank',
    title: 'Open Business Bank Account',
    description: 'Separate personal and business finances',
  },
  {
    id: 'accounting',
    title: 'Set Up Bookkeeping & Accounting',
    description: 'Implement proper financial tracking from day one',
  },
  {
    id: 'equity',
    title: 'Set Up Equity Management',
    description: 'Use cap table software to track ownership',
  },
  {
    id: 'insurance',
    title: 'Get Business Insurance',
    description: 'Consider D&O insurance and general liability',
  },
  {
    id: 'compliance',
    title: 'Understand Compliance Requirements',
    description: 'Research industry-specific regulations and filing requirements',
  },
];

export default function LegalPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const completedCount = checkedItems.size;
  const totalCount = legalChecklist.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center md:justify-start">
            <Scale className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Legal Toolkit</h1>
          <p className="text-gray-600">
            Essential legal steps and documents for your startup journey
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
            <CardDescription>
              {completedCount} of {totalCount} items completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-3 bg-purple-600 transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{completionPercentage}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-900">
              <strong>⚠️ Important:</strong> This toolkit provides general guidance and templates for 
              educational purposes. Always consult with qualified legal and tax professionals for 
              advice specific to your situation.
            </p>
          </CardContent>
        </Card>

        {/* Checklist */}
        <div className="space-y-4">
          {legalChecklist.map((item, index) => {
            const isChecked = checkedItems.has(item.id);
            
            return (
              <Card key={item.id} className={`transition-all ${isChecked ? 'opacity-60' : ''}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-6 items-center">
                      <Checkbox
                        id={item.id}
                        checked={isChecked}
                        onCheckedChange={() => toggleItem(item.id)}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
                          {index + 1}
                        </span>
                        <h3 className={`text-lg font-semibold ${isChecked ? 'line-through' : ''}`}>
                          {item.title}
                        </h3>
                      </div>
                      
                      <p className="mb-3 text-sm text-gray-600">{item.description}</p>
                      
                      {item.links && item.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.links.map((link) => (
                            <Link key={link.label} href={link.href}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1 text-xs"
                              >
                                {link.label}
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {isChecked ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resources Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold text-gray-900">Recommended Reading</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <Link href="/playbook" className="text-teal-600 hover:underline">Startup Playbook Articles</Link></li>
                <li>• <Link href="/templates" className="text-teal-600 hover:underline">Legal Document Templates</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-2 font-semibold text-gray-900">Online Resources</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Clerky - Incorporation and legal paperwork automation</li>
                <li>• Stripe Atlas - Startup formation and banking</li>
                <li>• Carta - Cap table management</li>
                <li>• Cooley GO - Free startup legal resources</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
