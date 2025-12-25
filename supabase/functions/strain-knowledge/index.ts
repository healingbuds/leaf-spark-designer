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
    const { strainName, countryCode, forceRefresh } = await req.json();

    if (!strainName) {
      return new Response(
        JSON.stringify({ error: 'Strain name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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
