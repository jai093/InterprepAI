
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import React from "react";

interface ConnectionAttemptAlertProps {
  attempt: number;
  max: number;
}

const ConnectionAttemptAlert: React.FC<ConnectionAttemptAlertProps> = ({ attempt, max }) => (
  <Alert>
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      Connection attempt {attempt} of {max}.
      {attempt >= max ? " Please refresh the page to try again." : ""}
    </AlertDescription>
  </Alert>
);

export default ConnectionAttemptAlert;
