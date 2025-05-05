
import { SafeInterviewData } from "./types";

interface TranscriptTabProps {
  safeInterviewData: SafeInterviewData;
}

const TranscriptTab = ({ safeInterviewData }: TranscriptTabProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">Interview Transcript</h3>
      
      {safeInterviewData.transcripts && safeInterviewData.transcripts.length > 0 ? (
        safeInterviewData.transcripts.map((transcript, index) => (
          <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
            <p className="font-medium mb-2">Question: {transcript.question}</p>
            <p className="text-gray-700">{transcript.answer || "No answer recorded"}</p>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No transcript available</p>
      )}
    </div>
  );
};

export default TranscriptTab;
