import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Target, Zap } from "lucide-react";
import TopBar from "@/components/TopBar";
import AuthModal from "@/components/AuthModal";
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

  return (
    <div className="min-h-screen bg-background">
      <TopBar onOpenAuthModal={handleOpenAuthModal} />
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          {/* Hero Content */}
          <div className="space-y-4">
            <div className="inline-block">
              <div className="flex items-center gap-2 bg-gradient-primary px-4 py-2 rounded-full text-white text-sm font-medium shadow-glow">
                <Sparkles className="w-4 h-4" />
                <span>Your AI-Powered Life Assistant</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Level Up
              </span>
              <br />
              Your Daily Life
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your routines into achievements with your personal AI assistant. 
              Track progress, build habits, and unlock your potential.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white px-8 py-6 text-lg shadow-lg hover:shadow-glow transition-all"
              onClick={() => handleOpenAuthModal('signup')}
            >
              Let's Go
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg"
              onClick={() => handleOpenAuthModal('login')}
            >
              Sign In
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-gradient-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Smart Task Management</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered task suggestions tailored to your goals and schedule
              </p>
            </div>

            <div className="bg-gradient-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">XP & Level System</h3>
              <p className="text-muted-foreground text-sm">
                Gamify your progress and watch yourself level up with every achievement
              </p>
            </div>

            <div className="bg-gradient-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Virtual Assistant</h3>
              <p className="text-muted-foreground text-sm">
                Chat with your AI companion for motivation, reminders, and guidance
              </p>
            </div>
          </div>
        </div>
      </div>

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
