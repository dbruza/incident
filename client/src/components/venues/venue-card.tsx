import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Building, User, AlertTriangle, Edit, MapPin, Phone } from "lucide-react";
import { Venue } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VenueEditForm } from "./venue-edit-form";
import { useState } from "react";

interface VenueCardProps {
  venue: Venue;
  onStatusChange: (id: number, status: string) => Promise<void>;
  onEdit: (id: number, data: Partial<Venue>) => Promise<void>;
  isUpdating: boolean;
}

export function VenueCard({ venue, onStatusChange, onEdit, isUpdating }: VenueCardProps) {
  const isOpen = venue.status === "open";
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Get security count and incidents count from API
  const { data: securityData } = useQuery<any[]>({
    queryKey: ["/api/security-sign-ins", venue.id.toString(), "active=true"],
    enabled: isOpen,
  });
  
  const { data: incidentsData } = useQuery<any[]>({
    queryKey: ["/api/incidents", venue.id.toString()],
  });
  
  const securityCount = securityData?.length || 0;
  const incidentsCount = incidentsData?.length || 0;
  
  const handleStatusChange = async () => {
    const newStatus = isOpen ? "closed" : "open";
    await onStatusChange(venue.id, newStatus);
  };
  
  const handleEdit = async (data: any) => {
    setIsEditing(true);
    try {
      await onEdit(venue.id, data);
      setIsEditDialogOpen(false);
    } finally {
      setIsEditing(false);
    }
  };
  
  return (
    <Card className="bg-[hsl(240_10%_10%)] hover:bg-[hsl(240_10%_12%)] transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">{venue.name}</h3>
          <Badge variant={isOpen ? "default" : "destructive"} className={`
            ${isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
          `}>
            {isOpen ? "Open Now" : "Closed"}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Security on-duty:</span>
            <span className="text-white">{isOpen ? securityCount : 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Incidents total:</span>
            <span className="text-white">{incidentsCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status:</span>
            <span className={
              isOpen 
                ? securityCount > 0 
                  ? "text-green-400" 
                  : "text-amber-400" 
                : "text-gray-400"
            }>
              {isOpen 
                ? securityCount > 0 
                  ? "Normal operation" 
                  : "Attention needed" 
                : "Off hours"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Address:</span>
            <span className="text-white truncate max-w-[60%] text-right">{venue.address}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Contact:</span>
            <span className="text-white truncate max-w-[60%] text-right">{venue.contact}</span>
          </div>
        </div>
        <div className="flex mt-4 space-x-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Venue</DialogTitle>
                <DialogDescription>
                  Make changes to the venue details below.
                </DialogDescription>
              </DialogHeader>
              <VenueEditForm 
                venue={venue} 
                onSubmit={handleEdit} 
                isLoading={isEditing}
              />
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleStatusChange}
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : isOpen ? "Close Venue" : "Open Venue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
