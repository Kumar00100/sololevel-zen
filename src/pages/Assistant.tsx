import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Send, Sparkles, Calendar, Dumbbell, ListTodo, Brain, Zap, Bot, User } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import CircularMenu from "@/components/CircularMenu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: Calendar, label: "Plan my day", prompt: "Help me plan my day efficiently" },
  { icon: Dumbbell, label: "Workout tips", prompt: "Give me workout tips for today" },
  { icon: ListTodo, label: "Task summary", prompt: "Summarize my pending tasks" },
  { icon: Brain, label: "Motivation", prompt: "Give me some motivation to stay productive" },
];

const suggestions = [
  "What should I focus on today?",
  "How can I improve my productivity?",
  "Create a morning routine for me",
  "Suggest a 15-minute workout",
];

const Assistant = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || message;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);

    // Simulate AI response (replace with actual AI integration)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSimulatedResponse(messageText),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getSimulatedResponse = (query: string): string => {
    const responses: Record<string, string> = {
      "Help me plan my day efficiently": "Great! Let's plan your day. Start with your most important task in the morning when your energy is highest. Block 2-hour focus sessions with short breaks. Remember to schedule time for exercise and meals. What's your biggest priority today?",
      "Give me workout tips for today": "Here's a quick workout plan: Start with 5 min warm-up, then do 3 sets of 15 pushups, 20 squats, 30-second plank, and 10 lunges each leg. Finish with stretching. Stay hydrated! 💪",
      "Summarize my pending tasks": "You have 5 pending tasks: Complete project report (high priority), Review team updates, Schedule weekly meeting, Update documentation, and Send follow-up emails. Focus on the high-priority items first!",
      "Give me some motivation to stay productive": "Remember: Every small step counts! You've already accomplished so much. Stay focused on your goals, take breaks when needed, and celebrate your progress. You've got this! 🌟",
    };
    return responses[query] || "I'm here to help you stay productive and achieve your goals! What would you like to work on today?";
  };

  const toggleMic = () => {
    setIsListening(!isListening);
    // TODO: Implement voice recognition with ElevenLabs or Web Speech API
    if (!isListening) {
      // Starting to listen
      console.log("Starting voice recognition...");
    } else {
      // Stopping
      console.log("Stopping voice recognition...");
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar onOpenAuthModal={() => {}} user={{ name: "User" }} />
      
      <div className="container mx-auto px-4 pt-20 pb-8 flex flex-col h-[calc(100vh-6rem)]">
        {messages.length === 0 ? (
          // Empty State - Show Avatar and Quick Actions
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            {/* Animated Avatar */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-2xl opacity-30 animate-pulse" />
              <div className="relative w-40 h-40 bg-gradient-primary rounded-full shadow-glow flex items-center justify-center animate-float">
                <div className="w-32 h-32 bg-card/90 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
                  <Bot className="w-16 h-16 text-primary" />
                </div>
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-lg border border-border">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium">Ready to assist</span>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center space-y-2 max-w-md">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Hey! I'm your AI Assistant
              </h1>
              <p className="text-muted-foreground">
                Ask me anything about planning, workouts, or productivity tips
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-4 px-4 flex flex-col items-center gap-2 hover:bg-primary/10 hover:border-primary/50 transition-all group"
                  onClick={() => handleSend(action.prompt)}
                >
                  <action.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-md space-y-2">
              <p className="text-xs text-muted-foreground text-center">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full bg-muted hover:bg-primary/20 hover:text-primary transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Chat History
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 py-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    msg.role === 'user' ? "flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-gradient-primary shadow-glow"
                  )}>
                    {msg.role === 'user' 
                      ? <User className="w-5 h-5" /> 
                      : <Bot className="w-5 h-5 text-white" />
                    }
                  </div>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    msg.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted rounded-tl-sm"
                  )}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      msg.role === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions in Chat */}
            {messages.length > 0 && !isTyping && (
              <div className="flex flex-wrap gap-2 py-4">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {/* Input Area */}
        <div className="mt-4 space-y-3">
          {/* Voice Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "outline"}
              className={cn(
                "rounded-full w-14 h-14 shadow-lg transition-all",
                isListening && "animate-pulse shadow-destructive/50"
              )}
              onClick={toggleMic}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
          </div>

          {/* Text Input */}
          <div className="relative bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything..."
              className="resize-none border-0 focus-visible:ring-0 min-h-[52px] max-h-32 pr-24 py-4"
              rows={1}
            />
            <div className="absolute right-2 bottom-2 flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full h-9 w-9"
                onClick={toggleMic}
              >
                <Mic className={cn("w-4 h-4", isListening && "text-destructive")} />
              </Button>
              <Button
                size="icon"
                className="rounded-full h-9 w-9 bg-gradient-primary hover:opacity-90"
                onClick={() => handleSend()}
                disabled={!message.trim()}
              >
                <Send className="w-4 h-4 text-white" />
              </Button>
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
