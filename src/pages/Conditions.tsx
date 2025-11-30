import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import ScrollAnimation from "@/components/ScrollAnimation";
import BackToTop from "@/components/BackToTop";
import { Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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

const Conditions = () => {
  const { t } = useTranslation('conditions');
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categoryKeys = ["all", "painManagement", "mentalHealth", "neurological", "sleepDisorders"];

  const conditionsData = [
    { 
      id: "anxiety", 
      nameKey: "anxiety", 
      image: conditionAnxiety,
      categoryKey: "mentalHealth"
    },
    { 
      id: "chronic-pain", 
      nameKey: "chronicPain", 
      image: conditionChronicPain,
      categoryKey: "painManagement"
    },
    { 
      id: "arthritis", 
      nameKey: "arthritis", 
      image: conditionArthritis,
      categoryKey: "painManagement"
    },
    { 
      id: "back-pain", 
      nameKey: "backPain", 
      image: conditionBackPain,
      categoryKey: "painManagement"
    },
    { 
      id: "complex-regional-pain-syndrome", 
      nameKey: "crps", 
      image: conditionCRPS,
      categoryKey: "painManagement"
    },
    { 
      id: "epilepsy", 
      nameKey: "epilepsy", 
      image: conditionEpilepsy,
      categoryKey: "neurological"
    },
    { 
      id: "insomnia", 
      nameKey: "insomnia", 
      image: conditionInsomnia,
      categoryKey: "sleepDisorders"
    },
    { 
      id: "migraines", 
      nameKey: "migraines", 
      image: conditionMigraines,
      categoryKey: "painManagement"
    },
    { 
      id: "multiple-sclerosis", 
      nameKey: "multipleSclerosis", 
      image: conditionMS,
      categoryKey: "neurological"
    },
    { 
      id: "neuropathic-pain", 
      nameKey: "neuropathicPain", 
      image: conditionNeuropathicPain,
      categoryKey: "painManagement"
    },
    { 
      id: "parkinsons-disease", 
      nameKey: "parkinsons", 
      image: conditionParkinsons,
      categoryKey: "neurological"
    },
    { 
      id: "ptsd", 
      nameKey: "ptsd", 
      image: conditionPTSD,
      categoryKey: "mentalHealth"
    },
  ];

  const conditions = conditionsData.map(condition => ({
    ...condition,
    name: t(`conditionNames.${condition.nameKey}`),
    category: t(`categories.${condition.categoryKey}`)
  }));

  const filteredConditions = conditions.filter(condition => {
    const matchesCategory = selectedCategory === "all" || condition.categoryKey === selectedCategory;
    const matchesSearch = condition.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-28 md:pt-32">
          {/* Hero Section */}
          <section className="bg-background py-16 md:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <div className="max-w-5xl">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
                    {t('hero.title')}
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl font-light mb-8">
                    {t('hero.subtitle')}
                  </p>
                  <p className="text-lg text-muted-foreground/80 max-w-3xl font-light">
                    {t('hero.note')}
                  </p>
                </div>
              </ScrollAnimation>
            </div>
          </section>

          {/* Search and Filter Section */}
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={t('search.placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 text-foreground"
                    />
                  </div>

                  {/* Category Filters */}
                  <div className="flex flex-wrap gap-3">
                    {categoryKeys.map((categoryKey) => (
                      <button
                        key={categoryKey}
                        onClick={() => setSelectedCategory(categoryKey)}
                        className={`px-5 py-2.5 rounded-full font-medium transition-all duration-200 ${
                          selectedCategory === categoryKey
                            ? "bg-primary text-white shadow-lg"
                            : "bg-background border border-border/40 text-foreground hover:border-primary/50 hover:bg-primary/5"
                        }`}
                      >
                        {t(`categories.${categoryKey}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollAnimation>
            </div>
          </section>

          {/* Conditions Grid */}
          <section className="py-20 md:py-32 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div 
                layout
                className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto"
              >
                <AnimatePresence mode="popLayout">
                  {filteredConditions.map((condition) => (
                    <motion.div
                      key={condition.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ 
                        duration: 0.3,
                        layout: { duration: 0.3 }
                      }}
                    >
                      <Link
                        to={`/conditions/${condition.id}`}
                        className="group block bg-card rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border/30"
                      >
                        <div className="h-48 overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10">
                          <img
                            src={condition.image}
                            alt={condition.name}
                            className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {condition.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{condition.category}</p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {filteredConditions.length === 0 && (
                <ScrollAnimation>
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">
                      {t('noResults')}
                    </p>
                  </div>
                </ScrollAnimation>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 md:py-32" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollAnimation>
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-6 tracking-tight">
                    {t('cta.title')}
                  </h2>
                  <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                    {t('cta.subtitle')}
                  </p>
                  <Link to="/contact">
                    <button className="btn-linear text-white border border-white/30 hover:bg-white/10 px-8 py-3 text-lg">
                      {t('cta.button')} →
                    </button>
                  </Link>
                </div>
              </ScrollAnimation>
            </div>
          </section>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </PageTransition>
  );
};

export default Conditions;
