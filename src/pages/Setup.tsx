import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import lgLogo from '@/assets/lg-logo.png';

const Setup = () => {
  const [assistantName, setAssistantName] = useState('LG');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleFinish = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('assistant_config')
        .update({ assistant_name: assistantName })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Setup complete!",
        description: `Meet ${assistantName}, your voice assistant`,
      });
      
      navigate('/assistant');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-8">
          Give a <span className="text-primary">Name</span> to Your Assistant
        </h1>

        <Input
          type="text"
          value={assistantName}
          onChange={(e) => setAssistantName(e.target.value)}
          placeholder="Enter assistant name"
          className="mb-6"
        />

        <div className="flex justify-center mb-6">
          <div className="w-48 h-48 border-2 border-border rounded-2xl flex items-center justify-center bg-card">
            <img src={lgLogo} alt="LG Logo" className="w-32 h-32 object-contain" />
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleFinish}
            disabled={loading || !assistantName.trim()}
            className="px-12"
          >
            {loading ? "Setting up..." : "Finish"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Setup;
