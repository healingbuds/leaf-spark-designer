import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import { Microscope, FileText, Award, Users, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import researchLabImage from "@/assets/research-lab-hq.jpg";
import conditionAnxiety from "@/assets/condition-anxiety.jpg";
import conditionChronicPain from "@/assets/condition-chronic-pain.jpg";
import conditionArthritis from "@/assets/condition-arthritis.jpg";
import conditionBackPain from "@/assets/condition-back-pain.jpg";
import conditionCRPS from "@/assets/condition-crps.jpg";
import conditionEpilepsy from "@/assets/condition-epilepsy.jpg";
import conditionInsomnia from "@/assets/condition-insomnia.jpg";
import conditionMigraines from "@/assets/condition-migraines.jpg";
import conditionMS from "@/assets/condition-ms.jpg";
import conditionNeuropathicPain from "@/assets/condition-neuropathic-pain.jpg";
import conditionParkinsons from "@/assets/condition-parkinsons.jpg";
import conditionPTSD from "@/assets/condition-ptsd.jpg";

const Research = () => {
  const { t } = useTranslation('research');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoryKeys = ["all", "painManagement", "mentalHealth", "neurological", "sleepDisorders"];

  const conditionsByCategory = {
    painManagement: [
      { id: "chronic-pain", nameKey: "chronicPain", image: conditionChronicPain },
      { id: "arthritis", nameKey: "arthritis", image: conditionArthritis },
      { id: "back-pain", nameKey: "backPain", image: conditionBackPain },
      { id: "complex-regional-pain-syndrome", nameKey: "crps", image: conditionCRPS },
      { id: "migraines", nameKey: "migraines", image: conditionMigraines },
      { id: "neuropathic-pain", nameKey: "neuropathicPain", image: conditionNeuropathicPain },
    ],
    mentalHealth: [
      { id: "anxiety", nameKey: "anxiety", image: conditionAnxiety },
      { id: "ptsd", nameKey: "ptsd", image: conditionPTSD },
    ],
    neurological: [
      { id: "epilepsy", nameKey: "epilepsy", image: conditionEpilepsy },
      { id: "multiple-sclerosis", nameKey: "multipleSclerosis", image: conditionMS },
      { id: "parkinsons-disease", nameKey: "parkinsons", image: conditionParkinsons },
    ],
    sleepDisorders: [
      { id: "insomnia", nameKey: "insomnia", image: conditionInsomnia },
    ],
  };

  // Flatten all conditions with their categories for filtering
  const allConditions = Object.entries(conditionsByCategory).flatMap(([categoryKey, conditions]) =>
    conditions.map(condition => ({ 
      ...condition, 
      categoryKey,
      name: t(`conditionNames.${condition.nameKey}`),
      category: t(`categories.${categoryKey}`)
    }))
  );

  // Filter conditions based on search and category
  const filteredConditions = allConditions.filter((condition) => {
    const matchesSearch = condition.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || condition.categoryKey === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered conditions by category
  const filteredByCategory = filteredConditions.reduce((acc, condition) => {
    if (!acc[condition.categoryKey]) {
      acc[condition.categoryKey] = [];
    }
    acc[condition.categoryKey].push(condition);
    return acc;
  }, {} as Record<string, typeof allConditions>);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
      <main className="pt-28 md:pt-32">
        {/* Hero Section - Linear style */}
        <section className="bg-background py-16 md:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="max-w-5xl">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                  {t('hero.title')}
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl font-light">
                  {t('hero.subtitle')}
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Hero Image */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-20">
          <div className="relative h-[400px] md:h-[500px] overflow-hidden rounded-xl border border-border/30">
            <img 
              src={researchLabImage} 
              alt="Research laboratory with cannabis testing" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />
          </div>
        </section>

        {/* Main Content - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
                  {t('essentialResearch.title')}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-6">
                  {t('essentialResearch.paragraph1')}
                </p>
                <p className="text-base md:text-lg text-muted-foreground/80 leading-relaxed mb-16">
                  {t('essentialResearch.paragraph2')}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-16">
                <div className="card-linear p-7 hover-lift">
                  <Microscope className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{t('cards.clinicalTrials.title')}</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">
                    {t('cards.clinicalTrials.description')}
                  </p>
                </div>
                <div className="card-linear p-7 hover-lift">
                  <FileText className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{t('cards.publications.title')}</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">
                    {t('cards.publications.description')}
                  </p>
                </div>
                <div className="card-linear p-7 hover-lift">
                  <Award className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{t('cards.recognition.title')}</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">
                    {t('cards.recognition.description')}
                  </p>
                </div>
                <div className="card-linear p-7 hover-lift">
                  <Users className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">{t('cards.collaboration.title')}</h3>
                  <p className="text-muted-foreground/80 leading-relaxed text-sm">
                    {t('cards.collaboration.description')}
                  </p>
                </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Eligible Conditions by Category */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center mb-6 tracking-tight">
                {t('conditions.title')}
              </h2>
              <p className="text-lg text-muted-foreground/80 text-center max-w-3xl mx-auto mb-12">
                {t('conditions.subtitle')}
              </p>
            </ScrollAnimation>

            {/* Search and Filter */}
            <div className="max-w-4xl mx-auto mb-12 space-y-6">
              <ScrollAnimation>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={t('conditions.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 text-base bg-card border-border/50 focus:border-primary"
                  />
                </div>
              </ScrollAnimation>

              <ScrollAnimation>
                <div className="flex flex-wrap gap-3 justify-center">
                  {categoryKeys.map((categoryKey) => (
                    <button
                      key={categoryKey}
                      onClick={() => setSelectedCategory(categoryKey)}
                      className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                        selectedCategory === categoryKey
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-card text-foreground hover:bg-muted border border-border/50"
                      }`}
                    >
                      {t(`categories.${categoryKey}`)}
                    </button>
                  ))}
                </div>
              </ScrollAnimation>
            </div>
            
            {/* Conditions Grid */}
            {filteredConditions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground">
                  {t('conditions.noResults')}
                </p>
              </div>
            ) : (
              <div className="space-y-16 max-w-7xl mx-auto">
                {Object.entries(filteredByCategory).map(([categoryKey, conditions]) => (
                  <div key={categoryKey}>
                    <ScrollAnimation>
                      <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-8 tracking-tight">
                        {t(`categories.${categoryKey}`)}
                      </h3>
                    </ScrollAnimation>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {conditions.map((condition, index) => (
                        <ScrollAnimation key={condition.id} delay={index * 0.05}>
                          <Link
                            to={`/conditions/${condition.id}`}
                            className="group relative block h-[280px] rounded-2xl overflow-hidden"
                          >
                            {/* Background Image */}
                            <img
                              src={condition.image}
                              alt={condition.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            
                            {/* Content */}
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                              <div className="transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                                <span className="inline-block px-3 py-1 text-xs font-medium bg-white/10 backdrop-blur-sm text-white/90 rounded-full mb-3 border border-white/10">
                                  {condition.category}
                                </span>
                                <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">
                                  {condition.name}
                                </h3>
                                <div className="flex items-center text-white/70 text-sm font-medium group-hover:text-white transition-colors">
                                  <span>{t('conditions.learnMore')}</span>
                                  <svg className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            {/* Border glow on hover */}
                            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-primary/50 transition-all duration-300" />
                          </Link>
                        </ScrollAnimation>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <ScrollAnimation>
              <div className="mt-20 text-center">
                <p className="text-lg text-muted-foreground/80 mb-6">
                  {t('conditions.notListed')}
                </p>
                <Link to="/contact">
                  <button className="btn-primary px-8 py-3 text-lg">
                    {t('conditions.contactUs')} →
                  </button>
                </Link>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* CTA - Linear style */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6 tracking-tight">
              {t('cta.title')}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground/80 max-w-3xl mx-auto mb-10">
              {t('cta.subtitle')}
            </p>
            <Link to="/contact">
              <button className="btn-primary px-7 py-3">
                {t('cta.button')} →
              </button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTop />
      </div>
    </PageTransition>
  );
};

export default Research;
