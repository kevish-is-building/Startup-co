"use client"

import Link from 'next/link';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { PlaybookArticle } from '../lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from '../components/ui/badge';

interface PlaybookCardProps {
  article: PlaybookArticle;
}

export default function PlaybookCard({ article }: PlaybookCardProps) {
  return (
    <Card className="flex h-full flex-col transition-all hover:shadow-md">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="outline" className="bg-teal-50 text-teal-700">
            {article.category}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            {article.readTime} min
          </span>
        </div>
        <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
        <CardDescription className="mt-2">{article.excerpt}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/playbook/${article.slug}`} className="w-full">
          <Button variant="outline" className="w-full gap-2 hover:bg-teal-50 hover:text-teal-700">
            <BookOpen className="h-4 w-4" />
            Read Article
            <ArrowRight className="ml-auto h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
