
import React, { RefObject } from "react";

interface InterviewCameraProps {
  videoRef: RefObject<HTMLVideoElement>;
  showCamera?: boolean;
}

const InterviewCamera: React.FC<InterviewCameraProps> = ({ videoRef, showCamera = true }) => {
  if (!showCamera) return null;

  return (
    <div className="w-48 border-l bg-gray-50 flex flex-col">
      <div className="p-2 text-xs font-medium text-gray-600 text-center border-b">
        Your Video
      </div>
      <div className="flex-1 flex items-center justify-center p-2">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-32 rounded-lg border shadow bg-black object-cover"
        />
      </div>
    </div>
  );
};

export default InterviewCamera;
