
import { Alert, AlertDescription } from "@/components/ui/alert";
import React from "react";

interface LoadingAlertProps {
  isConnecting: boolean;
  isLoading: boolean;
}

const LoadingAlert: React.FC<LoadingAlertProps> = ({ isConnecting, isLoading }) => {
  if (!(isConnecting || isLoading)) return null;
  return (
    <Alert>
      <AlertDescription>
        {isConnecting
          ? "Establishing connection to AI interviewer..."
          : "Connecting to AI interviewer..."}
        {" "}Please allow microphone access when prompted.
      </AlertDescription>
    </Alert>
  );
};

export default LoadingAlert;
