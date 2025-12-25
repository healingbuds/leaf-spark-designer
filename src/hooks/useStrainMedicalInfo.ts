import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from './useProducts';

export interface MedicalSource {
  name: string;
  url: string;
  isDrGreenNetwork: boolean;
}

export interface MedicalInfo {
  medicalConditions: string[];
  therapeuticEffects: string[];
  potentialSideEffects: string[];
  recommendedFor: string[];
  dosageGuidance: string;
  timeOfUse: string;
  onsetDuration: string;
  interactionWarnings: string[];
  researchNotes: string;
  patientTestimonialSummary: string;
  sources?: MedicalSource[];
  groundedInRealData?: boolean;
}

// Cache medical info in memory to avoid repeated API calls
const medicalInfoCache: Record<string, MedicalInfo> = {};

export function useStrainMedicalInfo(product: Product | null) {
  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!product) {
      setMedicalInfo(null);
      return;
    }

    // Check cache first
    if (medicalInfoCache[product.id]) {
      setMedicalInfo(medicalInfoCache[product.id]);
      return;
    }

    const fetchMedicalInfo = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('strain-medical-info', {
          body: {
            strain: {
              name: product.name,
              category: product.category,
              thcContent: product.thcContent,
              cbdContent: product.cbdContent,
              effects: product.effects,
              terpenes: product.terpenes,
              description: product.description,
            },
          },
        });

        if (fnError) {
          console.error('Edge function error:', fnError);
          setError('Failed to load medical information');
          // Set default fallback data
          setMedicalInfo(getDefaultMedicalInfo(product));
          return;
        }

        if (data?.success && data?.data) {
          const fetchedData = data.data;
          // Validate the data structure - make sure researchNotes doesn't contain raw JSON
          if (typeof fetchedData.researchNotes === 'string' && 
              (fetchedData.researchNotes.startsWith('{') || fetchedData.researchNotes.startsWith('```'))) {
            // Bad data - use defaults instead
            console.warn('Received malformed medical info, using defaults');
            setMedicalInfo(getDefaultMedicalInfo(product));
          } else {
            // Include sources from the response
            const enrichedData: MedicalInfo = {
              ...fetchedData,
              sources: data.sources || [],
              groundedInRealData: data.groundedInRealData || false,
            };
            medicalInfoCache[product.id] = enrichedData;
            setMedicalInfo(enrichedData);
          }
        } else if (data?.error) {
          console.error('API error:', data.error);
          setError(data.error);
          setMedicalInfo(getDefaultMedicalInfo(product));
        }
      } catch (err) {
        console.error('Error fetching medical info:', err);
        setError('Failed to load medical information');
        setMedicalInfo(getDefaultMedicalInfo(product));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedicalInfo();
  }, [product?.id]);

  return { medicalInfo, isLoading, error };
}

// Trigger background scraping for a strain to populate knowledge base
export async function triggerStrainKnowledgeScrape(strainName: string, countryCode?: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('strain-knowledge', {
      body: {
        strainName,
        countryCode: countryCode || 'PT',
        forceRefresh: false,
      },
    });

    if (error) {
      console.error('Failed to trigger strain knowledge scrape:', error);
      return false;
    }

    console.log('Strain knowledge scrape result:', data);
    return data?.success || false;
  } catch (err) {
    console.error('Error triggering strain knowledge scrape:', err);
    return false;
  }
}

// Provide sensible defaults based on strain category
function getDefaultMedicalInfo(product: Product): MedicalInfo {
  const category = product.category.toLowerCase();
  
  const baseConditions = {
    sativa: ['Depression', 'Fatigue', 'ADHD', 'Mood disorders'],
    indica: ['Insomnia', 'Chronic pain', 'Muscle spasms', 'Anxiety'],
    hybrid: ['Stress', 'Mild pain', 'Appetite loss', 'Mood imbalance'],
    cbd: ['Epilepsy', 'Inflammation', 'Anxiety', 'Chronic pain'],
  };

  const baseEffects = {
    sativa: ['Uplifting', 'Energizing', 'Focus-enhancing', 'Creativity boost'],
    indica: ['Relaxing', 'Sedating', 'Pain-relieving', 'Muscle relaxant'],
    hybrid: ['Balanced relaxation', 'Mild euphoria', 'Stress relief', 'Gentle uplift'],
    cbd: ['Non-intoxicating relief', 'Anti-inflammatory', 'Calming', 'Neuroprotective'],
  };

  const recommendedFor = {
    sativa: ['Daytime users', 'Those seeking mental clarity', 'Creative professionals'],
    indica: ['Evening users', 'Patients with sleep issues', 'Those with chronic pain'],
    hybrid: ['Versatile users', 'First-time patients', 'Those seeking balance'],
    cbd: ['Patients avoiding psychoactive effects', 'Those with epilepsy', 'Anxiety patients'],
  };

  return {
    medicalConditions: baseConditions[category as keyof typeof baseConditions] || baseConditions.hybrid,
    therapeuticEffects: product.effects.length > 0 ? product.effects : (baseEffects[category as keyof typeof baseEffects] || baseEffects.hybrid),
    potentialSideEffects: ['Dry mouth', 'Dry eyes', 'Dizziness', 'Increased appetite'],
    recommendedFor: recommendedFor[category as keyof typeof recommendedFor] || recommendedFor.hybrid,
    dosageGuidance: 'Start with a low dose (2.5-5mg THC) and wait at least 2 hours before increasing. Consult your prescribing physician for personalized guidance.',
    timeOfUse: category === 'sativa' ? 'Morning to afternoon' : category === 'indica' ? 'Evening to night' : 'Any time based on needs',
    onsetDuration: 'Inhalation: 5-15 minutes onset, 2-4 hours duration. Oral: 30-90 minutes onset, 4-8 hours duration.',
    interactionWarnings: [
      'May interact with blood thinners',
      'Avoid with sedatives or anti-anxiety medications',
      'Consult doctor if taking immunosuppressants',
    ],
    researchNotes: `${product.category} strains with ${product.thcContent}% THC and ${product.cbdContent}% CBD have been studied for various therapeutic applications. Research is ongoing.`,
    patientTestimonialSummary: 'Individual experiences vary. Many patients report positive outcomes when used as directed under medical supervision.',
    sources: [],
    groundedInRealData: false,
  };
}
