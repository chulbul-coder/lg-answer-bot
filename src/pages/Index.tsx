import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/assistant');
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold">
            <span className="text-primary">LG</span> Voice Assistant
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent assistant for all LG products and services
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="min-w-[200px] h-14 text-lg"
          >
            <Mic className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-card shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Voice Control</h3>
            <p className="text-muted-foreground">Ask questions naturally using your voice</p>
          </div>
          <div className="p-6 rounded-lg bg-card shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Smart Answers</h3>
            <p className="text-muted-foreground">Get intelligent responses powered by AI</p>
          </div>
          <div className="p-6 rounded-lg bg-card shadow-sm">
            <h3 className="font-semibold text-lg mb-2">LG Support</h3>
            <p className="text-muted-foreground">Expert help for all your LG products</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
