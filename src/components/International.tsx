import ScrollAnimation from "@/components/ScrollAnimation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import InteractiveMap, { countries, type Country, type CountryStatus } from "./InteractiveMap";
import { MapPin, Building2, TrendingUp } from "lucide-react";

const International = () => {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Get countries in Stage-1 order
  const sortedCountries = Object.entries(countries)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([id, data]) => ({ id, ...data }));

  const getStatusColor = (status: CountryStatus) => {
    switch (status) {
      case 'LIVE':
        return 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-700 border-emerald-300/50 shadow-emerald-200/50';
      case 'NEXT':
        return 'bg-gradient-to-r from-primary/20 to-primary-dark/20 text-primary border-primary/30 shadow-primary/20';
      case 'UPCOMING':
        return 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-700 border-slate-300/50 shadow-slate-200/50';
    }
  };

  return (
    <section className="relative bg-background py-16 sm:py-20 md:py-24 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />
      
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="w-full max-w-7xl mx-auto rounded-3xl p-8 sm:p-10 md:p-12 border border-white/10 backdrop-blur-sm relative overflow-hidden" style={{ backgroundColor: 'hsl(var(--section-color))' }}>
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <ScrollAnimation>
            <div className="text-center mb-12 sm:mb-16 relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-pharma text-white mb-4 tracking-tight drop-shadow-lg">
                Global Presence
              </h2>
              <p className="text-lg sm:text-xl text-white/80 font-body max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                Strategic expansion across five countries, building a comprehensive medical cannabis network
              </p>
            </div>
          </ScrollAnimation>

          {/* Interactive Map */}
          <ScrollAnimation delay={0.1}>
            <div className="relative h-[450px] sm:h-[500px] md:h-[600px] mb-12 sm:mb-16 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <InteractiveMap 
                selectedCountry={selectedCountry} 
                onCountrySelect={setSelectedCountry}
              />
            </div>
          </ScrollAnimation>

          {/* Country List - Stage-1 Order */}
          <ScrollAnimation delay={0.2}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 relative z-10">
              {sortedCountries.map((country, idx) => (
                <button
                  key={country.id}
                  onClick={() => setSelectedCountry(selectedCountry === country.id ? null : country.id)}
                  className={`
                    group relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden
                    ${selectedCountry === country.id 
                      ? 'border-primary/60 shadow-2xl scale-[1.03] bg-gradient-to-br from-card via-card to-primary/5' 
                      : 'border-border/30 bg-gradient-to-br from-card to-card/95 hover:border-primary/50 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1'
                    }
                  `}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  {/* Card gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${
                    selectedCountry === country.id 
                      ? 'from-primary/10 via-transparent to-secondary/10 opacity-100' 
                      : 'from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100'
                  }`} />
                  
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg
                          ${selectedCountry === country.id 
                            ? 'bg-gradient-to-br from-primary to-primary/80 scale-110 rotate-3' 
                            : 'bg-gradient-to-br from-muted to-muted/80 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:scale-105'
                          }
                        `}>
                          <MapPin 
                            className={`w-7 h-7 transition-all duration-500 ${
                              selectedCountry === country.id 
                                ? 'text-white' 
                                : 'text-muted-foreground group-hover:text-primary'
                            }`} 
                            strokeWidth={2.5} 
                          />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-bold font-geist text-foreground mb-0.5 group-hover:text-primary transition-colors duration-300">
                            {country.name}
                          </h3>
                          <p className="text-xs text-muted-foreground font-geist font-medium uppercase tracking-wider">
                            Stage {country.order}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`font-pharma font-bold tracking-wider text-[10px] px-3 py-1 rounded-full border-2 shadow-lg transition-all duration-300 ${getStatusColor(country.status)}`}
                      >
                        {country.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground font-geist leading-relaxed mb-5 min-h-[60px]">
                      {country.description}
                    </p>

                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-foreground transition-all duration-300 group-hover:bg-muted group-hover:shadow-md">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-geist font-semibold">{country.locations.length} Locations</span>
                      </div>
                      {country.status === 'LIVE' && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-emerald-500/15 to-emerald-600/15 text-emerald-700 border border-emerald-300/50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-geist font-bold">Active</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </div>
                </button>
              ))}
            </div>
          </ScrollAnimation>

          {/* Legend */}
          <ScrollAnimation delay={0.3}>
            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40 backdrop-blur-sm shadow-lg relative z-10 overflow-hidden">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-50" />
              
              <div className="relative z-10">
                <h4 className="text-sm font-bold font-pharma text-foreground mb-5 tracking-wide uppercase flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-primary to-secondary rounded-full" />
                  Operation Types
                </h4>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-card to-card/80 border border-border/30 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                    <div className="w-5 h-5 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#2C5F4F' }} />
                    <span className="text-sm text-foreground font-geist font-semibold">Operations & Sales</span>
                  </div>
                  <div className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-card to-card/80 border border-border/30 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                    <div className="w-5 h-5 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#13303D' }} />
                    <span className="text-sm text-foreground font-geist font-semibold">Export Sales Only</span>
                  </div>
                  <div className="group flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-card to-card/80 border border-border/30 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                    <div className="w-5 h-5 rounded-full shadow-md group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#6B7280' }} />
                    <span className="text-sm text-foreground font-geist font-semibold">Operations Only</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
};

export default International;
