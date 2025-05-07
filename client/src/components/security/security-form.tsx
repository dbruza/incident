import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Venue, InsertSecuritySignIn } from "@shared/schema";
import { useSecurityCode } from "@/hooks/use-security-code";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const securitySignInSchema = z.object({
  security_name: z.string().min(1, "Name is required"),
  badge_number: z.string().min(1, "Badge number is required"),
  venue_id: z.coerce.number(),
  position: z.string().min(1, "Position is required"),
  date: z.string().min(1, "Date is required"),
  time_in: z.string().min(1, "Time in is required"),
  security_code: z.string().length(6, "Security code must be 6 digits"),
  notes: z.string().optional(),
});

type SecuritySignInFormValues = z.infer<typeof securitySignInSchema>;

interface SecurityFormProps {
  venues: Venue[];
  onSubmit: (data: InsertSecuritySignIn) => Promise<void>;
  isLoading: boolean;
}

export function SecurityForm({ venues, onSubmit, isLoading }: SecurityFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
  const securityCode = useSecurityCode();

  const form = useForm<SecuritySignInFormValues>({
    resolver: zodResolver(securitySignInSchema),
    defaultValues: {
      security_name: "",
      badge_number: "",
      venue_id: venues[0]?.id || 0,
      position: "",
      date: today,
      time_in: currentTime,
      security_code: "",
      notes: "",
    },
  });

  const handleSubmit = async (data: SecuritySignInFormValues) => {
    // Validate security code
    if (data.security_code !== securityCode) {
      form.setError("security_code", { 
        type: "manual", 
        message: "Invalid security code. Please check with your supervisor." 
      });
      return;
    }
    
    // Convert form values to InsertSecuritySignIn type
    const signIn: InsertSecuritySignIn = {
      ...data,
      time_in: new Date(`${data.date}T${data.time_in}`),
      date: new Date(data.date),
      status: "on-duty",
    };
    
    await onSubmit(signIn);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Security Name */}
          <FormField
            control={form.control}
            name="security_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Badge Number */}
          <FormField
            control={form.control}
            name="badge_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Badge Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your badge number" {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} value={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {venues.map((venue) => (
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

          {/* Position */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="door">Door Security</SelectItem>
                    <SelectItem value="floor">Floor Security</SelectItem>
                    <SelectItem value="vip">VIP Security</SelectItem>
                    <SelectItem value="manager">Security Manager</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Time In */}
          <FormField
            control={form.control}
            name="time_in"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time In</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Security Code */}
          <FormField
            control={form.control}
            name="security_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Security Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter today's 6-digit security code" 
                    {...field} 
                    maxLength={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Security Code Information */}
        <Alert className="bg-primary/10 border-primary">
          <InfoIcon className="h-4 w-4 text-primary" />
          <AlertTitle>Security Code Required</AlertTitle>
          <AlertDescription>
            For security personnel only: The current code is <span className="font-bold">{securityCode}</span>. 
            This 6-digit code changes every 24 hours. This is for demonstration purposes only and would normally be 
            distributed to security managers through a separate secure channel.
          </AlertDescription>
        </Alert>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional information..." 
                  className="min-h-[80px]" 
                  {...field} 
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
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
