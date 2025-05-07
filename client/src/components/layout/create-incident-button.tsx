import { useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

/**
 * A global floating action button that allows creating incidents from anywhere in the app
 */
export function CreateIncidentButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleQuickSubmit = () => {
    if (!title || !type || !venue) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Close the dialog
    setOpen(false);
    
    // Show success toast
    toast({
      title: "Quick incident created",
      description: "You'll be redirected to the incidents page to add more details."
    });
    
    // Reset form
    setTitle("");
    setType("");
    setVenue("");
    setDescription("");
    
    // Navigate to incidents page
    setLocation("/incidents");
  };

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            variant="destructive" 
            className="rounded-full shadow-lg flex items-center gap-2"
          >
            <AlertTriangle className="h-5 w-5" />
            Create Incident
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quick Incident Report</DialogTitle>
            <DialogDescription>
              Create a quick incident report. You can add more details after submission.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="incident-title" className="text-right">
                Title*
              </Label>
              <Input
                id="incident-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
                placeholder="Brief title of the incident"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="incident-type" className="text-right">
                Type*
              </Label>
              <Select 
                value={type} 
                onValueChange={setType}
              >
                <SelectTrigger className="col-span-3" id="incident-type">
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Physical Altercation</SelectItem>
                  <SelectItem value="verbal">Verbal Altercation</SelectItem>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="intoxication">Intoxication</SelectItem>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="property">Property Damage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="incident-venue" className="text-right">
                Venue*
              </Label>
              <Select 
                value={venue} 
                onValueChange={setVenue}
              >
                <SelectTrigger className="col-span-3" id="incident-venue">
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Downtown Club</SelectItem>
                  <SelectItem value="2">Riverside Lounge</SelectItem>
                  <SelectItem value="3">The Grand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="incident-description" className="text-right">
                Details
              </Label>
              <Textarea
                id="incident-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Describe what happened"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" onClick={handleQuickSubmit}>Create Incident</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}