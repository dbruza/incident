import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PermissionLevel, hasPermission } from "@/lib/permissions";
import { UserRole } from "@shared/schema";

interface PermissionGuardProps {
  requiredPermission: PermissionLevel;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render content based on user permissions
 */
export function PermissionGuard({ 
  requiredPermission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { user } = useAuth();
  
  if (!user) {
    return <>{fallback}</>;
  }
  
  const userHasPermission = hasPermission(user.role as UserRole, requiredPermission);
  
  return userHasPermission ? <>{children}</> : <>{fallback}</>;
}