import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, MessageCircle, Calendar, ListTodo, LayoutDashboard, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/assistant", icon: MessageCircle, label: "Assistant" },
  { path: "/planning", icon: Calendar, label: "Plan" },
  { path: "/tasks", icon: ListTodo, label: "Tasks" },
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/workout", icon: Dumbbell, label: "Workout" },
];

const CircularMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const radius = 100; // Distance from center
  const itemCount = menuItems.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-background/70 backdrop-blur-md z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Container - moves to center when open */}
      <div
        className={cn(
          "fixed z-50 transition-all duration-500 ease-out",
          isOpen
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : "bottom-6 left-6 translate-x-0 translate-y-0"
        )}
      >
        {/* Menu Items in Circle */}
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          // Distribute items evenly in a circle (starting from top)
          const angle = (index * (360 / itemCount) - 90) * (Math.PI / 180);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={cn(
                "absolute w-14 h-14 rounded-full flex flex-col items-center justify-center gap-0.5",
                "transition-all duration-300 ease-out",
                "-translate-x-1/2 -translate-y-1/2",
                isActive
                  ? "bg-gradient-primary text-white shadow-glow scale-110"
                  : "bg-card text-foreground shadow-lg hover:bg-muted hover:scale-105",
                isOpen
                  ? "opacity-100"
                  : "opacity-0 scale-0 pointer-events-none"
              )}
              style={{
                left: isOpen ? `calc(50% + ${x}px)` : "50%",
                top: isOpen ? `calc(50% + ${y}px)` : "50%",
                transitionDelay: isOpen ? `${index * 60}ms` : "0ms",
              }}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}

        {/* Main Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-14 h-14 rounded-full",
            "bg-gradient-primary shadow-lg",
            "flex items-center justify-center",
            "hover:shadow-glow transition-all duration-300",
            isOpen && "rotate-180 scale-90"
          )}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white transition-transform" />
          ) : (
            <Menu className="w-6 h-6 text-white transition-transform" />
          )}
        </button>
      </div>
    </>
  );
};

export default CircularMenu;
