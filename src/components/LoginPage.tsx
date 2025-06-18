import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, User, Lock, Sparkles } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface LoginPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await authService.signIn(email, password);
      toast({
        title: "Success",
        description: "Logged in successfully!"
      });
      onLogin();
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ResQ
              </CardTitle>
            </div>
            <p className="text-gray-300 text-sm">Welcome back to your AI interview assistant</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <div className="text-center space-y-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>
              <div className="text-gray-400 text-sm">Don't have an account?</div>
              <Button
                onClick={onSignUp}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                Create Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;