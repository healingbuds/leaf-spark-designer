/**
 * Research & Development Page
 * 
 * Mobile-first page showcasing research partnerships, clinical trials,
 * and conditions treated with medical cannabis.
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Search, FlaskConical, BookOpen, Award, Users, ArrowRight } from "lucide-react";

import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";
import Header from "@/layout/Header";
import MobileBottomActions from "@/components/MobileBottomActions";
import BackToTop from "@/components/BackToTop";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import researchLabImg from "@/assets/research-lab-hq.jpg";
import chronicPainImg from "@/assets/condition-chronic-pain.jpg";
import arthritisImg from "@/assets/condition-arthritis.jpg";
import backPainImg from "@/assets/condition-back-pain.jpg";
import crpsImg from "@/assets/condition-crps.jpg";
import migrainesImg from "@/assets/condition-migraines.jpg";
import neuropathicPainImg from "@/assets/condition-neuropathic-pain.jpg";
import anxietyImg from "@/assets/condition-anxiety.jpg";
import ptsdImg from "@/assets/condition-ptsd.jpg";
import epilepsyImg from "@/assets/condition-epilepsy.jpg";
import msImg from "@/assets/condition-ms.jpg";
import parkinsonsImg from "@/assets/condition-parkinsons.jpg";
import insomniaImg from "@/assets/condition-insomnia.jpg";

// Condition categories and data
type ConditionCategory = 'all' | 'painManagement' | 'mentalHealth' | 'neurological' | 'sleepDisorders';

interface Condition {
  id: string;
  nameKey: string;
  image: string;
  category: ConditionCategory[];
}

const conditions: Condition[] = [
  { id: 'chronic-pain', nameKey: 'chronicPain', image: chronicPainImg, category: ['painManagement'] },
  { id: 'arthritis', nameKey: 'arthritis', image: arthritisImg, category: ['painManagement'] },
  { id: 'back-pain', nameKey: 'backPain', image: backPainImg, category: ['painManagement'] },
  { id: 'crps', nameKey: 'crps', image: crpsImg, category: ['painManagement'] },
  { id: 'migraines', nameKey: 'migraines', image: migrainesImg, category: ['painManagement'] },
  { id: 'neuropathic-pain', nameKey: 'neuropathicPain', image: neuropathicPainImg, category: ['painManagement', 'neurological'] },
  { id: 'anxiety', nameKey: 'anxiety', image: anxietyImg, category: ['mentalHealth'] },
  { id: 'ptsd', nameKey: 'ptsd', image: ptsdImg, category: ['mentalHealth'] },
  { id: 'epilepsy', nameKey: 'epilepsy', image: epilepsyImg, category: ['neurological'] },
  { id: 'multiple-sclerosis', nameKey: 'multipleSclerosis', image: msImg, category: ['neurological'] },
  { id: 'parkinsons', nameKey: 'parkinsons', image: parkinsonsImg, category: ['neurological'] },
  { id: 'insomnia', nameKey: 'insomnia', image: insomniaImg, category: ['sleepDisorders', 'mentalHealth'] },
];

const researchCards = [
  { icon: FlaskConical, titleKey: 'clinicalTrials', descKey: 'clinicalTrials' },
  { icon: BookOpen, titleKey: 'publications', descKey: 'publications' },
  { icon: Award, titleKey: 'recognition', descKey: 'recognition' },
  { icon: Users, titleKey: 'collaboration', descKey: 'collaboration' },
];

const Research = () => {
  const { t } = useTranslation('research');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ConditionCategory>('all');

  const categories: { key: ConditionCategory; labelKey: string }[] = [
    { key: 'all', labelKey: 'all' },
    { key: 'painManagement', labelKey: 'painManagement' },
    { key: 'mentalHealth', labelKey: 'mentalHealth' },
    { key: 'neurological', labelKey: 'neurological' },
    { key: 'sleepDisorders', labelKey: 'sleepDisorders' },
  ];

  const filteredConditions = useMemo(() => {
    return conditions.filter(condition => {
      const name = t(`conditionNames.${condition.nameKey}`);
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'all' || condition.category.includes(activeCategory);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, t]);

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
        title="Research & Development | Healing Buds"
        description="Advancing cannabis science through rigorous research and clinical trials. Learn about our partnerships with leading institutions."
        keywords="medical cannabis research, clinical trials, cannabis science, cannabinoid research"
      />
      
      <Header />
      
      <main className="min-h-screen pb-24 lg:pb-0">
        {/* Hero Section */}
        <PageHero
          title={t('hero.title')}
          subtitle={t('hero.subtitle')}
          image={researchLabImg}
          imageAlt="Research laboratory"
          variant="overlay"
          imageHeight="md"
          showAnimatedGlow
        />

        {/* Essential Research Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8">
                {t('essentialResearch.title')}
              </h2>
              <p className="font-body text-muted-foreground text-lg md:text-xl leading-relaxed mb-6">
                {t('essentialResearch.paragraph1')}
              </p>
              <p className="font-body text-muted-foreground text-lg md:text-xl leading-relaxed">
                {t('essentialResearch.paragraph2')}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Research Cards Grid */}
        <section className="py-16 md:py-20" style={{ backgroundColor: 'hsl(var(--muted))' }}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {researchCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.titleKey}
                    variants={itemVariants}
                    className="bg-card rounded-xl p-6 md:p-8 shadow-lg border border-border hover:shadow-xl transition-shadow duration-300"
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                      {t(`cards.${card.titleKey}.title`)}
                    </h3>
                    <p className="font-body text-muted-foreground text-sm leading-relaxed">
                      {t(`cards.${card.descKey}.description`)}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Conditions We Treat Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                {t('conditions.title')}
              </h2>
              <p className="font-body text-muted-foreground text-lg max-w-2xl mx-auto">
                {t('conditions.subtitle')}
              </p>
            </motion.div>

            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto mb-10">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t('conditions.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      "touch-manipulation min-h-[44px]",
                      activeCategory === cat.key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {t(`categories.${cat.labelKey}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditions Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredConditions.length > 0 ? (
                filteredConditions.map((condition) => (
                  <motion.div
                    key={condition.id}
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-muted"
                  >
                    <img
                      src={condition.image}
                      alt={t(`conditionNames.${condition.nameKey}`)}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-4">
                      <h3 className="font-display text-white font-semibold text-base md:text-lg mb-1">
                        {t(`conditionNames.${condition.nameKey}`)}
                      </h3>
                      <Link
                        to={`/conditions#${condition.id}`}
                        className="text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1"
                      >
                        {t('conditions.learnMore')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">{t('conditions.noResults')}</p>
                </div>
              )}
            </motion.div>

            {/* Not Listed CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-muted-foreground mb-4">{t('conditions.notListed')}</p>
              <Button asChild>
                <Link to="/support">{t('conditions.contactUs')}</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-16 md:py-24 text-white"
          style={{ backgroundColor: 'hsl(var(--section-color))' }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                {t('cta.title')}
              </h2>
              <p className="font-body text-white/80 text-lg mb-8 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-[hsl(var(--section-color))] hover:bg-white/90"
              >
                <Link to="/support">{t('cta.button')}</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>

      <MobileBottomActions />
      <BackToTop />
    </PageTransition>
  );
};

export default Research;