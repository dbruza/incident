import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CctvCamera, Venue } from "@shared/schema";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

const cameraEditSchema = z.object({
  name: z.string().min(1, "Camera name is required"),
  type: z.string().min(1, "Camera type is required"),
  location: z.string().min(1, "Location is required"),
  status: z.enum(["Active", "Inactive", "Maintenance"] as const),
  venue_id: z.number().min(1, "Venue is required"),
  notes: z.string().nullable().optional(),
});

type CameraEditValues = z.infer<typeof cameraEditSchema>;

interface CameraEditFormProps {
  camera: CctvCamera;
  onSubmit: (data: CameraEditValues) => Promise<void>;
  isLoading: boolean;
}

export function CameraEditForm({ camera, onSubmit, isLoading }: CameraEditFormProps) {
  // Fetch venues for dropdown
  const { data: venues } = useQuery<Venue[]>({
    queryKey: ["/api/venues"],
  });

  const form = useForm<CameraEditValues>({
    resolver: zodResolver(cameraEditSchema),
    defaultValues: {
      name: camera.name,
      type: camera.type,
      location: camera.location,
      status: camera.status as "Active" | "Inactive" | "Maintenance",
      venue_id: camera.venue_id,
      notes: camera.notes,
    },
  });

  // Update form values when camera prop changes
  useEffect(() => {
    form.reset({
      name: camera.name,
      type: camera.type,
      location: camera.location,
      status: camera.status as "Active" | "Inactive" | "Maintenance",
      venue_id: camera.venue_id,
      notes: camera.notes,
    });
  }, [camera, form]);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Camera Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Camera Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter camera name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Camera Type */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Camera Type</FormLabel>
              <FormControl>
                <Input placeholder="PTZ, Fixed, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Entrance, Bar, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select camera status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Venue */}
        <FormField
          control={form.control}
          name="venue_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {venues?.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id.toString()}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information about the camera"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}