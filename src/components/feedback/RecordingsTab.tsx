
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Download, Video, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RecordingsTabProps {
  videoUrl: string | null;
  audioUrl: string | null;
}

const RecordingsTab = ({ videoUrl, audioUrl }: RecordingsTabProps) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const downloadVideo = () => {
    if (!videoUrl) {
      toast({
        title: "No recording available",
        description: "There is no video recording to download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `interview-recording-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Video Downloaded",
        description: "Your interview video has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading video:", error);
      toast({
        title: "Download Error",
        description: "Could not download the video.",
        variant: "destructive"
      });
    }
  };
  
  const downloadAudio = () => {
    if (!audioUrl) {
      toast({
        title: "No audio available",
        description: "There is no audio recording to download.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `interview-audio-${new Date().toISOString().split('T')[0]}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Audio Downloaded",
        description: "Your interview audio has been downloaded.",
      });
    } catch (error) {
      console.error("Error downloading audio:", error);
      toast({
        title: "Download Error",
        description: "Could not download the audio.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Video Recording */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Video Recording</h3>
        {videoUrl ? (
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <video 
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No video recording available</p>
            </div>
          </div>
        )}
        
        {videoUrl && (
          <div className="flex justify-end mt-3">
            <Button 
              variant="outline" 
              onClick={downloadVideo}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" /> Download Video
            </Button>
          </div>
        )}
      </div>
      
      {/* Audio Recording */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Audio Recording</h3>
        {audioUrl ? (
          <div className="bg-gray-100 rounded-lg p-4">
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              controls 
              className="w-full" 
            />
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-10 flex items-center justify-center">
            <div className="text-center">
              <Mic className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No audio recording available</p>
            </div>
          </div>
        )}
        
        {audioUrl && (
          <div className="flex justify-end mt-3">
            <Button 
              variant="outline" 
              onClick={downloadAudio}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" /> Download Audio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingsTab;
