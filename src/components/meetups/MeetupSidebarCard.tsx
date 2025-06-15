
import { Link } from "react-router-dom";
import { CalendarIcon, MapPin } from "lucide-react";
import { Meetup } from "@/hooks/useMeetups";

interface MeetupSidebarCardProps {
  meetup: Meetup;
}

export function MeetupSidebarCard({ meetup }: MeetupSidebarCardProps) {
  return (
    <Link 
      to={`/meetup/${meetup.id}`} 
      className="block p-2 rounded-md border border-border hover:bg-accent transition-colors"
    >
      <h4 className="font-medium text-xs line-clamp-1">{meetup.title}</h4>
      
      <div className="flex items-center gap-1 mt-1">
        <CalendarIcon className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{meetup.date}</span>
      </div>
      
      <div className="flex items-center gap-1 mt-0.5">
        <MapPin className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground line-clamp-1">{meetup.location}</span>
      </div>
    </Link>
  );
}
