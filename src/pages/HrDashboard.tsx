
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
      <main className="flex-1 flex flex-col p-8 md:p-12 overflow-y-auto ml-0 md:ml-0">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-indigo-900 mb-2 tracking-tighter">
            HR Dashboard
          </h1>
          <div className="text-gray-500 text-lg">View and manage your shortlisted/interviewed candidates</div>
        </div>
        <HrCandidateTable recruiterId={user.id} />
      </main>
    </div>
  );
}
