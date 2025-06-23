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
  const [selectedInterviewType, setSelectedInterviewType] = useState<'technical' | 'hr' | 'testcase'>('technical');
  const [isLoading, setIsLoading] = useState(true);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);

  useEffect(() => {
    console.log('Current state changed to:', currentState);
  }, [currentState]);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
           setCurrentState('resume');
        } else {
           setCurrentState('intro');
        }
      } catch (error) {
        console.error('Auth check error:', error);
         setCurrentState('intro');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = authService.onAuthStateChange(
      ((_event: any, session: any) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
         if (currentUser) {
             setCurrentState('resume');
         } else {
              setCurrentState('intro');
         }
      }) as (user: User | null) => void
    );


    return () => subscription.unsubscribe();
  }, []);


  const handleGetStarted = () => {
     if (user) {
        setCurrentState('resume');
     } else {
        setCurrentState('login');
     }
  };

  const handleLogin = () => {
    setCurrentState('resume');
  };

  const handleSignUp = (email: string) => {
    setUserEmail(email);
    setCurrentState('otp');
  };

  const handleOTPVerified = () => {
    setCurrentState('login');
  };

  const handleStartInterview = () => {
    setCurrentState('resume');
  };

  const handleResumeUploaded = (file: File) => {
    console.log('Resume uploaded in Index. File:', file.name);
    setResumeFile(file);
    setCurrentState('options');
  };

   const generateInterviewQuestions = async (file: File, type: 'technical' | 'hr' | 'testcase') => {
       setIsLoading(true);
       setAnalysisProgress(0);
       setCurrentState('analyzing');
       console.log(`Generating ${type} interview questions...`);

       const formData = new FormData();
       formData.append('action', 'analyze_resume');
       formData.append('interviewType', type);
       formData.append('resumeFile', file);

       console.log('Attempting to fetch from Edge Function...');
       console.log('Edge Function URL:', 'https://swzypvvwwiqzciwemvxw.supabase.co/functions/v1/07aedc15-5887-4f0f-bac5-adf6707617cb');


       try {
           console.log('Inside try block for fetch.');
           const progressInterval = setInterval(() => {
             setAnalysisProgress(prev => prev < 90 ? prev + 5 : prev);
           }, 200);

           const response = await fetch('https://swzypvvwwiqzciwemvxw.supabase.co/functions/v1/07aedc15-5887-4f0f-bac5-adf6707617cb', {
             method: 'POST',
             body: formData,
           });

            clearInterval(progressInterval);

           const result = await response.json();

           if (!response.ok || result.error) {
               const errorMessage = result.error || `HTTP error! status: ${response.status}`;
               console.error('Edge function error during question generation:', errorMessage);
                setInterviewQuestions([]);
                setCurrentState('options');
           } else if (result.result && Array.isArray(result.result)) {
               console.log('Successfully generated questions:', result.result.length);
               setInterviewQuestions(result.result);
               setAnalysisProgress(100);

               setCurrentState('interview');

           } else {
                console.error('Unexpected edge function response during question generation:', result);
                 setInterviewQuestions([]);
                 setCurrentState('options');
           }

       } catch (error: any) {
           console.log('Inside catch block for fetch.');
           console.error('Fetch error during question generation:', error);
            setInterviewQuestions([]);
            setCurrentState('options');
       } finally {
            setIsLoading(false);
       }
   };


  const handleInterviewTypeSelected = (type: 'technical' | 'hr' | 'testcase') => {
    console.log('Interview type selected:', type);
    setSelectedInterviewType(type);
    if (resumeFile) {
        generateInterviewQuestions(resumeFile, type);
    } else {
        console.error('No resume file available for question generation.');
        setCurrentState('resume');
    }
  };

  const handleFinishInterview = () => {
    setInterviewQuestions([]);
    // setResumeFile(null); // REMOVED this line to keep the resume file
    setCurrentState('options'); // CHANGED this to go to the options page
  };

  const handleQuitInterview = () => {
    setInterviewQuestions([]);
    setCurrentState('options');
  };

  const handleLogout = async () => {
    await authService.signOut();
    console.log('User logged out');
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
           <p className="text-white">{currentState === 'analyzing' ? 'Analyzing resume and generating questions...' : 'Loading...'}</p>
           {currentState === 'analyzing' && <p className="text-gray-400 text-sm mt-2">{analysisProgress}%</p>}
        </div>
      </div>
    );
  }


  const renderCurrentState = () => {
    console.log('Rendering state in renderCurrentState:', currentState);
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
        return <ResumeUpload interviewType={selectedInterviewType} onAnalysisComplete={handleResumeUploaded} />;

      case 'analyzing':
         return analysisProgress < 100 ? (
             <ResumeAnalyzing fileName="Your Resume" progress={analysisProgress} />
         ) : null;


      case 'options':
        return <InterviewOptions onSelectOption={handleInterviewTypeSelected} onLogout={handleLogout} />;

      case 'interview':
        return interviewQuestions.length > 0 ? (
          <InterviewSession
            interviewType={selectedInterviewType}
            interviewQuestions={interviewQuestions}
            onFinish={handleFinishInterview}
            onQuit={handleQuitInterview}
          />
        ) : (
          <div className="min-h-screen bg-black flex items-center justify-center">
            <p className="text-white">Loading interview questions...</p>
          </div>
        );

      default:
        return <IntroductionPage onGetStarted={handleGetStarted} user={user} onLogout={handleLogout} onStartInterview={handleStartInterview} />;
    }
  };

  return <div className="min-h-screen">{renderCurrentState()}</div>;
};

export default Index;
