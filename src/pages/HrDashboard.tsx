
import { useAuth } from "@/contexts/AuthContext";
import { HrSidebar } from "@/components/hr/HrSidebar";
import { HrCandidateTable } from "@/components/hr/HrCandidateTable";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <HrSidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-indigo-900">HR Dashboard</h1>
              <SidebarTrigger />
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-indigo-900 mb-2">
                  HR Dashboard
                </h1>
                <p className="text-gray-600 text-sm md:text-base">
                  View and manage your shortlisted/interviewed candidates
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <HrCandidateTable recruiterId={user.id} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
