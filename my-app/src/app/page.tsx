import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Rocket, CheckCircle2, Target, BookOpen, FileText, Scale } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <Rocket className="h-20 w-20 text-teal-600" />
          </div>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Startup <span className="text-teal-600">CoPilot</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Your AI-powered guide from idea to execution in 90 days. Get a personalized blueprint, 
            legal templates, and expert playbooks to launch your startup successfully.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/onboarding">
              <Button size="lg" className="gap-2 bg-teal-600 px-8 py-6 text-lg hover:bg-teal-700">
                <Rocket className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
            <Link href="/playbook">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Explore Playbook
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-teal-100">
              <Target className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Personalized Blueprint</h3>
            <p className="text-gray-600">
              Get a customized 90-day roadmap based on your industry, stage, and goals. Know exactly 
              what to do next.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <CheckCircle2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Task Management</h3>
            <p className="text-gray-600">
              Track your progress with week-by-week tasks. Mark items complete and watch your 
              startup take shape.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Scale className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Legal Toolkit</h3>
            <p className="text-gray-600">
              Access essential legal documents and checklists. From incorporation to founder 
              agreements.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Template Library</h3>
            <p className="text-gray-600">
              Download ready-to-use templates for pitch decks, SAFEs, NDAs, and more. Save time 
              on paperwork.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <BookOpen className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Expert Playbook</h3>
            <p className="text-gray-600">
              Learn from in-depth guides on product, fundraising, legal, and growth topics. 
              Knowledge at your fingertips.
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <Rocket className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">90-Day Focus</h3>
            <p className="text-gray-600">
              Built on proven startup methodologies. Execute fast, iterate quickly, and build 
              momentum.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 rounded-2xl bg-teal-600 px-8 py-12 text-center text-white shadow-xl">
          <h2 className="mb-4 text-3xl font-bold">Ready to Launch Your Startup?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-teal-100">
            Join founders who are turning ideas into reality with Startup CoPilot. 
            Get your personalized blueprint in minutes.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="gap-2 bg-white px-8 py-6 text-lg text-teal-600 hover:bg-gray-100">
              <Rocket className="h-5 w-5" />
              Start Your Journey
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>© 2024 Startup CoPilot. A prototype for founder success.</p>
        </div>
      </div>
    </div>
  );
}