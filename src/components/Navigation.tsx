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
    { path: "/files", label: "Files", icon: Files },
    { path: "/ide", label: "IDE", icon: ImageIcon },
  ];

  return (
      <div></div>
  );
};

export default Navigation;