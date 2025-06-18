import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, LogOut } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface IntroductionPageProps {
  onGetStarted: () => void;
  user: User | null;
  onLogout: () => void;
  onStartInterview: () => void;
}

const IntroductionPage: React.FC<IntroductionPageProps> = ({ 
  onGetStarted, 
  user, 
  onLogout, 
  onStartInterview 
}) => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Image with Shadow Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>
      </div>

      {/* Logout Button */}
      {user && (
        <div className="absolute top-4 right-4 z-20">
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <Sparkles className="w-12 h-12 text-purple-400" />
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              ResQ
            </h1>
          </div>

          {/* Welcome Message */}
          {user && (
            <div className="mb-6">
              <p className="text-xl text-white/80">
                Welcome back, {user.email}!
              </p>
            </div>
          )}

          {/* Motto */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-white/90">
              Master Your Interview Skills
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              AI-powered interview preparation platform that analyzes your resume and provides personalized practice sessions
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">AI Resume Analysis</h3>
              <p className="text-gray-300 text-sm">Smart analysis of your resume to generate relevant questions</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Real-time Feedback</h3>
              <p className="text-gray-300 text-sm">Get instant AI-powered feedback on your responses</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">Voice Integration</h3>
              <p className="text-gray-300 text-sm">Practice with speech recognition and voice responses</p>
            </div>
          </div>

          {/* CTA Button */}
          {user ? (
            <Button
              onClick={onStartInterview}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Start Interview
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          ) : (
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroductionPage;