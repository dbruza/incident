import { Card, CardContent } from "@/components/ui/card";
import { SecuritySignIn } from "@shared/schema";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";

interface RecentSignInsProps {
  signIns: SecuritySignIn[];
}

export function RecentSignIns({ signIns }: RecentSignInsProps) {
  const { data: venues } = useQuery({
    queryKey: ["/api/venues"],
  });

  // Get venue name from venue_id
  const getVenueName = (venueId: number) => {
    const venue = venues?.find(v => v.id === venueId);
    return venue ? venue.name : "Unknown Venue";
  };

  // Format position
  const formatPosition = (position: string) => {
    switch (position) {
      case "door":
        return "Door Security";
      case "floor":
        return "Floor Security";
      case "vip":
        return "VIP Security";
      case "manager":
        return "Security Manager";
      default:
        return position.charAt(0).toUpperCase() + position.slice(1);
    }
  };

  // Get formatted time
  const getFormattedTime = (date: Date | string) => {
    return format(new Date(date), 'HH:mm');
  };

  return (
    <Card>
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-base font-medium text-white">Security Sign-Ins Today</h3>
        <a href="/security-signin" className="text-sm text-primary hover:text-indigo-400">View all</a>
      </div>
      
      <div className="overflow-hidden">
        {signIns.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            No security staff currently on duty
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-800">
            {signIns.slice(0, 3).map((signIn) => (
              <li key={signIn.id} className="px-4 py-4 sm:px-6 hover:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="min-w-0 flex-1 flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white">
                          {signIn.security_name.substring(0, 1).toUpperCase()}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <div>
                          <p className="text-sm font-medium text-white truncate">
                            {signIn.security_name}
                          </p>
                          <p className="mt-1 text-sm text-gray-400 truncate">
                            Badge #{signIn.badge_number} • {getVenueName(signIn.venue_id)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <div className="text-sm text-gray-400 flex flex-col items-end">
                      <span>Signed in {getFormattedTime(signIn.time_in)}</span>
                      {signIn.status === "on-duty" ? (
                        <span className="text-green-400">Currently on duty</span>
                      ) : signIn.time_out ? (
                        <span>Signed out {getFormattedTime(signIn.time_out)}</span>
                      ) : null}
                    </div>
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
