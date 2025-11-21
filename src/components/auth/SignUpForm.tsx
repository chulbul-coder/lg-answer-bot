import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SignUpFormProps {
  onSwitchMode: () => void;
}

export const SignUpForm = ({ onSwitchMode }: SignUpFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/setup`,
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Welcome to LG Voice Assistant",
      });
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
    <Card className="p-8 shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-2">
        Register to <span className="text-primary">LG Virtual Assistant</span>
      </h1>
      
      <form onSubmit={handleSignUp} className="space-y-4 mt-6">
        <Input
          type="text"
          placeholder="Enter your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-12"
        />
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-12"
        />
        
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </form>

      <p className="text-center mt-6 text-sm">
        Already have an account?{' '}
        <button
          onClick={onSwitchMode}
          className="text-primary font-semibold hover:underline"
        >
          Sign In
        </button>
      </p>
    </Card>
  );
};
