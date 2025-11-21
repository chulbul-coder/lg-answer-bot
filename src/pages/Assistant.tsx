import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, LogOut, Settings, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import lgLogo from '@/assets/lg-logo.png';

const Assistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assistantName, setAssistantName] = useState('LG');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        loadAssistantConfig(session.user.id);
      }
    });

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started');
        setIsListening(true);
      };

      recognitionRef.current.onresult = async (event: any) => {
        console.log('Speech recognition result:', event);
        const transcript = event.results[0][0].transcript;
        console.log('Transcript:', transcript);
        setTranscript(transcript);
        setIsListening(false);
        await processQuestion(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error, event);
        setIsListening(false);
        
        let errorMessage = "Failed to recognize speech. Please try again.";
        
        switch(event.error) {
          case 'not-allowed':
          case 'permission-denied':
            errorMessage = "Microphone access denied. Please allow microphone permissions in your browser settings.";
            break;
          case 'no-speech':
            errorMessage = "No speech detected. Please speak clearly and try again.";
            break;
          case 'audio-capture':
            errorMessage = "No microphone found. Please connect a microphone and try again.";
            break;
          case 'network':
            errorMessage = "Network error. Please check your internet connection and try again.";
            break;
          case 'aborted':
            errorMessage = "Speech recognition was stopped.";
            break;
        }
        
        toast({
          title: "Speech Recognition Error",
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [navigate, toast]);

  const loadAssistantConfig = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('assistant_config')
        .select('assistant_name')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      if (data) setAssistantName(data.assistant_name);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const processQuestion = async (question: string) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: question },
      });

      if (error) throw error;

      const aiResponse = data.response;
      setResponse(aiResponse);

      // Speak the response
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error: any) {
      console.error('Error processing question:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your question",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = async () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not supported",
        description: "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        // Request microphone permission explicitly
        console.log('Requesting microphone permission');
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        console.log('Starting speech recognition');
        setTranscript('');
        setResponse('');
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error: any) {
        console.error('Microphone permission error:', error);
        setIsListening(false);
        
        let errorMessage = "Failed to access microphone.";
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          errorMessage = "Microphone access denied. Please allow microphone permissions in your browser settings and refresh the page.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No microphone found. Please connect a microphone and try again.";
        }
        
        toast({
          title: "Microphone Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">{assistantName}</span> Assistant
          </h1>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate('/setup')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon">
              <HelpCircle className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8">
          <Card className="w-64 h-64 flex items-center justify-center shadow-lg">
            <img src={lgLogo} alt="LG Logo" className="w-40 h-40 object-contain" />
          </Card>

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold">I'm {assistantName}</p>
            {isProcessing && (
              <div className="w-16 h-16 mx-auto">
                <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          <Button
            size="lg"
            onClick={toggleListening}
            disabled={isProcessing}
            className={`w-20 h-20 rounded-full ${
              isListening ? 'bg-destructive hover:bg-destructive/90' : ''
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </Button>

          {isListening && (
            <p className="text-muted-foreground animate-pulse">Listening...</p>
          )}

          {transcript && (
            <Card className="w-full p-6">
              <p className="text-sm text-muted-foreground mb-2">You asked:</p>
              <p className="text-lg">{transcript}</p>
            </Card>
          )}

          {response && (
            <Card className="w-full p-6 bg-primary/5">
              <p className="text-sm text-muted-foreground mb-2">{assistantName} says:</p>
              <p className="text-lg">{response}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Assistant;
