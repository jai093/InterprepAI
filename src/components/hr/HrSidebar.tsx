import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Users, 
  Mail, 
  Settings, 
  FileText,
  User,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/hr", icon: LayoutDashboard },
  { name: "Assessments", href: "/hr/assessments", icon: FileText },
  { name: "Invites", href: "/hr/invites", icon: Mail },
  { name: "Profile", href: "/hr/profile", icon: User },
  { name: "Settings", href: "/hr/settings", icon: Settings },
];

export function HrSidebar() {
  const location = useLocation();

  return (
    <div className="flex md:w-64 flex-col fixed inset-y-0 z-10 transform transition-transform duration-300 ease-in-out lg:translate-x-0">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h2 className="text-lg md:text-xl font-bold text-indigo-900">InterprepAI HR</h2>
        </div>
        <div className="mt-8 flex-grow flex flex-col">
          <nav className="flex-1 px-2 pb-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    isActive
                      ? "bg-indigo-100 text-indigo-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500",
                      "mr-3 flex-shrink-0 h-5 w-5"
                    )}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="px-2 py-4 border-t border-gray-200">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
              className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
            >
              <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <span className="truncate">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}