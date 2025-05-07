import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { Suspense } from "react";
import { CreateIncidentButton } from "@/components/layout/create-incident-button";
import { PermissionLevel } from "@/lib/permissions";

import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import IncidentsPage from "@/pages/incidents-page";
import SecuritySigninPage from "@/pages/security-signin-page";
import VenuesPage from "@/pages/venues-page";
import ReportsPage from "@/pages/reports-page";
import SettingsPage from "@/pages/settings-page";
import NotificationsPage from "@/pages/notifications-page";
import CctvRegisterPage from "@/pages/cctv-register-page";
import UsersPage from "@/pages/users-page";

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><p className="text-lg">Loading...</p></div>}>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/" component={DashboardPage} />
        <ProtectedRoute path="/incidents" component={IncidentsPage} />
        <ProtectedRoute path="/security-signin" component={SecuritySigninPage} />
        <ProtectedRoute path="/venues" component={VenuesPage} />
        <ProtectedRoute path="/reports" component={ReportsPage} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/notifications" component={NotificationsPage} />
        <ProtectedRoute path="/cctv-register" component={CctvRegisterPage} />
        <ProtectedRoute path="/users" component={UsersPage} requiredPermission={PermissionLevel.ADMIN} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          {/* Add global create incident button */}
          <CreateIncidentButton />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
