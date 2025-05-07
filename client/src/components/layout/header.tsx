import { useState } from "react";
import { Menu, Bell, Search, X, AlertTriangle, Shield, Clock } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function Header() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const { toast } = useToast();
  
  // Sample notification data
  const notifications = [
    {
      id: 1,
      type: "incident",
      title: "New Incident Reported",
      message: "A physical altercation was reported at Downtown Club.",
      time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      read: false
    },
    {
      id: 2,
      type: "security",
      title: "Security Sign-Out Alert",
      message: "James Wilson did not properly sign out from last shift.",
      time: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      read: false
    },
    {
      id: 3,
      type: "system",
      title: "System Update",
      message: "The incident tracking system has been updated to version 2.1.",
      time: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      read: false
    }
  ];
  
  const handleClearNotifications = () => {
    setNotificationCount(0);
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read.",
    });
  };
  
  const handleNotificationClick = (notification: any) => {
    setNotificationCount(prev => Math.max(0, prev - 1));
    toast({
      title: "Notification opened",
      description: `You opened: ${notification.title}`,
    });
  };

  return (
    <div className="relative z-10 flex shrink-0 h-16 bg-[hsl(240_10%_3.9%)] border-b border-gray-800 shadow-sm">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="px-4 text-gray-400 border-r border-gray-800 focus:outline-none md:hidden"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r border-gray-800">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex justify-between px-4">
        <div className="flex-1 flex items-center">
          <div className="max-w-2xl w-full lg:max-w-md">
            <div className="relative text-white focus-within:text-gray-400">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4" />
              </div>
              <Input 
                type="search"
                placeholder="Search"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md bg-background text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="ml-4 flex items-center md:ml-6 space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-1 rounded-full text-gray-400 hover:text-white">
                <span className="sr-only">View notifications</span>
                <div className="relative">
                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
                      {notificationCount}
                    </span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-3">
                <DropdownMenuLabel className="text-base">Notifications</DropdownMenuLabel>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearNotifications}
                  disabled={notificationCount === 0}
                  className="text-xs h-auto py-1 px-2"
                >
                  Mark all as read
                </Button>
              </div>
              <DropdownMenuSeparator />
              
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-gray-500">
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="flex flex-col items-start p-3 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex w-full items-start gap-2">
                        <div className="mt-0.5">
                          {notification.type === "incident" ? (
                            <div className="p-1 rounded-full bg-destructive/20 text-destructive">
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                          ) : notification.type === "security" ? (
                            <div className="p-1 rounded-full bg-primary/20 text-primary">
                              <Shield className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="p-1 rounded-full bg-secondary/20 text-secondary">
                              <Clock className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-gray-400">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {format(notification.time, 'h:mm a')}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-2 text-center cursor-pointer">
                <Button variant="ghost" className="w-full text-sm text-primary" size="sm">
                  View all notifications
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Profile */}
          <div className="md:hidden flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-white">
              {user?.name?.[0].toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
