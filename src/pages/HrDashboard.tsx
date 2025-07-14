
import { useAuth } from "@/contexts/AuthContext";
import { HrSidebar } from "@/components/hr/HrSidebar";
import { HrCandidateTable } from "@/components/hr/HrCandidateTable";

export default function HrDashboard() {
  const { user } = useAuth();

  // Only HR can view this dashboard, else display access denied
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-lg">
        Please sign in as a recruiter.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <HrSidebar />
      <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 overflow-y-auto md:ml-64">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-indigo-900 mb-2 tracking-tighter">
            InterprepAI HR Dashboard
          </h1>
          <div className="text-gray-500 text-sm md:text-base lg:text-lg">
            View and manage your shortlisted/interviewed candidates
          </div>
        </div>
        <div className="overflow-x-auto">
          <HrCandidateTable recruiterId={user.id} />
        </div>
      </main>
    </div>
  );
}
