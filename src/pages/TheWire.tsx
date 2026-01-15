/**
 * The Wire - News Hub Page
 * 
 * Mobile-first news section featuring articles about cannabis industry,
 * research updates, and blockchain technology.
 */

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, ArrowRight, Newspaper, TrendingUp, FlaskConical, Link2 } from "lucide-react";
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

const categoryIcons: Record<string, typeof Newspaper> = {
  news: Newspaper,
  research: FlaskConical,
  blockchain: Link2,
  industry: TrendingUp,
  guide: Newspaper,
  stories: Newspaper,
};

const categoryColors: Record<string, string> = {
  news: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  research: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blockchain: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  industry: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  guide: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  stories: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
};

const TheWire = () => {
  const { t } = useTranslation('theWire');

  const { data: articles, isLoading } = useQuery({
    queryKey: ['articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data as Article[];
    }
  });

  const featuredArticle = articles?.find(a => a.is_featured);
  const latestArticles = articles?.filter(a => !a.is_featured) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageTransition>
      <SEOHead
        title="The Wire | Healing Buds"
        description="Inside news, updates, and insights from the forefront of regulated cannabis innovation and blockchain technology."
        keywords="cannabis news, medical cannabis updates, blockchain cannabis, Dr. Green NFT news"
      />
      
      <Header />
      
      <main className="min-h-screen pb-24 lg:pb-0">
        {/* Hero Section */}
        <section 
          className="pt-28 md:pt-36 pb-16 md:pb-20 text-white relative overflow-hidden"
          style={{ backgroundColor: 'hsl(var(--section-color))' }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                {t('hero.title')}
              </h1>
              <p className="font-body text-white/80 text-lg md:text-xl leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Article */}
        {isLoading ? (
          <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Skeleton className="h-8 w-32 mb-8" />
              <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="aspect-video rounded-xl" />
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-40" />
                </div>
              </div>
            </div>
          </section>
        ) : featuredArticle && (
          <section className="py-12 md:py-16 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Badge variant="outline" className="mb-8 text-primary border-primary">
                  {t('featured')}
                </Badge>
                
                <Link 
                  to={`/the-wire/${featuredArticle.slug}`}
                  className="group grid md:grid-cols-2 gap-8 items-center"
                >
                  <div className="relative aspect-video md:aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                    {featuredArticle.featured_image && (
                      <img
                        src={featuredArticle.featured_image}
                        alt={featuredArticle.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
                  </div>
                  
                  <div className="space-y-4">
                    <Badge className={cn("capitalize", categoryColors[featuredArticle.category] || categoryColors.news)}>
                      {featuredArticle.category}
                    </Badge>
                    
                    <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {featuredArticle.title}
                    </h2>
                    
                    <p className="font-body text-muted-foreground text-base md:text-lg line-clamp-3">
                      {featuredArticle.summary}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{featuredArticle.author}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(featuredArticle.published_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <span className="inline-flex items-center gap-2 text-primary font-medium">
                      {t('readArticle')}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            </div>
          </section>
        )}

        {/* Latest Updates Grid */}
        <section className="py-12 md:py-16" style={{ backgroundColor: 'hsl(var(--muted))' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8"
            >
              {t('latestUpdates')}
            </motion.h2>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-card rounded-xl overflow-hidden">
                    <Skeleton className="aspect-video" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {latestArticles.map((article) => {
                  const CategoryIcon = categoryIcons[article.category] || Newspaper;
                  return (
                    <motion.article
                      key={article.id}
                      variants={itemVariants}
                    >
                      <Link
                        to={`/the-wire/${article.slug}`}
                        className="group block bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 border border-border"
                      >
                        <div className="relative aspect-video bg-muted overflow-hidden">
                          {article.featured_image && (
                            <img
                              src={article.featured_image}
                              alt={article.title}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                          <div className="absolute top-3 left-3">
                            <Badge className={cn("capitalize flex items-center gap-1.5", categoryColors[article.category] || categoryColors.news)}>
                              <CategoryIcon className="w-3.5 h-3.5" />
                              {article.category}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="p-5">
                          <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {article.title}
                          </h3>
                          
                          <p className="font-body text-muted-foreground text-sm line-clamp-2 mb-4">
                            {article.summary}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(article.published_at), 'MMM d, yyyy')}
                            </span>
                            <span className="text-primary font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {t('readMore')}
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  );
                })}
              </motion.div>
            )}

            {!isLoading && latestArticles.length === 0 && (
              <div className="text-center py-12">
                <Newspaper className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No articles yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        <Footer />
      </main>

      <MobileBottomActions />
      <BackToTop />
    </PageTransition>
  );
};

export default TheWire;