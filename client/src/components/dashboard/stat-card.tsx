import { Card, CardContent } from "@/components/ui/card";
import { 
  AlertTriangle, 
  Shield, 
  Building, 
  Clipboard, 
  ArrowDown, 
  ArrowUp
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: "alert-triangle" | "shield" | "building" | "clipboard";
  trend?: {
    direction: "up" | "down" | "neutral";
    value: string;
    positive?: boolean;
  };
  iconColor: "primary" | "secondary" | "danger" | "warning" | "success";
}

export function StatCard({ title, value, icon, trend, iconColor }: StatCardProps) {
  // Icon mapping
  const iconMap = {
    "alert-triangle": <AlertTriangle className="text-xl" />,
    "shield": <Shield className="text-xl" />,
    "building": <Building className="text-xl" />,
    "clipboard": <Clipboard className="text-xl" />
  };

  // Background color mapping
  const bgColorMap = {
    "primary": "bg-primary/20",
    "secondary": "bg-secondary/20",
    "danger": "bg-destructive/20",
    "warning": "bg-warning/20",
    "success": "bg-success/20"
  };

  // Text color mapping
  const textColorMap = {
    "primary": "text-primary",
    "secondary": "text-secondary",
    "danger": "text-destructive",
    "warning": "text-warning",
    "success": "text-success"
  };

  // Trend icon
  const renderTrendIcon = () => {
    if (trend?.direction === "up") {
      return <ArrowUp className="mr-1" />;
    } else if (trend?.direction === "down") {
      return <ArrowDown className="mr-1" />;
    }
    return null;
  };

  // Trend color
  const getTrendColor = () => {
    if (trend?.positive) {
      return "text-green-400";
    } else if (trend?.positive === false) {
      return "text-amber-400";
    }
    return "text-gray-400";
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColorMap[iconColor]} rounded-md p-3`}>
            <div className={textColorMap[iconColor]}>
              {iconMap[icon]}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-400 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-bold text-white">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
      {trend && (
        <div className="bg-gray-800 px-5 py-2">
          <div className={`text-sm ${getTrendColor()} flex items-center`}>
            {renderTrendIcon()}
            <span>{trend.value}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
