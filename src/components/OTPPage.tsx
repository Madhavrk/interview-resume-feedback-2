import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Shield, Sparkles } from 'lucide-react'; // Added Phone icon
import { authService } from '@/lib/auth'; // Using the modified authService
import { useToast } from '@/hooks/use-toast';

interface OTPPageProps {
  email: string; // Still receive email to identify the user for verification lookup
  onVerifyOTP: () => void;
  onResendOTP: (email: string) => void; // Modified to pass email for resend
}

const OTPPage: React.FC<OTPPageProps> = ({ email, onVerifyOTP, onResendOTP }) => {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(60); // Timer for resend
  const [loading, setLoading] = useState(false); // Loading state for verification
  const [resending, setResending] = useState(false); // Loading state for resend
  const { toast } = useToast();

  // Handle OTP verification
  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter the complete 6-digit code",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Call the new verifyPhoneOtp method from authService
      await authService.verifyPhoneOtp(email, otp);

      toast({
        title: "Success",
        description: "Phone number verified successfully! You can now log in."
      });
      onVerifyOTP(); // Navigate to the next page (e.g., login or dashboard)

    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle resending OTP
  const handleResend = async () => {
    setResending(true);
    try {
      // Call the resend logic (you might need to create a new method in authService
      // specifically for resending phone OTPs if the old resendOTP is email-based)
      // For now, assuming a method in authService handles resending phone OTPs linked to email
      await authService.resendPhoneOtp(email); // Assuming a new method

      toast({
        title: "Success",
        description: "New verification code sent to your phone number."
      });
      setTimeLeft(60); // Reset timer
      setOtp(''); // Clear OTP input
      onResendOTP(email); // Call the resend callback, passing email

    } catch (error: any) {
      toast({
        title: "Resend Failed",
        description: error.message || "Failed to resend code to phone number",
        variant: "destructive"
      });
    } finally {
      setResending(false);
    }
  };

  // Timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

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
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-purple-500/20 rounded-full">
              <Phone className="w-8 h-8 text-purple-400" /> {/* Changed icon to Phone */}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Verify Your Phone Number</h2> {/* Updated heading */}
              <p className="text-gray-300 text-sm">We've sent a 6-digit code to the phone number associated with</p> {/* Updated text */}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                 {/* Display the email the user signed up with */}
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-medium text-sm">{email}</span>
              </div>
               <p className="text-gray-300 text-sm">Please enter the code below:</p> {/* Added instruction */}
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={1} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={2} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={3} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={4} className="bg-white/10 border-white/20 text-white" />
                  <InputOTPSlot index={5} className="bg-white/10 border-white/20 text-white" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-gray-400 text-sm">
                {timeLeft > 0 ? (
                  <>Resend code in {timeLeft}s</>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-purple-400 hover:text-purple-300 underline transition-colors disabled:opacity-50"
                  >
                    {resending ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OTPPage;
