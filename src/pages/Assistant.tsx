import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Send } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CircularMenu from "@/components/CircularMenu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const Assistant = () => {
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim()) {
      // TODO: Send message to assistant
      console.log("Sending:", message);
      setMessage("");
      setIsExpanded(false);
    }
  };

  const toggleMic = () => {
    setIsListening(!isListening);
    // TODO: Implement voice recognition
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar onOpenAuthModal={() => {}} user={{ name: "User" }} />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Assistant Avatar Container */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
          {/* Avatar */}
          <div className="relative group cursor-move">
            <div className="w-48 h-48 bg-gradient-primary rounded-full shadow-glow flex items-center justify-center animate-float">
              <div className="w-40 h-40 bg-white/90 dark:bg-card/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="text-6xl">🤖</div>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card px-4 py-1 rounded-full shadow-md text-sm font-medium whitespace-nowrap">
              Hello! I'm your assistant
            </div>
          </div>

          {/* Voice Control */}
          <Button
            size="lg"
            variant={isListening ? "default" : "outline"}
            className={cn(
              "rounded-full w-16 h-16 shadow-lg transition-all",
              isListening && "bg-destructive hover:bg-destructive/90 animate-pulse-glow"
            )}
            onClick={toggleMic}
          >
            <Mic className="w-6 h-6" />
          </Button>

          {/* Expandable Text Input */}
          <div
            className={cn(
              "w-full max-w-2xl transition-all duration-300",
              isExpanded ? "h-32" : "h-14"
            )}
          >
            <div className="relative bg-card rounded-full shadow-lg overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                onBlur={() => {
                  if (!message) setIsExpanded(false);
                }}
                placeholder="Type or speak your message..."
                className={cn(
                  "resize-none border-0 focus-visible:ring-0 transition-all pr-24",
                  isExpanded ? "rounded-3xl h-32 pt-4" : "rounded-full h-14 pt-3"
                )}
                rows={isExpanded ? 4 : 1}
              />
              <div className="absolute right-2 bottom-2 flex gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  onClick={toggleMic}
                >
                  <Mic className={cn("w-5 h-5", isListening && "text-destructive")} />
                </Button>
                <Button
                  size="icon"
                  className="rounded-full bg-gradient-primary hover:opacity-90"
                  onClick={handleSend}
                  disabled={!message.trim()}
                >
                  <Send className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CircularMenu />
      <BottomNav />
    </div>
  );
};

export default Assistant;
