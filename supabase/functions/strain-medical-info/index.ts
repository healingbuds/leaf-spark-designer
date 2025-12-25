import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StrainData {
  name: string;
  category: string;
  thcContent: number;
  cbdContent: number;
  effects: string[];
  terpenes: string[];
  description?: string;
  countryCode?: string;
}

interface StrainKnowledge {
  source_name: string;
  source_url: string;
  scraped_content: string;
  category: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strain } = await req.json() as { strain: StrainData };

    if (!strain?.name) {
      return new Response(
        JSON.stringify({ error: 'Strain name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    let strainKnowledge: StrainKnowledge[] = [];
    let sources: { name: string; url: string; isDrGreenNetwork: boolean }[] = [];

    // Fetch real dispensary data from strain_knowledge table
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: knowledgeData, error: knowledgeError } = await supabase
        .from('strain_knowledge')
        .select('source_name, source_url, scraped_content, category')
        .or(`strain_name.ilike.%${strain.name.toLowerCase()}%,strain_name.ilike.%${strain.name.split(' ')[0].toLowerCase()}%`)
        .gte('last_scraped_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10);

      if (!knowledgeError && knowledgeData && knowledgeData.length > 0) {
        strainKnowledge = knowledgeData;
        sources = knowledgeData.map(k => ({
          name: k.source_name,
          url: k.source_url,
          isDrGreenNetwork: k.category === 'drgreen_network',
        }));
        console.log(`Found ${knowledgeData.length} real-world sources for ${strain.name}`);
      }
    }

    console.log(`Fetching medical info for strain: ${strain.name}`);

    // Build context from real dispensary data
    let realWorldContext = '';
    if (strainKnowledge.length > 0) {
      realWorldContext = `\n\nREAL-WORLD DISPENSARY DATA (use this to ground your response):\n`;
      for (const knowledge of strainKnowledge) {
        // Extract relevant snippets (limit each source to ~1000 chars)
        const snippet = knowledge.scraped_content.substring(0, 1000);
        realWorldContext += `\n--- From ${knowledge.source_name} (${knowledge.category === 'drgreen_network' ? 'Dr. Green Network Partner' : 'Licensed Dispensary'}) ---\n${snippet}\n`;
      }
    }

    const systemPrompt = `You are a medical cannabis expert providing accurate, evidence-based information about cannabis strains for a licensed medical cannabis platform (Healing Buds / Dr. Green Network).

Your responses must be:
- Clinically accurate and based on current medical research
- Professional in tone, suitable for healthcare contexts
- Clear about therapeutic applications and potential side effects
- Compliant with medical regulations
- GROUNDED IN REAL-WORLD DATA when provided from dispensary sources

${strainKnowledge.length > 0 ? 'IMPORTANT: You have been provided with real-world data from licensed dispensaries and Dr. Green Network partners. Use this information to enhance your response accuracy and include relevant insights from these sources.' : ''}

Always include proper medical disclaimers and emphasize that patients should consult with their healthcare provider.`;

    const userPrompt = `Provide detailed medical information for the cannabis strain "${strain.name}" with these characteristics:
- Type: ${strain.category}
- THC: ${strain.thcContent}%
- CBD: ${strain.cbdContent}%
- Known effects: ${strain.effects?.join(', ') || 'Not specified'}
- Terpene profile: ${strain.terpenes?.join(', ') || 'Not specified'}
${strain.description ? `- Description: ${strain.description}` : ''}
${realWorldContext}

Provide comprehensive medical guidance for this strain using the get_medical_info function. ${strainKnowledge.length > 0 ? 'Incorporate insights from the real-world dispensary data provided above.' : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_medical_info',
              description: 'Returns structured medical information about a cannabis strain',
              parameters: {
                type: 'object',
                properties: {
                  medicalConditions: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Medical conditions this strain may help with (max 6)'
                  },
                  therapeuticEffects: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Therapeutic effects of this strain (max 6)'
                  },
                  potentialSideEffects: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Potential side effects (max 5)'
                  },
                  recommendedFor: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Patient profiles this strain is best suited for (max 4)'
                  },
                  dosageGuidance: {
                    type: 'string',
                    description: 'General dosage guidance for medical use (1-2 sentences)'
                  },
                  timeOfUse: {
                    type: 'string',
                    description: 'Recommended time of day for use (short phrase)'
                  },
                  onsetDuration: {
                    type: 'string',
                    description: 'Onset time and duration of effects (1 sentence)'
                  },
                  interactionWarnings: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Potential drug interactions or contraindications (max 4)'
                  },
                  researchNotes: {
                    type: 'string',
                    description: 'Brief summary of relevant medical research (2-3 sentences max)'
                  },
                  patientTestimonialSummary: {
                    type: 'string',
                    description: 'Summary of common patient experiences (1-2 sentences)'
                  }
                },
                required: [
                  'medicalConditions', 'therapeuticEffects', 'potentialSideEffects',
                  'recommendedFor', 'dosageGuidance', 'timeOfUse', 'onsetDuration',
                  'interactionWarnings', 'researchNotes', 'patientTestimonialSummary'
                ],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'get_medical_info' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch medical information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    // Extract tool call arguments
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      console.error('No tool call in response');
      return new Response(
        JSON.stringify({ success: true, data: getDefaultMedicalInfo(strain), sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let medicalInfo;
    try {
      medicalInfo = JSON.parse(toolCall.function.arguments);
    } catch (parseError) {
      console.error('Failed to parse tool call arguments:', parseError);
      return new Response(
        JSON.stringify({ success: true, data: getDefaultMedicalInfo(strain), sources: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully fetched medical info for ${strain.name} with ${sources.length} real-world sources`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: medicalInfo,
        sources: sources,
        groundedInRealData: sources.length > 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in strain-medical-info:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getDefaultMedicalInfo(strain: StrainData) {
  const category = strain.category?.toLowerCase() || 'hybrid';
  
  const baseConditions: Record<string, string[]> = {
    sativa: ['Depression', 'Fatigue', 'ADHD', 'Mood disorders'],
    indica: ['Insomnia', 'Chronic pain', 'Muscle spasms', 'Anxiety'],
    hybrid: ['Stress', 'Mild pain', 'Appetite loss', 'Mood imbalance'],
    cbd: ['Epilepsy', 'Inflammation', 'Anxiety', 'Chronic pain'],
  };

  const baseEffects: Record<string, string[]> = {
    sativa: ['Uplifting', 'Energizing', 'Focus-enhancing', 'Creativity boost'],
    indica: ['Relaxing', 'Sedating', 'Pain-relieving', 'Muscle relaxant'],
    hybrid: ['Balanced relaxation', 'Mild euphoria', 'Stress relief', 'Gentle uplift'],
    cbd: ['Non-intoxicating relief', 'Anti-inflammatory', 'Calming', 'Neuroprotective'],
  };

  const recommendedFor: Record<string, string[]> = {
    sativa: ['Daytime users', 'Those seeking mental clarity', 'Creative professionals'],
    indica: ['Evening users', 'Patients with sleep issues', 'Those with chronic pain'],
    hybrid: ['Versatile users', 'First-time patients', 'Those seeking balance'],
    cbd: ['Patients avoiding psychoactive effects', 'Those with epilepsy', 'Anxiety patients'],
  };

  return {
    medicalConditions: baseConditions[category] || baseConditions.hybrid,
    therapeuticEffects: strain.effects?.length > 0 ? strain.effects : (baseEffects[category] || baseEffects.hybrid),
    potentialSideEffects: ['Dry mouth', 'Dry eyes', 'Dizziness', 'Increased appetite'],
    recommendedFor: recommendedFor[category] || recommendedFor.hybrid,
    dosageGuidance: 'Start with a low dose (2.5-5mg THC) and wait at least 2 hours before increasing. Consult your prescribing physician for personalized guidance.',
    timeOfUse: category === 'sativa' ? 'Morning to afternoon' : category === 'indica' ? 'Evening to night' : 'Any time based on needs',
    onsetDuration: 'Inhalation: 5-15 minutes onset, 2-4 hours duration. Oral: 30-90 minutes onset, 4-8 hours duration.',
    interactionWarnings: [
      'May interact with blood thinners',
      'Avoid with sedatives or anti-anxiety medications',
      'Consult doctor if taking immunosuppressants',
    ],
    researchNotes: `${strain.category} strains with ${strain.thcContent}% THC and ${strain.cbdContent}% CBD have been studied for various therapeutic applications. Research is ongoing.`,
    patientTestimonialSummary: 'Individual experiences vary. Many patients report positive outcomes when used as directed under medical supervision.',
  };
}
