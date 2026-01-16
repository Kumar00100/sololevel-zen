import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircle, Calendar, LayoutDashboard, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/assistant", icon: MessageCircle, label: "Assistant" },
  { path: "/planning", icon: Calendar, label: "Plan" },
  { path: "/tasks", icon: ListTodo, label: "Tasks" },
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center w-16 h-full transition-all",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div
                  className={cn(
                    "p-2 rounded-xl transition-all",
                    isActive && "bg-primary/10"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                </div>
                <span className="text-xs mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
