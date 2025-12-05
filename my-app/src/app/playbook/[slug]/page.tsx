"use client"

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, Tag } from 'lucide-react';
import Header from '../../../components/Header';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { PlaybookArticle } from '../../../lib/types';

export default function PlaybookArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<PlaybookArticle | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      const slug = params.slug as string;
      
      // Fetch from static JSON file
      const response = await fetch('/sampleData.json');
      const data = await response.json();
      const articleData = data.playbook.find((a: PlaybookArticle) => a.slug === slug);
      
      if (!articleData) {
        router.push('/playbook');
        return;
      }

      setArticle(articleData);
      setLoading(false);
    };

    loadArticle();
  }, [params.slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            <p className="text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/playbook">
          <Button variant="ghost" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Playbook
          </Button>
        </Link>

        {/* Article Header */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="bg-teal-50 text-teal-700">
                {article.category}
              </Badge>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                {article.readTime} min read
              </span>
            </div>

            <h1 className="mb-4 text-4xl font-bold text-gray-900">{article.title}</h1>
            <p className="text-lg text-gray-600">{article.excerpt}</p>

            {article.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-gray-400" />
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Article Content */}
        <Card>
          <CardContent className="prose prose-gray max-w-none pt-8">
            {/* Render markdown-style content */}
            <div 
              className="article-content space-y-6"
              dangerouslySetInnerHTML={{
                __html: article.content
                  .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-gray-900 mb-4">$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-gray-900 mt-8 mb-3">$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold text-gray-900 mt-6 mb-2">$1</h3>')
                  .replace(/^\*\*(.+)\*\*$/gim, '<p class="font-semibold text-gray-900">$1</p>')
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/^- (.+)$/gim, '<li class="ml-4">$1</li>')
                  .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed">')
                  .replace(/^(?!<[hl])/gim, '<p class="text-gray-700 leading-relaxed">')
                  .replace(/(?<![>])$/gim, '</p>')
              }}
            />
          </CardContent>
        </Card>

        {/* Related Articles CTA */}
        <Card className="mt-8 border-teal-200 bg-teal-50">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div>
              <h3 className="mb-1 font-semibold text-gray-900">Want to learn more?</h3>
              <p className="text-sm text-gray-600">
                Explore more articles in the Startup Playbook
              </p>
            </div>
            <Link href="/playbook">
              <Button className="gap-2 bg-teal-600 hover:bg-teal-700">
                <BookOpen className="h-4 w-4" />
                View All Articles
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}