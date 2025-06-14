
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText } from "lucide-react";
import React from "react";

interface ResumeStatusAlertProps {
  resumeUrl?: string | null;
}

const ResumeStatusAlert: React.FC<ResumeStatusAlertProps> = ({ resumeUrl }) => {
  if (resumeUrl) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
        <FileText className="h-4 w-4" />
        <span>
          Resume found in profile – AI will ask personalized questions based on your background
        </span>
      </div>
    );
  }
  return (
    <Alert>
      <AlertDescription>
        No resume found in your profile. The AI will ask general interview questions. Upload your resume in the Profile section for personalized questions.
      </AlertDescription>
    </Alert>
  );
};

export default ResumeStatusAlert;
