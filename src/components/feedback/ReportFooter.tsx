
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { Download, Save, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SafeInterviewData } from "./types";

interface ReportFooterProps {
  safeInterviewData: SafeInterviewData;
  videoUrl: string | null;
  audioUrl: string | null;
  onSave?: () => Promise<void>;
  onRestart?: () => void;
  isSaving?: boolean;
}

const ReportFooter = ({ 
  safeInterviewData, 
  videoUrl, 
  audioUrl, 
  onSave, 
  onRestart,
  isSaving = false
}: ReportFooterProps) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    
    try {
      if (videoUrl) {
        const a = document.createElement('a');
        a.href = videoUrl;
        a.download = `interview-${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "Download started",
          description: "Your interview recording is downloading.",
        });
      } else {
        toast({
          title: "No recording available",
          description: "There is no recording to download.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description: "Could not download the recording.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <CardFooter className="flex justify-between border-t pt-6">
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleDownload}
          disabled={!videoUrl || isDownloading}
        >
          <Download className="h-4 w-4" />
          Download Recording
        </Button>
        
        {onRestart && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={onRestart}
          >
            <RefreshCw className="h-4 w-4" />
            New Interview
          </Button>
        )}
      </div>
      
      {onSave && (
        <Button 
          size="sm" 
          className="gap-1"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Feedback"}
        </Button>
      )}
    </CardFooter>
  );
};

export default ReportFooter;
