import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart2,
  Building2,
  Camera,
  Settings,
  AlertTriangle,
  ShieldCheck,
  Bell,
  FileSpreadsheet,
  LogOut,
  Users
} from "lucide-react";
import { PermissionLevel, pagePermissions } from "@/lib/permissions";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { checkPermission, userRole } = usePermissions();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Define all possible navigation items with their permission requirements
  const allNavItems = [
    {
      href: "/",
      label: "Dashboard",
      icon: <BarChart2 className="h-5 w-5" />,
      requiredPermission: pagePermissions.dashboard,
    },
    {
      href: "/venues",
      label: "Venues",
      icon: <Building2 className="h-5 w-5" />,
      requiredPermission: pagePermissions.venues,
    },
    {
      href: "/incidents",
      label: "Incidents",
      icon: <AlertTriangle className="h-5 w-5" />,
      requiredPermission: pagePermissions.incidents,
    },
    {
      href: "/security-signin",
      label: "Security Sign-In",
      icon: <ShieldCheck className="h-5 w-5" />,
      requiredPermission: pagePermissions.securitySignIn,
    },
    {
      href: "/cctv-register",
      label: "CCTV Register",
      icon: <Camera className="h-5 w-5" />,
      requiredPermission: pagePermissions.cctvRegister,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      requiredPermission: pagePermissions.reports,
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: <Bell className="h-5 w-5" />,
      requiredPermission: pagePermissions.notifications,
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings className="h-5 w-5" />,
      requiredPermission: pagePermissions.settings,
    },
    {
      href: "/users",
      label: "Users",
      icon: <Users className="h-5 w-5" />,
      requiredPermission: PermissionLevel.ADMIN,
    },
  ];
  
  // Filter nav items based on user permissions
  const navItems = allNavItems.filter(item => 
    checkPermission(item.requiredPermission)
  );

  return (
    <div
      className={cn(
        "w-64 flex-col border-r bg-background hidden md:flex p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="font-bold text-xl">Security Register</div>
      </div>
      <div className="space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                location === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-auto space-y-4 pt-4">
        {user && (
          <div className="border-t pt-4">
            <div className="px-3 py-2">
              <div className="text-xs text-muted-foreground mb-1">ACCOUNT</div>
              <div className="font-medium truncate flex items-center gap-2">
                {user.name}
                <Badge variant={
                  user.role === 'admin' 
                    ? 'destructive' 
                    : user.role === 'manager' 
                      ? 'default' 
                      : 'secondary'
                }>
                  {user.role}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}