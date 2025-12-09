import ScrollAnimation from "@/components/ScrollAnimation";
import { Sprout, Users, FlaskConical } from "lucide-react";
import plantLineArt from "@/assets/plant-line-art.png";

const values = [
  {
    icon: Sprout,
    title: "Superior Quality",
    description: "Every stage from cultivation through extraction to final production is meticulously managed with unwavering attention to detail. Our EU GMP-certified products meet the highest international standards, earning trust across borders.",
  },
  {
    icon: Users,
    title: "Expanding Access",
    description: "Our mission is to ensure medical cannabis reaches those who need it most. Through evidence-based advocacy and education, we are reducing barriers, challenging misconceptions, and creating pathways to safe, legal access.",
  },
  {
    icon: FlaskConical,
    title: "Research-Driven Innovation",
    description: "Collaborating with world-class research institutions including Imperial College London and University of Pennsylvania, we advance scientific knowledge of cannabis therapeutics. Research excellence is the foundation of everything we pursue.",
  },
];

const ValueProps = () => {
  return (
    <div className="px-2">
      <section 
        className="py-16 sm:py-20 md:py-24 rounded-2xl sm:rounded-3xl relative overflow-hidden"
        style={{ backgroundColor: 'hsl(var(--section-color))' }}
      >
        {/* Cannabis plant decoration - bottom right - thin line art style */}
        <div className="absolute bottom-8 right-8 sm:right-16 opacity-[0.12] pointer-events-none">
          <img src={plantLineArt} alt="" className="w-32 sm:w-44 h-auto" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollAnimation>
            <div className="text-center mb-14 sm:mb-18">
              <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-semibold text-white mb-4 px-4" style={{ letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                Growing more than medicine
              </h2>
            </div>
          </ScrollAnimation>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12 md:gap-16">
            {values.map((value, index) => (
              <ScrollAnimation key={index} delay={index * 0.1}>
                <div className="text-center group">
                  <div className="flex justify-center mb-7">
                    <div className="w-20 h-20 flex items-center justify-center rounded-2xl bg-white/10 group-hover:bg-white/15 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/10">
                      <value.icon className="w-10 h-10 text-white" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h3 className="font-jakarta text-xl sm:text-2xl font-semibold text-white mb-4 tracking-tight">
                    {value.title}
                  </h3>
                  <p className="font-jakarta text-white/75 leading-relaxed text-sm sm:text-base">
                    {value.description}
                  </p>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ValueProps;
