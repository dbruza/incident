import { Venue } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface VenueOverviewProps {
  venues: Venue[];
}

export function VenueOverview({ venues }: VenueOverviewProps) {
  // Get security sign-ins for each venue
  const { data: securitySignIns } = useQuery({
    queryKey: ["/api/security-sign-ins", "active=true"],
  });
  
  // Get incidents for all venues
  const { data: incidents } = useQuery({
    queryKey: ["/api/incidents"],
  });
  
  // Count security staff on duty for a venue
  const countSecurityOnDuty = (venueId: number) => {
    if (!securitySignIns) return 0;
    return securitySignIns.filter(
      (signIn: any) => signIn.venue_id === venueId && signIn.status === "on-duty"
    ).length;
  };
  
  // Count incidents today for a venue
  const countIncidentsToday = (venueId: number) => {
    if (!incidents) return 0;
    const today = new Date().toISOString().split('T')[0];
    return incidents.filter(
      (incident: any) => {
        const incidentDate = new Date(incident.date).toISOString().split('T')[0];
        return incident.venue_id === venueId && incidentDate === today;
      }
    ).length;
  };
  
  // Get venue status
  const getVenueStatus = (venue: Venue, securityCount: number) => {
    if (venue.status !== "open") return "Off hours";
    
    if (securityCount === 0) return "Attention needed";
    
    return "Normal operation";
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Normal operation":
        return "text-green-400";
      case "Attention needed":
        return "text-amber-400";
      default:
        return "text-gray-400";
    }
  };
  
  // Display only first 3 venues
  const displayVenues = venues.slice(0, 3);
  
  return (
    <div className="mt-4 overflow-hidden bg-card shadow rounded-lg border border-gray-800">
      <div className="px-4 py-5 sm:p-6">
        {venues.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No venues found. Add venues to see them here.</p>
            <Link href="/venues">
              <Button className="mt-4">Manage Venues</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {displayVenues.map((venue) => {
              const securityCount = countSecurityOnDuty(venue.id);
              const incidentsCount = countIncidentsToday(venue.id);
              const status = getVenueStatus(venue, securityCount);
              
              return (
                <div key={venue.id} className="bg-[hsl(240_10%_10%)] rounded-lg shadow p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">{venue.name}</h3>
                    <Badge className={
                      venue.status === "open" 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    }>
                      {venue.status === "open" ? "Open Now" : "Closed"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Security on-duty:</span>
                      <span className="text-white">{securityCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Incidents today:</span>
                      <span className="text-white">{incidentsCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Status:</span>
                      <span className={getStatusColor(status)}>{status}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href={`/venues`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
