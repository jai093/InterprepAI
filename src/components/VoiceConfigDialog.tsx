
import { useState } from "react";
import { useEleven } from "@/hooks/useElevenLabs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ELEVEN_LABS_VOICES } from "@/utils/textToSpeech";
import { Volume2 } from "lucide-react";

interface VoiceConfigDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

// Helper map of voice names and descriptions
const VOICE_DETAILS = {
  [ELEVEN_LABS_VOICES.ARIA]: { name: "Aria", description: "Professional female voice" },
  [ELEVEN_LABS_VOICES.ROGER]: { name: "Roger", description: "Authoritative male voice" },
  [ELEVEN_LABS_VOICES.SARAH]: { name: "Sarah", description: "Friendly female voice" },
  [ELEVEN_LABS_VOICES.CHARLIE]: { name: "Charlie", description: "Casual male voice" },
};

const VoiceConfigDialog = ({ children, open, onOpenChange }: VoiceConfigDialogProps) => {
  const { apiKey, setApiKey, currentVoice, setCurrentVoice, clearApiKey } = useEleven();
  
  const [inputApiKey, setInputApiKey] = useState(apiKey || "");
  const [dialogOpen, setDialogOpen] = useState(open || false);
  
  // Use the provided onOpenChange or the local state setter
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setDialogOpen(newOpen);
    }
  };

  const handleSave = () => {
    if (inputApiKey) {
      setApiKey(inputApiKey);
    }
    handleOpenChange(false);
  };

  const handleClear = () => {
    setInputApiKey("");
    clearApiKey();
  };

  return (
    <Dialog open={open !== undefined ? open : dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="flex gap-2 items-center">
            <Volume2 className="h-4 w-4" />
            <span>Configure Voice</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Voice Interview Settings</DialogTitle>
          <DialogDescription>
            Configure your AI interviewer's voice using ElevenLabs technology.
            {!apiKey && " You'll need an API key to enable voice features."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Your ElevenLabs API key"
              value={inputApiKey}
              onChange={(e) => setInputApiKey(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="voice" className="text-right">
              Voice
            </Label>
            <div className="col-span-3">
              <Select value={currentVoice} onValueChange={setCurrentVoice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select voice" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ELEVEN_LABS_VOICES).map(([key, value]) => (
                    <SelectItem key={value} value={value}>
                      {VOICE_DETAILS[value]?.name || key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentVoice && (
                <p className="text-xs text-gray-500 mt-1">
                  {VOICE_DETAILS[currentVoice]?.description || ""}
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {apiKey && (
            <Button variant="outline" onClick={handleClear}>
              Clear API Key
            </Button>
          )}
          <Button type="submit" onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceConfigDialog;
