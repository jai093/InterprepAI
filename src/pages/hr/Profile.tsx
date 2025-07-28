
import { useAuth } from "@/contexts/AuthContext";
import { HrSidebar } from "@/components/hr/HrSidebar";
import { HrProfile } from "@/components/hr/HrProfile";

export default function HrProfilePage() {
  const { user } = useAuth();

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
      <main className="flex-1 flex flex-col p-4 md:p-8 lg:p-12 overflow-y-auto lg:ml-64">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-indigo-900 mb-2 tracking-tighter">
            HR Profile
          </h1>
          <div className="text-gray-500 text-lg">
            Manage your profile information and view account statistics
          </div>
        </div>
        <HrProfile />
      </main>
    </div>
  );
}
