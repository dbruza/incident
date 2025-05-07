import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/venues", label: "Venues" },
    { href: "/incidents", label: "Incidents" },
    { href: "/security-signin", label: "Security Sign-In" },
    { href: "/cctv-register", label: "CCTV Register" },
    { href: "/reports", label: "Reports" },
    { href: "/notifications", label: "Notifications" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex flex-col space-y-4 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${
                location === link.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              } hover:text-primary transition`}
            >
              {link.label}
            </Link>
          ))}
          
          <div className="pt-4 border-t">
            {user ? (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Signed in as <span className="font-medium">{user.name}</span>
                </div>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/auth" className="text-primary hover:underline">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}