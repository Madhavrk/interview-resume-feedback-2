import React, { useState } from 'react';
import IntroductionPage from './IntroductionPage';
import LoginPage from './LoginPage';
import SignUpPage from './SignUpPage';
import OTPPage from './OTPPage';
import ResumeUpload from './ResumeUpload';
import InterviewOptions from './InterviewOptions';
import InterviewSession from './InterviewSession';

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

  const handleGetStarted = () => {
    setCurrentState('login');
  };

  const handleLogin = () => {
    setCurrentState('resume-upload');
  };

  const handleSignUp = (userData: any) => {
    setUserEmail(userData.email);
    setCurrentState('otp');
  };

  const handleOTPVerified = () => {
    setCurrentState('login');
  };

  const handleResumeUploaded = (file: File) => {
    setResumeFile(file);
    setCurrentState('interview-options');
  };

  const handleInterviewOptionSelected = (option: InterviewType) => {
    setSelectedInterviewType(option);
    setCurrentState('interview-session');
  };

  const handleInterviewFinished = () => {
    setCurrentState('resume-upload');
  };

  const renderCurrentState = () => {
    switch (currentState) {
      case 'introduction':
        return <IntroductionPage onGetStarted={handleGetStarted} />;
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
            onResendOTP={() => console.log('Resending OTP...')}
          />
        );
      case 'resume-upload':
        return <ResumeUpload onResumeUploaded={handleResumeUploaded} />;
      case 'interview-options':
        return <InterviewOptions onSelectOption={handleInterviewOptionSelected} />;
      case 'interview-session':
        return (
          <InterviewSession
            interviewType={selectedInterviewType}
            resumeFile={resumeFile!}
            onFinish={handleInterviewFinished}
          />
        );
      default:
        return null;
    }
  };

  return <div className="min-h-screen">{renderCurrentState()}</div>;
};

export default AppLayout;