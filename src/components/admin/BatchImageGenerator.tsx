import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Sparkles, Check, AlertCircle, Loader2 } from "lucide-react";

// Import the jar template
import jarTemplate from "@/assets/jar-template-reference.jpg";

interface BatchResult {
  productId: string;
  productName: string;
  status: "generated" | "cached" | "error";
  imageUrl?: string;
  error?: string;
}

export function BatchImageGenerator() {
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateUploaded, setTemplateUploaded] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    generated: number;
    cached: number;
    errors: number;
  } | null>(null);

  const uploadTemplate = async () => {
    setIsUploading(true);
    try {
      // Fetch the jar template image and convert to base64
      const response = await fetch(jarTemplate);
      const blob = await response.blob();
      
      // Convert blob to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data:image/jpeg;base64, prefix
          resolve(result.split(",")[1]);
        };
        reader.readAsDataURL(blob);
      });

      // Upload to storage via edge function
      const { data, error } = await supabase.functions.invoke("upload-jar-template", {
        body: { imageBase64: base64 },
      });

      if (error) throw error;

      setTemplateUploaded(true);
      toast.success("Jar template uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload jar template");
    } finally {
      setIsUploading(false);
    }
  };

  const generateImages = async () => {
    setIsGenerating(true);
    setResults([]);
    setSummary(null);

    try {
      toast.info("Starting batch image generation. This may take a few minutes...");

      const { data, error } = await supabase.functions.invoke("batch-generate-images", {
        body: {},
      });

      if (error) throw error;

      setResults(data.results || []);
      setSummary(data.summary || null);

      if (data.summary) {
        const { generated, cached, errors, total } = data.summary;
        if (errors > 0) {
          toast.warning(`Completed: ${generated} generated, ${cached} cached, ${errors} errors`);
        } else {
          toast.success(`All ${total} images processed successfully!`);
        }
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate images");
    } finally {
      setIsGenerating(false);
    }
  };

  const progress = summary 
    ? ((summary.generated + summary.cached) / summary.total) * 100 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Product Image Generator
        </CardTitle>
        <CardDescription>
          Generate branded 4K product images for all strains using AI
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1: Upload Template */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h4 className="font-medium">Step 1: Upload Jar Template</h4>
            <p className="text-sm text-muted-foreground">
              Upload the HB branded jar template to storage
            </p>
          </div>
          <Button
            onClick={uploadTemplate}
            disabled={isUploading || templateUploaded}
            variant={templateUploaded ? "outline" : "default"}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : templateUploaded ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {templateUploaded ? "Uploaded" : "Upload Template"}
          </Button>
        </div>

        {/* Step 2: Generate Images */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h4 className="font-medium">Step 2: Generate All Images</h4>
            <p className="text-sm text-muted-foreground">
              Generate 4K branded images for all 7 strains
            </p>
          </div>
          <Button
            onClick={generateImages}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Generate All"}
          </Button>
        </div>

        {/* Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              Processing images... This may take 2-3 minutes.
            </p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="font-medium">Results</h4>
            {summary && (
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">Generated: {summary.generated}</span>
                <span className="text-blue-600">Cached: {summary.cached}</span>
                <span className="text-red-600">Errors: {summary.errors}</span>
              </div>
            )}
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.productId}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                >
                  {result.status === "error" ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  <span className="flex-1">{result.productName}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {result.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
