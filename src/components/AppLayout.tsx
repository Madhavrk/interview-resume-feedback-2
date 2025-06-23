import React, { useState, useEffect } from 'react';
import IntroductionPage from './IntroductionPage';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import OTPPage from './OTPPage';
import ResumeUpload from './ResumeUpload';
import InterviewOptions from './InterviewOptions';
import InterviewSession from './InterviewSession';

// Import Supabase client and User type
import { supabase } from '@/lib/supabase'; // Assuming your Supabase client is exported from here
import { User } from '@supabase/supabase-js';


type AppState =
  | 'introduction'
  | 'login'
  | 'signup'
  | 'otp'
  | 'resume-upload'
  | 'interview-options'
  | 'interview-session';

type InterviewType = 'technical' | 'hr' | 'testcase';

const AppLayout: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>('introduction');
  const [userEmail, setUserEmail] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [selectedInterviewType, setSelectedInterviewType] = useState<InterviewType>('technical');
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  // Add state for authenticated user
  const [user, setUser] = useState<User | null>(null);

  // Check for authenticated user on initial load
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
       // If user is logged in, maybe go to a different state initially
       if (user) {
           setCurrentState('resume-upload'); // Example: go directly to upload if logged in
       }
    };
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
       if (session?.user) {
           setCurrentState('resume-upload'); // Example: go to upload on login
       } else {
            setCurrentState('introduction'); // Example: go to introduction on logout
       }
    });

    return () => subscription.unsubscribe();
  }, []); // Empty dependency array means this runs once on mount


  const handleGetStarted = () => {
    // If user is logged in, go to resume upload, otherwise go to login
    if (user) {
       setCurrentState('resume-upload');
    } else {
       setCurrentState('login');
    }
  };

  const handleLogin = () => {
    setCurrentState('resume-upload'); // Assuming successful login goes to upload
  };

  const handleSignUp = (userData: any) => {
    setUserEmail(userData.email);
    setCurrentState('otp');
  };

  const handleOTPVerified = () => {
     // After OTP verification, maybe go back to login or directly to upload
    setCurrentState('login');
  };

  const handleResumeAnalysisComplete = (questions: string[]) => {
    console.log('Resume analysis complete in AppLayout. Received questions:', questions);
    setInterviewQuestions(questions);
    setCurrentState('interview-options');
  };

  const handleInterviewOptionSelected = (option: InterviewType) => {
    setSelectedInterviewType(option);
    setCurrentState('interview-session');
  };

  const handleInterviewFinished = () => {
    setInterviewQuestions([]);
    setResumeFile(null);
    setCurrentState('resume-upload');
  };

  // Handler for quitting the interview
  const handleQuitInterview = () => {
      console.log('Interview quit by user');
      // Reset states and navigate back to resume upload or introduction
      setInterviewQuestions([]);
      setResumeFile(null);
      setCurrentState('resume-upload'); // Or 'introduction' depending on desired flow
  };


  // New handler for starting the interview from IntroductionPage
  const handleStartInterviewFromIntro = () => {
     setCurrentState('resume-upload'); // Or wherever you want to go to start the interview process
  };

  // New handler for logout
  const handleLogout = async () => {
      await supabase.auth.signOut();
      // The auth state change listener will update the user state and navigate
      console.log('User logged out');
  };


  const renderCurrentState = () => {
    switch (currentState) {
      case 'introduction':
        return (
           <IntroductionPage
             onGetStarted={handleGetStarted}
             user={user} // Pass the user state
             onLogout={handleLogout} // Pass the logout handler
             onStartInterview={handleStartInterviewFromIntro} // Pass the new start interview handler
            />
        );
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onSignUp={() => setCurrentState('signup')}
          />
        );
      case 'signup':
        return (
          <SignUpPage
            onSignUp={handleSignUp}
            onBackToLogin={() => setCurrentState('login')}
          />
        );
      case 'otp':
        return (
          <OTPPage
            email={userEmail}
            onVerifyOTP={handleOTPVerified}
            onResendOTP={() => console.log('Resending OTP...\'')}
          />
        );
      case 'resume-upload':
        return (
          <ResumeUpload
            interviewType={selectedInterviewType}
            onAnalysisComplete={handleResumeAnalysisComplete}
          />
        );
      case 'interview-options':
        return <InterviewOptions onSelectOption={handleInterviewOptionSelected} />;
      case 'interview-session':
        return (
          <InterviewSession
            interviewType={selectedInterviewType}
            interviewQuestions={interviewQuestions}
            onFinish={handleInterviewFinished}
            onQuit={handleQuitInterview} // Added the onQuit prop here
          />
        );
      default:
        return null;
    }
  };

  return <div className="min-h-screen">{renderCurrentState()}</div>;
};

export default AppLayout;
