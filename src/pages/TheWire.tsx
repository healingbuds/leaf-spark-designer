import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import ScrollAnimation from "@/components/ScrollAnimation";
import MobileBottomActions from "@/components/MobileBottomActions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { newsArticles } from "@/data/newsArticles";

const TheWire = () => {
  const { t } = useTranslation("theWire");
  const [menuOpen, setMenuOpen] = useState(false);
  const featuredArticle = newsArticles.find((a) => a.featured);
  const otherArticles = newsArticles.filter((a) => !a.featured);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header onMenuStateChange={setMenuOpen} />
        <main className="pt-24 pb-20">
          {/* Hero Section */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <ScrollAnimation>
              <div className="text-center mb-12">
                <h1 className="font-pharma text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
                  {t("hero.title")}
                </h1>
                <p className="font-geist text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t("hero.subtitle")}
                </p>
              </div>
            </ScrollAnimation>

            {/* Featured Article */}
            {featuredArticle && (
              <ScrollAnimation delay={0.1}>
                <Link to={`/the-wire/${featuredArticle.id}`}>
                  <Card className="group overflow-hidden rounded-3xl border-border/50 hover:shadow-2xl transition-all duration-500">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="relative h-[300px] md:h-[400px] overflow-hidden bg-muted">
                        <img
                          src={featuredArticle.image}
                          alt={featuredArticle.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="eager"
                          onError={(e) => {
                            // Fallback handling if image fails
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-primary text-primary-foreground rounded-full px-4 py-1 font-semibold">
                            {t("featured")}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-8 md:p-12 flex flex-col justify-center bg-card">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {featuredArticle.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="border-secondary/60 text-secondary bg-secondary/10 rounded-full"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h2 className="font-pharma text-2xl sm:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                          {featuredArticle.title}
                        </h2>
                        <p className="font-geist text-muted-foreground mb-6 line-clamp-3">
                          {featuredArticle.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground font-geist">
                            {featuredArticle.date}
                          </span>
                          <Button variant="link" className="p-0 text-primary font-semibold">
                            {t("readArticle")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </ScrollAnimation>
            )}
          </section>

          {/* All Articles Grid */}
          <section className="container mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollAnimation>
              <h2 className="font-pharma text-2xl sm:text-3xl font-semibold text-foreground mb-8">
                {t("latestUpdates")}
              </h2>
            </ScrollAnimation>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {otherArticles.map((article, index) => (
                <ScrollAnimation key={article.id} delay={index * 0.1}>
                  <Link to={`/the-wire/${article.id}`}>
                    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 rounded-2xl cursor-pointer hover:-translate-y-2 h-full flex flex-col">
                      <div className="relative h-56 overflow-hidden bg-muted">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {article.tags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant="outline"
                              className="font-geist border-secondary/60 text-secondary bg-secondary/10 rounded-full px-3 py-1 text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="font-geist text-lg font-semibold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="font-geist text-muted-foreground text-sm line-clamp-3 leading-relaxed flex-grow">
                          {article.description}
                        </p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                          <span className="text-xs text-muted-foreground font-geist">
                            {article.date}
                          </span>
                          <Button
                            variant="link"
                            className="p-0 text-primary font-semibold text-sm"
                          >
                            {t("readMore")}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </ScrollAnimation>
              ))}
            </div>
          </section>
        </main>
        <Footer />
        <BackToTop />
        <MobileBottomActions menuOpen={menuOpen} />
      </div>
    </PageTransition>
  );
};

export default TheWire;