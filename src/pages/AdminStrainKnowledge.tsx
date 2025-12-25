import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  AlertTriangle,
  Globe,
  Clock,
  ArrowLeft,
  Calendar,
  Database,
  ExternalLink,
  Search,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/layout/Header';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StrainKnowledge {
  id: string;
  strain_name: string;
  source_name: string;
  source_url: string;
  country_code: string;
  category: string;
  scraped_content: string | null;
  effects: string[] | null;
  medical_conditions: string[] | null;
  last_scraped_at: string;
  created_at: string;
}

const DISPENSARY_SOURCES = [
  { name: 'Ace Cann', url: 'https://acecann.com/', country: 'PT', category: 'dispensary' },
  { name: 'Canapac', url: 'https://canapac.pt/', country: 'PT', category: 'dispensary' },
  { name: 'Cannactiva', url: 'https://cannactiva.com/', country: 'PT', category: 'dispensary' },
  { name: 'Curaleaf Clinic', url: 'https://curaleafclinic.com/', country: 'GB', category: 'dispensary' },
  { name: 'Releaf', url: 'https://releaf.co.uk/', country: 'GB', category: 'dispensary' },
  { name: 'Taste of Cannabis', url: 'https://tasteofcannabis.co.za/', country: 'ZA', category: 'dispensary' },
  { name: 'Cannafrica SA', url: 'https://cannafricasa.co.za/', country: 'ZA', category: 'dispensary' },
  { name: 'Medibiss', url: 'https://medibiss.com/', country: 'Network', category: 'drgreen' },
  { name: 'Martini Botanical', url: 'https://martinibotanical.com/', country: 'Network', category: 'drgreen' },
  { name: 'Green Base Network', url: 'https://greenbasenetwork.co.uk/', country: 'Network', category: 'drgreen' },
  { name: 'Professor Green', url: 'https://professorgreen.co.za/', country: 'Network', category: 'drgreen' },
  { name: 'Terry Stoned', url: 'https://terrystoned.com/', country: 'Network', category: 'drgreen' },
  { name: 'Maybach Meds', url: 'https://maybachmeds.com/', country: 'Network', category: 'drgreen' },
];

const AdminStrainKnowledge = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapingSource, setScrapingSource] = useState<string | null>(null);
  const [knowledgeData, setKnowledgeData] = useState<StrainKnowledge[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedKnowledge, setSelectedKnowledge] = useState<StrainKnowledge | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');

      if (error) throw error;

      if (!roles || roles.length === 0) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsAdmin(true);
      await fetchKnowledgeData();
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsLoading(false);
    }
  };

  const fetchKnowledgeData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('strain_knowledge')
        .select('*')
        .order('last_scraped_at', { ascending: false });

      if (error) throw error;
      setKnowledgeData(data || []);
    } catch (error) {
      console.error('Error fetching strain knowledge:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch strain knowledge data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const scrapeAllSources = async () => {
    setScraping(true);
    try {
      const { data, error } = await supabase.functions.invoke('strain-knowledge', {
        body: { action: 'scrape_all' },
      });

      if (error) throw error;

      toast({
        title: 'Scraping Complete',
        description: `Successfully scraped ${data?.scraped || 0} strain entries from all sources`,
      });

      await fetchKnowledgeData();
    } catch (error: any) {
      console.error('Error scraping all sources:', error);
      toast({
        title: 'Scraping Failed',
        description: error.message || 'Failed to scrape dispensary sources',
        variant: 'destructive',
      });
    } finally {
      setScraping(false);
    }
  };

  const scrapeSource = async (sourceName: string, sourceUrl: string) => {
    setScrapingSource(sourceName);
    try {
      const { data, error } = await supabase.functions.invoke('strain-knowledge', {
        body: { 
          action: 'scrape_single',
          sourceName,
          sourceUrl,
        },
      });

      if (error) throw error;

      toast({
        title: 'Scraping Complete',
        description: `Successfully scraped data from ${sourceName}`,
      });

      await fetchKnowledgeData();
    } catch (error: any) {
      console.error('Error scraping source:', error);
      toast({
        title: 'Scraping Failed',
        description: error.message || `Failed to scrape ${sourceName}`,
        variant: 'destructive',
      });
    } finally {
      setScrapingSource(null);
    }
  };

  const deleteKnowledgeEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('strain_knowledge')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Knowledge entry removed successfully',
      });

      setKnowledgeData(prev => prev.filter(k => k.id !== id));
    } catch (error: any) {
      console.error('Error deleting knowledge:', error);
      toast({
        title: 'Delete Failed',
        description: error.message || 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  const filteredData = knowledgeData.filter(k => {
    const matchesSearch = k.strain_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          k.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = countryFilter === 'all' || k.country_code === countryFilter;
    const matchesCategory = categoryFilter === 'all' || k.category === categoryFilter;
    return matchesSearch && matchesCountry && matchesCategory;
  });

  const stats = {
    total: knowledgeData.length,
    portugal: knowledgeData.filter(k => k.country_code === 'PT').length,
    uk: knowledgeData.filter(k => k.country_code === 'GB').length,
    southAfrica: knowledgeData.filter(k => k.country_code === 'ZA').length,
    drGreenNetwork: knowledgeData.filter(k => k.category === 'drgreen').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <Card className="max-w-md mx-auto bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="pt-12 pb-8">
                <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
                <p className="text-muted-foreground mb-6">
                  Admin privileges are required to access this page.
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mb-2"
                  onClick={() => navigate('/admin')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="h-8 w-8 text-primary" />
                  <h1 className="text-3xl font-bold text-foreground">Strain Knowledge Base</h1>
                </div>
                <p className="text-muted-foreground">
                  AI-powered strain data from regional dispensary sources
                </p>
              </div>
              <Button
                onClick={scrapeAllSources}
                disabled={scraping}
                className="gap-2"
              >
                {scraping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Scrape All Sources
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇵🇹</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Portugal</p>
                      <p className="text-2xl font-bold text-foreground">{stats.portugal}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇬🇧</span>
                    <div>
                      <p className="text-sm text-muted-foreground">UK</p>
                      <p className="text-2xl font-bold text-foreground">{stats.uk}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🇿🇦</span>
                    <div>
                      <p className="text-sm text-muted-foreground">South Africa</p>
                      <p className="text-2xl font-bold text-foreground">{stats.southAfrica}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Globe className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dr. Green Network</p>
                      <p className="text-2xl font-bold text-foreground">{stats.drGreenNetwork}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scheduled Job Info */}
            <Card className="bg-gradient-to-r from-cyan-500/5 to-primary/5 border-cyan-500/20 mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-cyan-500" />
                  <CardTitle className="text-lg">Automated Weekly Refresh</CardTitle>
                </div>
                <CardDescription>
                  Strain knowledge is automatically refreshed every Sunday at 3:00 AM UTC
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Cron Schedule: 0 3 * * 0</span>
                  </div>
                  <Badge variant="outline" className="text-cyan-600 border-cyan-500/30">
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Dispensary Sources */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Dispensary Sources
                </CardTitle>
                <CardDescription>
                  Click to manually scrape individual sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DISPENSARY_SOURCES.map((source) => (
                    <div
                      key={source.url}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/30"
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={source.category === 'drgreen' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {source.country}
                        </Badge>
                        <span className="text-sm font-medium">{source.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(source.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={scrapingSource === source.name || scraping}
                          onClick={() => scrapeSource(source.name, source.url)}
                        >
                          {scrapingSource === source.name ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Knowledge Data Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle>Scraped Knowledge Data</CardTitle>
                    <CardDescription>
                      {filteredData.length} entries found
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search strains..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <Select value={countryFilter} onValueChange={setCountryFilter}>
                      <SelectTrigger className="w-full sm:w-36">
                        <SelectValue placeholder="Country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Countries</SelectItem>
                        <SelectItem value="PT">Portugal</SelectItem>
                        <SelectItem value="GB">UK</SelectItem>
                        <SelectItem value="ZA">South Africa</SelectItem>
                        <SelectItem value="Network">Network</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-36">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="dispensary">Dispensary</SelectItem>
                        <SelectItem value="drgreen">Dr. Green Network</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No strain knowledge data found</p>
                    <p className="text-sm mt-2">Click "Scrape All Sources" to populate the database</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Strain</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Country</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Last Scraped</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredData.slice(0, 50).map((knowledge) => (
                          <TableRow key={knowledge.id}>
                            <TableCell className="font-medium">
                              {knowledge.strain_name}
                            </TableCell>
                            <TableCell>
                              <a 
                                href={knowledge.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                {knowledge.source_name}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{knowledge.country_code}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={knowledge.category === 'drgreen' ? 'default' : 'secondary'}
                              >
                                {knowledge.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(knowledge.last_scraped_at), 'MMM d, yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setSelectedKnowledge(knowledge)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => deleteKnowledgeEntry(knowledge.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredData.length > 50 && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        Showing 50 of {filteredData.length} entries
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Knowledge Detail Dialog */}
      <Dialog open={!!selectedKnowledge} onOpenChange={() => setSelectedKnowledge(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              {selectedKnowledge?.strain_name}
            </DialogTitle>
            <DialogDescription>
              Scraped from {selectedKnowledge?.source_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedKnowledge && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{selectedKnowledge.country_code}</Badge>
                <Badge variant={selectedKnowledge.category === 'drgreen' ? 'default' : 'secondary'}>
                  {selectedKnowledge.category}
                </Badge>
              </div>

              {selectedKnowledge.effects && selectedKnowledge.effects.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Effects</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedKnowledge.effects.map((effect, i) => (
                      <Badge key={i} variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                        {effect}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedKnowledge.medical_conditions && selectedKnowledge.medical_conditions.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Medical Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedKnowledge.medical_conditions.map((condition, i) => (
                      <Badge key={i} variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedKnowledge.scraped_content && (
                <div>
                  <h4 className="font-medium mb-2">Scraped Content</h4>
                  <div className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {selectedKnowledge.scraped_content}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p>Last scraped: {format(new Date(selectedKnowledge.last_scraped_at), 'PPpp')}</p>
                <a 
                  href={selectedKnowledge.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 mt-1"
                >
                  View source <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AdminStrainKnowledge;
