"use client"

import { useEffect, useState } from 'react';
import { BookOpen, Search } from 'lucide-react';
import Header from '../../components/Header';
import PlaybookCard from '../../components/PlaybookCard';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { PlaybookArticle } from '../../lib/types';

export default function PlaybookPage() {
  const [loading, setLoading] = useState(true);
  const [articles, setArticles] = useState<PlaybookArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<PlaybookArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      // Fetch from static JSON file
      const response = await fetch('/sampleData.json');
      const data = await response.json();
      setArticles(data.playbook);
      setFilteredArticles(data.playbook);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...articles];

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredArticles(filtered);
  }, [searchQuery, categoryFilter, articles]);

  const categories = ['all', ...new Set(articles.map(a => a.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
            <p className="text-gray-600">Loading playbook...</p>
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
          <div className="mb-4 flex justify-center md:justify-start">
            <BookOpen className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Startup Playbook</h1>
          <p className="text-gray-600">
            Expert guides and articles to help you navigate every stage of your startup journey
          </p>
        </div>

        {/* Search & Filter */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <PlaybookCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                No articles match your search. Try adjusting your filters.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}