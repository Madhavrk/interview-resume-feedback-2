import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Lock, Calendar, ArrowLeft, Sparkles, Eye, EyeOff } from 'lucide-react'; // Added Phone
import { authService } from '@/lib/auth'; // We will modify authService later
import { useToast } from '@/hooks/use-toast';

interface SignUpPageProps {
  onSignUp: (email: string) => void; // Keep email as the identifier for the next step
  onBackToLogin: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    email: '',
    phoneNumber: '', // Added phoneNumber
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    // Updated validation to include phone number
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    // Basic phone number format validation (you might want a more robust solution)
    const phoneRegex = /^\\+[1-9]\\d{1,14}$/; // E.g., +1234567890
    if (!phoneRegex.test(formData.phoneNumber)) {
        toast({
            title: "Error",
            description: "Please enter a valid phone number including country code (e.g., +1234567890)",
            variant: "destructive"
        });
        return;
    }

    setLoading(true);
    try {
      // We will need to modify authService.signUp or create a new method
      // to handle sending the SMS OTP using the phone number,
      // while associating it with the user\'s email for later verification lookup.
      // This call should initiate the OTP sending process
      await authService.initiatePhoneOtpSignup(formData.email, formData.phoneNumber, formData.password, formData.name); // Assuming a new method

      toast({
        title: "Success",
        description: "OTP sent to your phone number. Please verify to complete signup."
      });
      onSignUp(formData.email); // Pass email to the next step (OTP verification page)

    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "Failed to initiate signup. Please try again.",
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
            <div className="flex items-center justify-center space-x-2">\n              <Sparkles className="w-8 h-8 text-purple-400" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ResQ
              </CardTitle>
            </div>
            <p className="text-gray-300 text-sm">Create your account to get started</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  className="pl-10 bg-white/10 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
              {/* Keep Email Input */}
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email Address (for login)" // Updated placeholder
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
              {/* Add Phone Number Input for OTP */}
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type="tel"
                  placeholder="Phone Number (for OTP verification, e.g., +1234567890)" // Updated placeholder
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
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
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Added "Already have an account?" text */}
            <div className="text-center text-gray-300 text-sm mt-4">
                Already have an account?
            </div>

            <Button
              onClick={onBackToLogin}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
