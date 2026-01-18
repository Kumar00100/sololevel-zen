import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, MessageCircle, Calendar, ListTodo, LayoutDashboard, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { path: "/", icon: Home, label: "Home", angle: 180 },
  { path: "/assistant", icon: MessageCircle, label: "Assistant", angle: 225 },
  { path: "/planning", icon: Calendar, label: "Plan", angle: 270 },
  { path: "/tasks", icon: ListTodo, label: "Tasks", angle: 315 },
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", angle: 360 },
  { path: "/workout", icon: Dumbbell, label: "Workout", angle: 135 },
];

const CircularMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const radius = 90; // Distance from center

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Menu Items */}
      {menuItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        const angleInRadians = (item.angle * Math.PI) / 180;
        const x = Math.cos(angleInRadians) * radius;
        const y = Math.sin(angleInRadians) * radius;

        return (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={cn(
              "absolute w-12 h-12 rounded-full flex items-center justify-center",
              "transition-all duration-300 ease-out",
              isActive
                ? "bg-gradient-primary text-white shadow-glow"
                : "bg-card text-foreground shadow-md hover:bg-muted",
              isOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-0 pointer-events-none"
            )}
            style={{
              transform: isOpen
                ? `translate(${x}px, ${-y}px)`
                : "translate(0, 0)",
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
            }}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
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
          isOpen && "rotate-180"
        )}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white transition-transform" />
        ) : (
          <Menu className="w-6 h-6 text-white transition-transform" />
        )}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CircularMenu;
