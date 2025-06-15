
// Updated branding and added "Assessments" to nav, fixed URLs

import { Briefcase, Users, Settings, FileText } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Candidates", icon: Users, to: "/hr" },
  { label: "Assessments", icon: FileText, to: "/hr/assessments" },
  { label: "Invites", icon: Briefcase, to: "/hr/invites" },
  { label: "Settings", icon: Settings, to: "/hr/settings" },
];

export function HrSidebar() {
  const location = useLocation();
  return (
    <aside className="bg-gradient-to-b from-indigo-900 to-indigo-800 text-white w-56 min-h-screen flex-shrink-0 hidden md:flex flex-col shadow-xl">
      <div className="p-6 text-2xl font-black tracking-tight mb-8">
        <span className="text-white">InterprepAI </span>
        <span className="text-indigo-300">HR</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, icon: Icon, to }) => (
          <Link
            key={label}
            to={to}
            className={`flex items-center gap-3 px-6 py-2 text-lg rounded-l-full transition font-medium ${
              location.pathname === to
                ? "bg-indigo-700 shadow"
                : "hover:bg-indigo-600/60"
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex-grow" />
      <div className="p-4 text-sm text-indigo-300">
        <span>&copy; 2025 InterprepAI HR</span>
      </div>
    </aside>
  );
}
