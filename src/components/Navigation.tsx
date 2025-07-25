import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Files, ImageIcon, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSelector } from "@/components/WorkspaceSelector";
import { ProjectCreator } from "@/components/ProjectCreator";
import { ProjectSelector } from "@/components/ProjectSelector";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/canvas", label: "Canvas", icon: ImageIcon },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to={"/"}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Creative Studio
              </h1>
            </div>
          </Link>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Button
                  key={path}
                  variant={location.pathname === path ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className={cn(
                    "transition-smooth",
                    location.pathname === path && "shadow-elegant"
                  )}
                >
                  <Link to={path} className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
