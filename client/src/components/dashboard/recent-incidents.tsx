import { Card, CardContent } from "@/components/ui/card";
import { Incident } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { AlertTriangle, UserCheck, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface RecentIncidentsProps {
  incidents: Incident[];
}

export function RecentIncidents({ incidents }: RecentIncidentsProps) {
  const { data: venues } = useQuery({
    queryKey: ["/api/venues"],
  });

  // Get venue name from venue_id
  const getVenueName = (venueId: number) => {
    const venue = venues?.find(v => v.id === venueId);
    return venue ? venue.name : "Unknown Venue";
  };

  // Get formatted time
  const getFormattedTime = (date: Date | string) => {
    const incidentDate = new Date(date);
    const now = new Date();
    const isToday = incidentDate.toDateString() === now.toDateString();
    const isYesterday = 
      new Date(now.setDate(now.getDate() - 1)).toDateString() === incidentDate.toDateString();
    
    if (isToday) {
      return formatDistanceToNow(incidentDate, { addSuffix: true });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return format(incidentDate, 'MMM d');
    }
  };

  // Get icon based on incident type
  const getIcon = (type: string) => {
    switch (type) {
      case "physical-altercation":
      case "verbal-altercation":
      case "property-damage":
      case "theft":
        return (
          <span className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="text-red-500" />
          </span>
        );
      case "refused-entry":
      case "ejection":
        return (
          <span className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <UserCheck className="text-amber-500" />
          </span>
        );
      case "medical":
      default:
        return (
          <span className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <ShieldAlert className="text-blue-500" />
          </span>
        );
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge className="mt-1 bg-red-500/20 text-red-400">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="mt-1 bg-amber-500/20 text-amber-400">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="mt-1 bg-blue-500/20 text-blue-400">
            Low
          </Badge>
        );
      case "critical":
        return (
          <Badge className="mt-1 bg-purple-500/20 text-purple-400">
            Critical
          </Badge>
        );
      default:
        return (
          <Badge className="mt-1 bg-blue-500/20 text-blue-400">
            {severity.charAt(0).toUpperCase() + severity.slice(1)}
          </Badge>
        );
    }
  };

  // Format incident type
  const formatIncidentType = (type: string) => {
    return type
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Card>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-medium text-white">Recent Incidents</h3>
        <a href="/incidents" className="text-sm text-primary hover:text-indigo-400">View all</a>
      </div>
      
      <div className="overflow-hidden">
        {incidents.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            No incidents reported recently
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-800">
            {incidents.slice(0, 3).map((incident) => (
              <li key={incident.id} className="px-4 py-4 sm:px-6 hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        {getIcon(incident.type)}
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div>
                          <p className="text-sm font-medium text-white truncate">
                            {formatIncidentType(incident.type)}
                          </p>
                          <p className="mt-1 text-sm text-gray-400 truncate">
                            {getVenueName(incident.venue_id)} - {incident.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex flex-col items-end">
                    <p className="text-sm text-gray-400">{getFormattedTime(incident.date)}</p>
                    {getSeverityBadge(incident.severity)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
