
import { Link } from "react-router-dom";
import { Home, Users, CalendarDays, Search, Settings } from "lucide-react";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem 
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { MeetupSidebarCard } from "./meetups/MeetupSidebarCard";
import { useMeetups } from "@/hooks/useMeetups";

export function AppSidebar() {
  const { user } = useAuth();
  const { meetups } = useMeetups();

  // Get the upcoming meetups (max 3)
  const upcomingMeetups = meetups.slice(0, 3);
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center">
          <span className="font-bold text-lg">InterprepAI</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/" className="flex px-4 h-8 w-full items-center space-x-3 text-sm rounded-md text-muted-foreground transition-all hover:text-foreground hover:bg-secondary">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {user && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/dashboard" className="flex px-4 h-8 w-full items-center space-x-3 text-sm rounded-md text-muted-foreground transition-all hover:text-foreground hover:bg-secondary">
                        <Search className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/practice" className="flex px-4 h-8 w-full items-center space-x-3 text-sm rounded-md text-muted-foreground transition-all hover:text-foreground hover:bg-secondary">
                        <CalendarDays className="h-4 w-4" />
                        <span>Interview Simulation</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link to="/meetups" className="flex px-4 h-8 w-full items-center space-x-3 text-sm rounded-md text-muted-foreground transition-all hover:text-foreground hover:bg-secondary">
                        <Users className="h-4 w-4" />
                        <span>Meetups</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Upcoming Meetups</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-4 space-y-2">
                {upcomingMeetups.length > 0 ? (
                  upcomingMeetups.map((meetup) => (
                    <MeetupSidebarCard key={meetup.id} meetup={meetup} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No upcoming meetups</p>
                )}
                
                <Link 
                  to="/meetups" 
                  className="text-xs text-interprepai-600 hover:underline block pt-1"
                >
                  View all meetups
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        
      </SidebarContent>
    </Sidebar>
  );
}
