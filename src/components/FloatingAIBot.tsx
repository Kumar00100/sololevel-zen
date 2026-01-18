import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const FloatingAIBot = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/assistant')}
      className={cn(
        "fixed bottom-24 right-4 z-40",
        "w-14 h-14 rounded-full",
        "bg-gradient-primary shadow-glow",
        "flex items-center justify-center",
        "hover:scale-110 active:scale-95 transition-all duration-300",
        "animate-bounce-slow"
      )}
      aria-label="Open AI Assistant"
    >
      <Bot className="w-7 h-7 text-white" />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse" />
    </button>
  );
};

export default FloatingAIBot;
