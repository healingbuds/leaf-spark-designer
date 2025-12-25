import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Dispensary sources organized by region
const DISPENSARY_SOURCES = {
  PT: [
    { name: 'AceCann', url: 'https://acecann.com/', searchPath: '/search?q=' },
    { name: 'Canapac', url: 'https://canapac.pt/', searchPath: '/search?q=' },
    { name: 'Cannactiva', url: 'https://cannactiva.com/', searchPath: '/search?q=' },
  ],
  UK: [
    { name: 'Curaleaf Clinic', url: 'https://curaleafclinic.com/', searchPath: '/search?q=' },
    { name: 'Releaf', url: 'https://releaf.co.uk/', searchPath: '/search?q=' },
  ],
  ZA: [
    { name: 'Taste of Cannabis', url: 'https://tasteofcannabis.co.za/', searchPath: '/search?q=' },
    { name: 'Cannafrica SA', url: 'https://cannafricasa.co.za/', searchPath: '/search?q=' },
  ],
  DRGREEN_NETWORK: [
    { name: 'Medibiss', url: 'https://medibiss.com/', searchPath: '/search?q=' },
    { name: 'Martini Botanical', url: 'https://martinibotanical.com/', searchPath: '/search?q=' },
    { name: 'Greenbase Network', url: 'https://greenbasenetwork.co.uk/', searchPath: '/search?q=' },
    { name: 'Professor Green', url: 'https://professorgreen.co.za/', searchPath: '/search?q=' },
    { name: 'Terry Stoned', url: 'https://terrystoned.com/', searchPath: '/search?q=' },
    { name: 'Maybach Meds', url: 'https://maybachmeds.com/', searchPath: '/search?q=' },
  ],
};

interface ScrapeResult {
  sourceName: string;
  sourceUrl: string;
  content: string;
  success: boolean;
  error?: string;
}

async function scrapeUrl(url: string, apiKey: string): Promise<{ success: boolean; markdown?: string; error?: string }> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`Firecrawl error for ${url}:`, data);
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }

    return { 
      success: true, 
      markdown: data.data?.markdown || data.markdown || '' 
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function scrapeStrainFromSource(
  strainName: string, 
  source: { name: string; url: string; searchPath: string },
  apiKey: string
): Promise<ScrapeResult> {
  // Try to scrape the main page for strain info
  const searchUrl = `${source.url}${source.searchPath}${encodeURIComponent(strainName)}`;
  
  console.log(`Scraping ${source.name} for strain: ${strainName}`);
  
  const result = await scrapeUrl(searchUrl, apiKey);
  
  if (result.success && result.markdown && result.markdown.length > 100) {
    return {
      sourceName: source.name,
      sourceUrl: source.url,
      content: result.markdown,
      success: true,
    };
  }

  // Fallback: try the main product page
  const mainResult = await scrapeUrl(source.url, apiKey);
  
  return {
    sourceName: source.name,
    sourceUrl: source.url,
    content: mainResult.markdown || '',
    success: mainResult.success && (mainResult.markdown?.length || 0) > 100,
    error: result.error || mainResult.error,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action, strainName, countryCode, forceRefresh, sourceName, sourceUrl } = body;

    const FIRECRAWL_API_KEY = Deno.env.get('FIRECRAWL_API_KEY');
    if (!FIRECRAWL_API_KEY) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Scraping service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle scrape_all action - scrape all sources for general knowledge
    if (action === 'scrape_all') {
      console.log('Starting full scrape of all dispensary sources');
      
      const allSources = [
        ...DISPENSARY_SOURCES.PT.map(s => ({ ...s, country: 'PT', category: 'dispensary' })),
        ...DISPENSARY_SOURCES.UK.map(s => ({ ...s, country: 'GB', category: 'dispensary' })),
        ...DISPENSARY_SOURCES.ZA.map(s => ({ ...s, country: 'ZA', category: 'dispensary' })),
        ...DISPENSARY_SOURCES.DRGREEN_NETWORK.map(s => ({ ...s, country: 'Network', category: 'drgreen' })),
      ];

      let scraped = 0;
      const errors: string[] = [];

      for (const source of allSources) {
        try {
          console.log(`Scraping ${source.name} (${source.url})`);
          const result = await scrapeUrl(source.url, FIRECRAWL_API_KEY);
          
          if (result.success && result.markdown && result.markdown.length > 100) {
            // Extract strain names from content (simplified extraction)
            const strainMatches = result.markdown.match(/(?:strain|cultivar|product)[:\s]+([A-Za-z\s]+?)(?:\n|,|\.)/gi) || [];
            const strainName = strainMatches.length > 0 && strainMatches[0]
              ? strainMatches[0].replace(/(?:strain|cultivar|product)[:\s]+/i, '').trim()
              : source.name;

            const { error: upsertError } = await supabase
              .from('strain_knowledge')
              .upsert({
                strain_name: strainName.toLowerCase().substring(0, 100),
                source_url: source.url,
                source_name: source.name,
                country_code: source.country,
                category: source.category,
                scraped_content: result.markdown.substring(0, 50000),
                last_scraped_at: new Date().toISOString(),
              }, {
                onConflict: 'strain_name,source_url',
              });

            if (upsertError) {
              console.error(`Error upserting from ${source.name}:`, upsertError);
              errors.push(`${source.name}: ${upsertError.message}`);
            } else {
              scraped++;
            }
          } else {
            errors.push(`${source.name}: ${result.error || 'No content'}`);
          }

          // Rate limit delay
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (err) {
          console.error(`Error scraping ${source.name}:`, err);
          errors.push(`${source.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      console.log(`Scrape complete: ${scraped}/${allSources.length} sources`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          scraped,
          total: allSources.length,
          errors: errors.length > 0 ? errors : undefined,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle scrape_single action - scrape a specific source
    if (action === 'scrape_single' && sourceName && sourceUrl) {
      console.log(`Scraping single source: ${sourceName} (${sourceUrl})`);
      
      const result = await scrapeUrl(sourceUrl, FIRECRAWL_API_KEY);
      
      if (!result.success || !result.markdown || result.markdown.length < 100) {
        return new Response(
          JSON.stringify({ error: result.error || 'No content found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Determine category and country
      const isDrGreen = DISPENSARY_SOURCES.DRGREEN_NETWORK.some(s => s.url === sourceUrl || s.name === sourceName);
      const category = isDrGreen ? 'drgreen' : 'dispensary';
      let countryCodeVal = 'Network';
      
      if (DISPENSARY_SOURCES.PT.some(s => s.url === sourceUrl || s.name === sourceName)) countryCodeVal = 'PT';
      else if (DISPENSARY_SOURCES.UK.some(s => s.url === sourceUrl || s.name === sourceName)) countryCodeVal = 'GB';
      else if (DISPENSARY_SOURCES.ZA.some(s => s.url === sourceUrl || s.name === sourceName)) countryCodeVal = 'ZA';

      const { error: upsertError } = await supabase
        .from('strain_knowledge')
        .upsert({
          strain_name: sourceName.toLowerCase(),
          source_url: sourceUrl,
          source_name: sourceName,
          country_code: countryCodeVal,
          category,
          scraped_content: result.markdown.substring(0, 50000),
          last_scraped_at: new Date().toISOString(),
        }, {
          onConflict: 'strain_name,source_url',
        });

      if (upsertError) {
        console.error('Error upserting:', upsertError);
        return new Response(
          JSON.stringify({ error: upsertError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          sourceName,
          contentLength: result.markdown.length,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Original strain-specific scraping logic
    if (!strainName) {
      return new Response(
        JSON.stringify({ error: 'Strain name or action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const { data: cachedData } = await supabase
        .from('strain_knowledge')
        .select('*')
        .ilike('strain_name', `%${strainName}%`)
        .gte('last_scraped_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (cachedData && cachedData.length > 0) {
        console.log(`Using cached data for ${strainName}: ${cachedData.length} sources`);
        return new Response(
          JSON.stringify({ success: true, data: cachedData, fromCache: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Scraping fresh data for strain: ${strainName}`);

    // Determine which sources to scrape based on country code
    let sourcesToScrape = [...DISPENSARY_SOURCES.DRGREEN_NETWORK];
    
    if (countryCode === 'PT' || !countryCode) {
      sourcesToScrape = [...DISPENSARY_SOURCES.PT, ...sourcesToScrape];
    } else if (countryCode === 'UK' || countryCode === 'GB') {
      sourcesToScrape = [...DISPENSARY_SOURCES.UK, ...sourcesToScrape];
    } else if (countryCode === 'ZA') {
      sourcesToScrape = [...DISPENSARY_SOURCES.ZA, ...sourcesToScrape];
    }

    // Limit concurrent scrapes to avoid rate limits
    const results: ScrapeResult[] = [];
    const batchSize = 3;
    
    for (let i = 0; i < sourcesToScrape.length; i += batchSize) {
      const batch = sourcesToScrape.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(source => scrapeStrainFromSource(strainName, source, FIRECRAWL_API_KEY))
      );
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < sourcesToScrape.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Filter successful results and store in database
    const successfulResults = results.filter(r => r.success && r.content.length > 100);
    
    console.log(`Successfully scraped ${successfulResults.length}/${results.length} sources for ${strainName}`);

    // Upsert results to database
    for (const result of successfulResults) {
      const { error: upsertError } = await supabase
        .from('strain_knowledge')
        .upsert({
          strain_name: strainName.toLowerCase(),
          source_url: result.sourceUrl,
          source_name: result.sourceName,
          country_code: countryCode || 'PT',
          category: DISPENSARY_SOURCES.DRGREEN_NETWORK.some(s => s.url === result.sourceUrl) 
            ? 'drgreen_network' 
            : 'dispensary',
          scraped_content: result.content.substring(0, 50000), // Limit content size
          last_scraped_at: new Date().toISOString(),
        }, {
          onConflict: 'strain_name,source_url',
        });

      if (upsertError) {
        console.error(`Error upserting strain knowledge:`, upsertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: successfulResults.map(r => ({
          sourceName: r.sourceName,
          sourceUrl: r.sourceUrl,
          contentLength: r.content.length,
        })),
        totalScraped: successfulResults.length,
        fromCache: false,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in strain-knowledge:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
