import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { User, ShieldCheck } from "lucide-react";
import { SecuritySignIn } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface SecurityCardProps {
  signIn: SecuritySignIn;
  venueName: string;
  onSignOut: (id: number) => Promise<void>;
  isSigningOut: boolean;
}

export function SecurityCard({ signIn, venueName, onSignOut, isSigningOut }: SecurityCardProps) {
  const isOnDuty = signIn.status === "on-duty";
  
  // Format position for display
  const formatPosition = (position: string) => {
    return position
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSignOut = async () => {
    await onSignOut(signIn.id);
  };

  return (
    <Card className="hover:bg-gray-800/50 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className="min-w-0 flex-1 flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="min-w-0 flex-1 px-4">
              <div>
                <p className="text-sm font-medium text-white truncate">
                  {signIn.security_name}
                </p>
                <p className="mt-1 text-xs text-gray-400 truncate">
                  Badge #{signIn.badge_number} • {formatPosition(signIn.position)} • {venueName}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-400 flex flex-col">
          <span>Date: {format(new Date(signIn.date), 'MMM d, yyyy')}</span>
          <span>Signed in: {format(new Date(signIn.time_in), 'h:mm a')}</span>
          {signIn.time_out && (
            <span>Signed out: {format(new Date(signIn.time_out), 'h:mm a')}</span>
          )}
          {isOnDuty && (
            <span className="text-green-400 flex items-center mt-1">
              <ShieldCheck className="h-4 w-4 mr-1" />
              Currently on duty
            </span>
          )}
        </div>
        
        {isOnDuty && (
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full mt-4"
            disabled={isSigningOut}
          >
            {isSigningOut ? "Signing Out..." : "Sign Out"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
