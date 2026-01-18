import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Target, Zap, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import TopBar from "@/components/TopBar";
import AuthModal from "@/components/AuthModal";
import FloatingAIBot from "@/components/FloatingAIBot";
import CircularMenu from "@/components/CircularMenu";
import DailyTaskTimeline from "@/components/DailyTaskTimeline";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const handleOpenAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    navigate('/assistant');
  };

  // Get current time of day
  const hour = new Date().getHours();
  const getGreeting = () => {
    if (hour < 12) return { text: "Good Morning", icon: Sunrise };
    if (hour < 17) return { text: "Good Afternoon", icon: Sun };
    if (hour < 20) return { text: "Good Evening", icon: Sunset };
    return { text: "Good Night", icon: Moon };
  };
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  return (
    <div className="min-h-screen bg-background pb-24">
      <TopBar onOpenAuthModal={handleOpenAuthModal} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-20 space-y-6">
        {/* Greeting */}
        <div className="bg-gradient-primary text-white p-6 rounded-2xl shadow-glow">
          <div className="flex items-center gap-3 mb-2">
            <GreetingIcon className="w-6 h-6" />
            <h1 className="text-2xl font-bold">{greeting.text}!</h1>
          </div>
          <p className="text-white/80 text-sm">Ready to level up your day?</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-white/20 px-4 py-2 rounded-xl">
              <div className="text-xs text-white/70">Level</div>
              <div className="text-xl font-bold">12</div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-xl flex-1">
              <div className="text-xs text-white/70">Today's XP</div>
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-xp" />
                <span className="text-xl font-bold">0 / 300</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-primary/10 hover:border-primary"
            onClick={() => navigate('/planning')}
          >
            <Target className="w-6 h-6 text-primary" />
            <span className="text-xs">Plan Day</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-success/10 hover:border-success"
            onClick={() => navigate('/workout')}
          >
            <Zap className="w-6 h-6 text-success" />
            <span className="text-xs">Workout</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2 hover:bg-secondary/10 hover:border-secondary"
            onClick={() => navigate('/dashboard')}
          >
            <Sparkles className="w-6 h-6 text-secondary" />
            <span className="text-xs">Stats</span>
          </Button>
        </div>

        {/* Daily Task Timeline */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sun className="w-5 h-5 text-warning" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DailyTaskTimeline />
          </CardContent>
        </Card>
      </div>

      <FloatingAIBot />
      <CircularMenu />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Landing;
