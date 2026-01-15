/**
 * Article Detail Page
 * 
 * Mobile-first individual article view with markdown-style content rendering.
 */

import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowLeft, User, ArrowRight, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import SEOHead from "@/components/SEOHead";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import Header from "@/layout/Header";
import MobileBottomActions from "@/components/MobileBottomActions";
import BackToTop from "@/components/BackToTop";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string | null;
  category: string;
  author: string;
  is_featured: boolean;
  published_at: string;
}

const categoryColors: Record<string, string> = {
  news: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  research: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blockchain: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  industry: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  guide: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  stories: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

// Simple markdown-like content renderer
const renderContent = (content: string) => {
  const lines = content.split('\n');
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  const flushList = () => {
    if (listItems.length > 0) {
      const ListTag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <ListTag 
          key={`list-${elements.length}`} 
          className={cn(
            "my-4 space-y-2 text-foreground/90",
            listType === 'ol' ? "list-decimal" : "list-disc",
            "pl-6"
          )}
        >
          {listItems.map((item, i) => (
            <li key={i} className="font-body leading-relaxed">{item}</li>
          ))}
        </ListTag>
      );
      listItems = [];
      inList = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Handle list items
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        flushList();
        listType = 'ul';
        inList = true;
      }
      listItems.push(trimmed.slice(2));
      return;
    }
    
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList) {
        flushList();
        listType = 'ol';
        inList = true;
      }
      listItems.push(trimmed.replace(/^\d+\.\s/, ''));
      return;
    }

    // Flush any pending list
    flushList();

    // Empty line
    if (!trimmed) {
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
          {trimmed.slice(4)}
        </h3>
      );
      return;
    }
    
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="font-display text-2xl font-bold text-foreground mt-10 mb-6">
          {trimmed.slice(3)}
        </h2>
      );
      return;
    }

    // Blockquotes
    if (trimmed.startsWith('> ')) {
      elements.push(
        <blockquote 
          key={index} 
          className="my-6 pl-6 border-l-4 border-primary/50 italic text-foreground/80 font-body"
        >
          {trimmed.slice(2)}
        </blockquote>
      );
      return;
    }

    // Bold text handling
    let processedLine = trimmed;
    processedLine = processedLine.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Regular paragraph
    elements.push(
      <p 
        key={index} 
        className="font-body text-foreground/90 leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: processedLine }}
      />
    );
  });

  // Flush any remaining list
  flushList();

  return elements;
};

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('theWire');

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as Article;
    },
    enabled: !!slug
  });

  const { data: relatedArticles } = useQuery({
    queryKey: ['related-articles', article?.category, article?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('category', article!.category)
        .neq('id', article!.id)
        .order('published_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data as Article[];
    },
    enabled: !!article
  });

  if (error) {
    return (
      <PageTransition>
        <Header />
        <main className="min-h-screen flex items-center justify-center pb-24 lg:pb-0">
          <div className="text-center px-4">
            <h1 className="font-display text-3xl font-bold text-foreground mb-4">
              {t('articleNotFound.title')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('articleNotFound.description')}
            </p>
            <Button onClick={() => navigate('/the-wire')}>
              {t('articleNotFound.backButton')}
            </Button>
          </div>
        </main>
        <Footer />
        <MobileBottomActions />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SEOHead
        title={article ? `${article.title} | The Wire` : 'Loading... | The Wire'}
        description={article?.summary || 'Loading article...'}
        ogImage={article?.featured_image || undefined}
      />
      
      <Header />
      
      <main className="min-h-screen pb-24 lg:pb-0">
        {/* Back Link */}
        <div className="pt-24 md:pt-28 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/the-wire"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToWire')}
            </Link>
          </div>
        </div>

        {isLoading ? (
          <article className="py-8 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <Skeleton className="h-8 w-24 mb-6" />
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-3/4 mb-6" />
              <div className="flex gap-4 mb-8">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="aspect-video rounded-xl mb-10" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          </article>
        ) : article && (
          <>
            {/* Article Header */}
            <article className="py-8 bg-background">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className={cn("capitalize mb-6", categoryColors[article.category] || categoryColors.news)}>
                    {article.category}
                  </Badge>
                  
                  <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                    {article.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {article.author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(article.published_at), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  
                  {/* Featured Image */}
                  {article.featured_image && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mb-10">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Summary */}
                  <p className="font-body text-lg text-foreground/80 leading-relaxed mb-10 border-l-4 border-primary pl-6">
                    {article.summary}
                  </p>
                  
                  {/* Content */}
                  <div className="prose-custom">
                    {renderContent(article.content)}
                  </div>
                </motion.div>
              </div>
            </article>

            {/* Related Articles */}
            {relatedArticles && relatedArticles.length > 0 && (
              <section className="py-12 md:py-16" style={{ backgroundColor: 'hsl(var(--muted))' }}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8">
                    {t('moreFromWire')}
                  </h2>
                  
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        to={`/the-wire/${related.slug}`}
                        className="group block bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-border"
                      >
                        <div className="relative aspect-video bg-muted overflow-hidden">
                          {related.featured_image && (
                            <img
                              src={related.featured_image}
                              alt={related.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                        </div>
                        
                        <div className="p-5">
                          <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {related.title}
                          </h3>
                          
                          <span className="text-primary text-sm font-medium flex items-center gap-1">
                            {t('readMore')}
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        <Footer />
      </main>

      <MobileBottomActions />
      <BackToTop />
    </PageTransition>
  );
};

export default ArticleDetail;