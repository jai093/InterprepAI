
// Placeholder for candidate interview/assessment page for invite links.
// This will render the actual live/video interview UI for the invited user later.
import React from "react";

export default function CandidateInterview() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Candidate Live Interview</h1>
        <p className="text-gray-600 mb-2">
          This is the URL a candidate will use to join the scheduled assessment/interview.
        </p>
        {/* TODO: Implement live interview session here */}
        <div className="mt-6 text-gray-400">Live interview functionality coming soon.</div>
      </div>
    </div>
  );
}
