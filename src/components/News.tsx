import ScrollAnimation from "@/components/ScrollAnimation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import newsAward from "@/assets/award-hq.jpg";
import newsInhaler from "@/assets/medical-products-hq.jpg";
import newsConference from "@/assets/conference-hq.jpg";

const newsItems = [
  {
    category: "Company Updates",
    title: "Healing Buds Research Team Honored with Industry Recognition for Scientific Contributions",
    description: "Leading researchers from our team received prestigious recognition for their groundbreaking work advancing cannabis medicine and clinical research excellence...",
    image: newsAward,
    featured: true,
  },
  {
    category: "Product Innovation",
    title: "New Advanced Delivery System Launches in Australian Market Through Strategic Partnership",
    description: "",
    image: newsInhaler,
    featured: false,
  },
  {
    category: "Industry Insights",
    title: "Key Takeaways from International Medical Cannabis Conference: Building Trust and Advancing Standards",
    description: "",
    image: newsConference,
    featured: false,
  },
];

const News = () => {
  return (
    <section id="news" className="bg-background py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6">
        <ScrollAnimation>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
            <h2 className="font-pharma text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
              Latest news
            </h2>
            <Button variant="outline" size="lg" className="font-body rounded-full text-sm sm:text-base">
              All news
            </Button>
          </div>
        </ScrollAnimation>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {newsItems.map((item, index) => (
            <ScrollAnimation key={index} delay={index * 0.1}>
              <Card 
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 rounded-2xl cursor-pointer hover:-translate-y-2"
              >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110"
                />
                {item.featured && (
                  <div className="absolute inset-0 bg-gradient-to-t from-sage-dark/90 to-sage-dark/40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <p className="text-sm font-semibold text-secondary mb-2 tracking-wider">RECOGNIZED</p>
                      <h3 className="text-2xl font-bold leading-tight">
                        Scientific Excellence<br/>Award Recipients
                      </h3>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6">
                <Badge 
                  variant="outline" 
                  className="font-geist mb-3 border-secondary/60 text-secondary bg-secondary/10 rounded-full px-3 py-1"
                >
                  {item.category}
                </Badge>
                <h3 className="font-geist text-xl font-semibold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors tracking-tight">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="font-geist text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                    {item.description}
                </p>
              )}
              </div>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
