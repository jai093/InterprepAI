
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface MediaDeviceState {
  stream: MediaStream | null;
  cameraReady: boolean;
  microphoneReady: boolean;
  error: string | null;
}

export const useMediaDevices = () => {
  const { toast } = useToast();
  const [deviceState, setDeviceState] = useState<MediaDeviceState>({
    stream: null,
    cameraReady: false,
    microphoneReady: false,
    error: null
  });
  
  const requestMediaPermissions = async () => {
    try {
      // Request access to camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      setDeviceState({
        stream,
        cameraReady: true,
        microphoneReady: true,
        error: null
      });
      
      toast({
        title: "Devices connected",
        description: "Camera and microphone access granted.",
      });
      
      return stream;
    } catch (error: any) {
      console.error("Error accessing media devices:", error);
      setDeviceState({
        stream: null,
        cameraReady: false,
        microphoneReady: false,
        error: error.message
      });
      
      toast({
        title: "Device access error",
        description: `Could not access camera/microphone: ${error.message}`,
        variant: "destructive"
      });
      
      return null;
    }
  };
  
  const stopMediaStream = () => {
    if (deviceState.stream) {
      deviceState.stream.getTracks().forEach(track => track.stop());
      setDeviceState({
        stream: null,
        cameraReady: false,
        microphoneReady: false,
        error: null
      });
    }
  };
  
  useEffect(() => {
    // Clean up on unmount
    return () => {
      stopMediaStream();
    };
  }, []);
  
  return {
    ...deviceState,
    requestMediaPermissions,
    stopMediaStream
  };
};
