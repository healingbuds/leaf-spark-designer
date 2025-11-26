import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Button } from './ui/button';

type LocationType = 'operations-sales' | 'export-only' | 'operations-only';

interface Location {
  name: string;
  coordinates: [number, number];
  type: LocationType;
  cultivationArea?: string;
  productionCapacity?: string;
  certifications?: string[];
  licensedPartner?: string;
  regulatoryBody?: string;
  medicalLicense?: boolean;
}

type CountryStatus = 'LIVE' | 'NEXT' | 'UPCOMING';

interface Country {
  name: string;
  center: [number, number];
  zoom: number;
  locations: Location[];
  status: CountryStatus;
  order: number;
  description: string;
}

// MapLibre GL doesn't require an access token for basic usage

// Stage-1 Countries in exact chronological order
const countries: Record<string, Country> = {
  southAfrica: {
    name: 'South Africa',
    center: [24.9916, -28.4793],
    zoom: 5,
    status: 'LIVE',
    order: 1,
    description: 'Licensed partner facility - Fully compliant medical cannabis operations',
    locations: [
      { 
        name: 'Cape Town', 
        coordinates: [18.4241, -33.9249], 
        type: 'operations-sales',
        cultivationArea: '15,000 m²',
        productionCapacity: '2,500 kg/year',
        certifications: ['GMP', 'EU-GMP', 'ISO 9001'],
        licensedPartner: 'South African Health Products Regulatory Authority',
        regulatoryBody: 'SAHPRA',
        medicalLicense: true
      },
      { 
        name: 'Johannesburg', 
        coordinates: [28.0473, -26.2041], 
        type: 'operations-only',
        cultivationArea: '8,000 m²',
        productionCapacity: '1,200 kg/year',
        certifications: ['GMP', 'ISO 9001'],
        licensedPartner: 'South African Health Products Regulatory Authority',
        regulatoryBody: 'SAHPRA',
        medicalLicense: true
      },
    ],
  },
  portugal: {
    name: 'Portugal',
    center: [-8.2245, 39.3999],
    zoom: 6,
    status: 'NEXT',
    order: 2,
    description: 'Licensed EU partner facility - Primary European medical cannabis hub with full regulatory compliance',
    locations: [
      { 
        name: 'Lisbon', 
        coordinates: [-9.1393, 38.7223], 
        type: 'operations-sales',
        cultivationArea: '12,000 m²',
        productionCapacity: '2,000 kg/year',
        certifications: ['EU-GMP', 'ISO 22000', 'Organic Certified'],
        licensedPartner: 'INFARMED - Portuguese Medicines Authority',
        regulatoryBody: 'INFARMED',
        medicalLicense: true
      },
      { 
        name: 'Porto', 
        coordinates: [-8.6291, 41.1579], 
        type: 'export-only',
        cultivationArea: 'N/A',
        productionCapacity: 'N/A',
        certifications: ['Export License', 'EU Distribution'],
        licensedPartner: 'INFARMED - Portuguese Medicines Authority',
        regulatoryBody: 'INFARMED',
        medicalLicense: true
      },
    ],
  },
  uk: {
    name: 'United Kingdom',
    center: [-3.4360, 55.3781],
    zoom: 5,
    status: 'UPCOMING',
    order: 3,
    description: 'Planned licensed partner facility - Subject to MHRA regulatory approval',
    locations: [
      { 
        name: 'London', 
        coordinates: [-0.1276, 51.5074], 
        type: 'operations-sales',
        cultivationArea: '10,000 m²',
        productionCapacity: '1,800 kg/year',
        certifications: ['GMP', 'MHRA Approved'],
        licensedPartner: 'UK Medicines and Healthcare products Regulatory Agency',
        regulatoryBody: 'MHRA',
        medicalLicense: true
      },
      { 
        name: 'Manchester', 
        coordinates: [-2.2426, 53.4808], 
        type: 'export-only',
        cultivationArea: 'N/A',
        productionCapacity: 'N/A',
        certifications: ['Export License', 'UK Distribution'],
        licensedPartner: 'UK Medicines and Healthcare products Regulatory Agency',
        regulatoryBody: 'MHRA',
        medicalLicense: true
      },
    ],
  },
};

type LayerFilter = 'all' | 'operations-sales' | 'export-only' | 'operations-only';

interface InteractiveMapProps {
  selectedCountry: string | null;
  onCountrySelect?: (countryId: string) => void;
}

const InteractiveMap = ({ selectedCountry, onCountrySelect }: InteractiveMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeLayer, setActiveLayer] = useState<LayerFilter>('all');

  useEffect(() => {
    if (!mapContainer.current) return;
    
    // Custom branded style with design system colors
    const style = {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors',
          maxzoom: 19
        }
      },
      layers: [
        {
          id: 'background',
          type: 'background',
          paint: {
            'background-color': 'hsl(171, 12%, 94%)' // Muted background
          }
        },
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 22,
          paint: {
            'raster-opacity': 0.65, // Subtle map tiles
            'raster-saturation': -0.4, // Desaturated
            'raster-contrast': -0.1,
            'raster-brightness-min': 0.3,
            'raster-brightness-max': 0.9
          }
        },
        {
          id: 'brand-overlay',
          type: 'background',
          paint: {
            'background-color': 'hsl(178, 48%, 33%)', // Secondary green overlay
            'background-opacity': 0.08
          }
        }
      ]
    };
    
    // Start zoomed into South Africa (first live location)
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: style as any,
      center: [24.9916, -28.4793], // South Africa center
      zoom: 5,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: false,
        showCompass: false,
      }),
      'top-right'
    );

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current = [];
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const country = selectedCountry ? countries[selectedCountry] : null;
    
    if (country) {
      map.current.flyTo({
        center: country.center,
        zoom: country.zoom,
        duration: 1500,
        essential: true,
        curve: 1.42,
      });
    } else {
      map.current.flyTo({
        center: [20, 20],
        zoom: 2,
        duration: 1500,
      });
    }

    // Remove old markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for all or selected country
    const countriesToShow = selectedCountry 
      ? [countries[selectedCountry]]
      : Object.values(countries);

    countriesToShow.forEach((countryData) => {
      countryData.locations.forEach((location, idx) => {
        // Filter by active layer
        if (activeLayer !== 'all' && location.type !== activeLayer) return;

        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px white';
        
        // Design system colors for markers
        const colorMap: Record<LocationType, string> = {
          'operations-sales': 'hsl(142, 76%, 36%)',   // Primary green
          'export-only': 'hsl(160, 84%, 39%)',        // Teal accent
          'operations-only': 'hsl(173, 58%, 39%)',    // Secondary teal
        };
        
        el.style.backgroundColor = colorMap[location.type];
        
        // Staggered entrance animation
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }, idx * 100);
        
        el.style.opacity = '0';
        el.style.transform = 'scale(0)';
        
        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.4) translateY(-4px)';
          el.style.boxShadow = `0 0 40px ${colorMap[location.type]}, 0 12px 32px rgba(0,0,0,0.3), 0 0 0 4px white`;
          el.style.zIndex = '1000';
          popup.addTo(map.current!);
          
          // Smooth fly to the hovered marker
          map.current?.flyTo({
            center: location.coordinates,
            zoom: Math.max(map.current.getZoom(), 6),
            duration: 800,
            curve: 1.2,
            essential: true,
          });
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1), 0 0 0 3px white';
          el.style.zIndex = 'auto';
          popup.remove();
        });
        
        el.addEventListener('click', () => {
          if (onCountrySelect) {
            const countryId = Object.keys(countries).find(
              key => countries[key].name === countryData.name
            );
            if (countryId) onCountrySelect(countryId);
          }
        });

        const typeLabels: Record<LocationType, string> = {
          'operations-sales': 'Operations & Sales',
          'export-only': 'Export Sales Only',
          'operations-only': 'Operations Only',
        };

        const certificationsHtml = location.certifications && location.certifications.length > 0
          ? location.certifications.map(cert => 
              `<span style="display: inline-block; background: hsl(142, 76%, 96%); color: hsl(142, 76%, 36%); padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 600; border: 1px solid hsl(142, 76%, 88%); margin-right: 4px; margin-bottom: 4px;">${cert}</span>`
            ).join('')
          : '<span style="font-size: 12px; color: hsl(215, 16%, 47%); font-style: italic;">None specified</span>';

        const popup = new maplibregl.Popup({ 
          offset: 35, 
          className: 'map-popup',
          closeButton: false,
          maxWidth: '380px',
          closeOnClick: false,
        })
          .setHTML(`
            <div style="padding: 20px 22px; font-family: 'Inter', system-ui, -apple-system, sans-serif; background: hsl(0, 0%, 100%); border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 1px rgba(0,0,0,0.1);">
              <!-- Licensed Partner Badge -->
              <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 9px; color: hsl(160, 84%, 39%); background: hsl(160, 84%, 96%); padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 700; margin-bottom: 10px; border: 1px solid hsl(160, 84%, 88%);">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="flex-shrink: 0;">
                  <path d="M5 0L6.12257 3.45492H9.75528L6.81636 5.59017L7.93893 9.04508L5 6.90983L2.06107 9.04508L3.18364 5.59017L0.244718 3.45492H3.87743L5 0Z" fill="hsl(160, 84%, 39%)"/>
                </svg>
                Licensed Partner Facility
              </div>
              
              <div style="font-weight: 700; font-size: 18px; margin-bottom: 6px; color: hsl(142, 76%, 36%); letter-spacing: -0.4px; line-height: 1.2;">${countryData.name}</div>
              <div style="font-size: 15px; color: hsl(215, 16%, 47%); margin-bottom: 14px; font-weight: 500;">${location.name}</div>
              <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: hsl(142, 76%, 36%); background: hsl(142, 76%, 96%); padding: 6px 12px; border-radius: 8px; text-transform: uppercase; letter-spacing: 0.6px; font-weight: 700; margin-bottom: 14px; border: 1px solid hsl(142, 76%, 88%);">
                <div style="width: 6px; height: 6px; border-radius: 50%; background: hsl(142, 76%, 36%);"></div>
                ${typeLabels[location.type]}
              </div>
              
              ${location.licensedPartner ? `
              <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1.5px solid hsl(215, 20%, 94%);">
                <div style="font-size: 10px; color: hsl(215, 16%, 47%); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">Regulatory Authority</div>
                <div style="font-size: 12px; color: hsl(222.2, 84%, 4.9%); font-weight: 600; line-height: 1.4;">${location.licensedPartner}</div>
                ${location.regulatoryBody ? `<div style="font-size: 10px; color: hsl(160, 84%, 39%); font-weight: 700; margin-top: 2px;">${location.regulatoryBody}</div>` : ''}
              </div>
              ` : ''}
              
              ${location.cultivationArea ? `
              <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1.5px solid hsl(215, 20%, 94%);">
                <div style="font-size: 10px; color: hsl(215, 16%, 47%); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">Cultivation Area</div>
                <div style="font-size: 14px; color: hsl(222.2, 84%, 4.9%); font-weight: 700;">${location.cultivationArea}</div>
              </div>
              ` : ''}
              
              ${location.productionCapacity ? `
              <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1.5px solid hsl(215, 20%, 94%);">
                <div style="font-size: 10px; color: hsl(215, 16%, 47%); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px;">Production Capacity</div>
                <div style="font-size: 14px; color: hsl(222.2, 84%, 4.9%); font-weight: 700;">${location.productionCapacity}</div>
              </div>
              ` : ''}
              
              <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1.5px solid hsl(215, 20%, 94%);">
                <div style="font-size: 10px; color: hsl(215, 16%, 47%); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">Certifications</div>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${certificationsHtml}
                </div>
              </div>
              
              ${location.medicalLicense ? `
              <div style="margin-bottom: 10px; padding: 8px 12px; background: hsl(173, 58%, 96%); border-radius: 8px; border: 1px solid hsl(173, 58%, 88%);">
                <div style="font-size: 10px; color: hsl(173, 58%, 39%); font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">✓ Medical Cannabis License Active</div>
              </div>
              ` : ''}
              
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 11px; color: hsl(215, 16%, 47%); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">Status</span>
                <span style="font-size: 13px; color: hsl(142, 76%, 36%); font-weight: 700; letter-spacing: 0.2px;">${countryData.status}</span>
              </div>
              
              <!-- Compliance Disclaimer -->
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1.5px solid hsl(215, 20%, 94%); font-size: 9px; color: hsl(215, 16%, 47%); line-height: 1.5; font-style: italic;">
                All operations conducted by licensed partners. Digital Key holders do not handle or sell cannabis products directly. Blockchain-verified seed-to-sale traceability ensures regulatory compliance.
              </div>
            </div>
          `);

        const marker = new maplibregl.Marker(el)
          .setLngLat(location.coordinates)
          .setPopup(popup)
          .addTo(map.current!);

        markers.current.push(marker);
      });
    });
  }, [selectedCountry, isLoaded, activeLayer]);

  return (
    <div className="relative w-full h-full">
      {/* Compliance Disclaimer Banner */}
      <div className="absolute top-6 right-6 z-10 bg-secondary/95 backdrop-blur-sm rounded-xl shadow-lg border border-border/60 p-4 max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-primary">
              <path d="M6 0L7.34709 4.14589H11.7063L8.17963 6.70823L9.52671 10.8541L6 8.29177L2.47329 10.8541L3.82037 6.70823L0.293661 4.14589H4.65291L6 0Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold text-foreground mb-1">Licensed Partner Network</div>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              All facilities operate under licensed partners with full regulatory compliance. Digital Key holders earn blockchain-verified rewards without handling cannabis products.
            </p>
          </div>
        </div>
      </div>

      {/* Layer Toggle Controls */}
      <div className="absolute top-6 left-6 z-10 bg-background/98 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/60 p-3">
        <div className="flex flex-col gap-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 px-2">
            Filter Locations
          </div>
          <Button
            size="sm"
            variant={activeLayer === 'all' ? 'default' : 'ghost'}
            onClick={() => setActiveLayer('all')}
            className="justify-start text-sm font-semibold h-9"
          >
            All Locations
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'operations-sales' ? 'default' : 'ghost'}
            onClick={() => setActiveLayer('operations-sales')}
            className="justify-start text-sm h-9"
          >
            <div 
              className="w-3 h-3 rounded-full mr-2.5 border-2 shadow-sm" 
              style={{ 
                backgroundColor: activeLayer === 'operations-sales' ? 'hsl(var(--primary-foreground))' : 'hsl(142, 76%, 36%)',
                borderColor: activeLayer === 'operations-sales' ? 'hsl(var(--primary-foreground))' : 'hsl(142, 76%, 36%)',
              }} 
            />
            <span className="hidden sm:inline">Operations & Sales</span>
            <span className="sm:hidden">Ops & Sales</span>
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'export-only' ? 'default' : 'ghost'}
            onClick={() => setActiveLayer('export-only')}
            className="justify-start text-sm h-9"
          >
            <div 
              className="w-3 h-3 rounded-full mr-2.5 border-2 shadow-sm" 
              style={{ 
                backgroundColor: activeLayer === 'export-only' ? 'hsl(var(--primary-foreground))' : 'hsl(160, 84%, 39%)',
                borderColor: activeLayer === 'export-only' ? 'hsl(var(--primary-foreground))' : 'hsl(160, 84%, 39%)',
              }} 
            />
            <span className="hidden sm:inline">Export Only</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button
            size="sm"
            variant={activeLayer === 'operations-only' ? 'default' : 'ghost'}
            onClick={() => setActiveLayer('operations-only')}
            className="justify-start text-sm h-9"
          >
            <div 
              className="w-3 h-3 rounded-full mr-2.5 border-2 shadow-sm" 
              style={{ 
                backgroundColor: activeLayer === 'operations-only' ? 'hsl(var(--primary-foreground))' : 'hsl(173, 58%, 39%)',
                borderColor: activeLayer === 'operations-only' ? 'hsl(var(--primary-foreground))' : 'hsl(173, 58%, 39%)',
              }} 
            />
            <span className="hidden sm:inline">Operations Only</span>
            <span className="sm:hidden">Operations</span>
          </Button>
        </div>
      </div>

      <div 
        ref={mapContainer} 
        className="absolute inset-0 rounded-3xl overflow-hidden ring-1 ring-border/40"
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-3xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="text-muted-foreground text-base font-medium tracking-wide">
              Loading map...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export { countries };
export type { Country, CountryStatus };
export default InteractiveMap;
