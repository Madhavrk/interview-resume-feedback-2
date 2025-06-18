import React, { useState, useEffect } from 'react';
import { authService } from '@/lib/auth';
import { User } from '@supabase/supabase-js';
import LoginPage from '@/components/LoginPage';
import SignUpPage from '@/components/SignUpPage';
import OTPPage from '@/components/OTPPage';
import IntroductionPage from '@/components/IntroductionPage';
import ResumeUpload from '@/components/ResumeUpload';
import ResumeAnalyzing from '@/components/ResumeAnalyzing';
import InterviewOptions from '@/components/InterviewOptions';
import InterviewSession from '@/components/InterviewSession';

type AppState = 'intro' | 'login' | 'signup' | 'otp' | 'resume' | 'analyzing' | 'options' | 'interview';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('intro');
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [interviewType, setInterviewType] = useState<'technical' | 'hr' | 'testcase'>('technical');
  const [isLoading, setIsLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    setCurrentState('login');
  };

  const handleLogin = () => {
    setCurrentState('intro');
  };

  const handleSignUp = (email: string) => {
    setUserEmail(email);
    setCurrentState('otp');
  };

  const handleOTPVerified = () => {
    setCurrentState('intro');
  };

  const handleStartInterview = () => {
    setCurrentState('resume');
  };

  const handleResumeUploaded = (file: File) => {
    setResumeFile(file);
    setCurrentState('analyzing');
    setAnalysisProgress(0);
    
    // Simulate analysis progress
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setCurrentState('options'), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleInterviewTypeSelected = (type: 'technical' | 'hr' | 'testcase') => {
    setInterviewType(type);
    setCurrentState('interview');
  };

  const handleFinishInterview = () => {
    setCurrentState('intro');
    setResumeFile(null);
  };

  const handleQuitInterview = () => {
    setCurrentState('options');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    setCurrentState('intro');
    setResumeFile(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  switch (currentState) {
    case 'intro':
      return <IntroductionPage onGetStarted={handleGetStarted} user={user} onLogout={handleLogout} onStartInterview={handleStartInterview} />;
    
    case 'login':
      return <LoginPage onLogin={handleLogin} onSignUp={() => setCurrentState('signup')} />;
    
    case 'signup':
      return <SignUpPage onSignUp={handleSignUp} onBackToLogin={() => setCurrentState('login')} />;
    
    case 'otp':
      return <OTPPage email={userEmail} onVerifyOTP={handleOTPVerified} onResendOTP={() => {}} />;
    
    case 'resume':
      return <ResumeUpload onResumeUploaded={handleResumeUploaded} />;
    
    case 'analyzing':
      return resumeFile ? (
        <ResumeAnalyzing fileName={resumeFile.name} progress={analysisProgress} />
      ) : null;
    
    case 'options':
      return <InterviewOptions onSelectOption={handleInterviewTypeSelected} />;
    
    case 'interview':
      return resumeFile ? (
        <InterviewSession 
          interviewType={interviewType} 
          resumeFile={resumeFile} 
          onFinish={handleFinishInterview}
          onQuit={handleQuitInterview}
        />
      ) : (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white">No resume file found</p>
        </div>
      );
    
    default:
      return <IntroductionPage onGetStarted={handleGetStarted} user={user} onLogout={handleLogout} onStartInterview={handleStartInterview} />;
  }
};

export default Index;