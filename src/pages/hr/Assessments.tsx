
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function HrAssessmentsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Button className="bg-indigo-700 hover:bg-indigo-800 text-white flex items-center gap-2 px-4 py-2" disabled>
          <Plus className="w-4 h-4" />
          Create Assessment
        </Button>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow text-gray-500">
        HRs will be able to create new assessments, customize questions, and share links with candidates.  
        <br />This section is under construction!
      </div>
    </div>
  );
}
