
import React from "react";
import { Button } from "@/components/ui/button";

export default function StepComplete({ value, onClose }: { value: any; onClose: () => void }) {
  return (
    <div className="text-center p-4">
      <h2 className="text-2xl font-bold mb-4">Assessment Created!</h2>
      <div className="mb-6 text-gray-500">You can now invite candidates to this assessment or copy the invite link.</div>
      {/* Placeholder: We'll implement invite dialog next */}
      <Button className="w-full" onClick={onClose}>Done</Button>
    </div>
  );
}
