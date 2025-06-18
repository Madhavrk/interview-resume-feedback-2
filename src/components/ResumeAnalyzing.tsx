import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Brain, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ResumeAnalyzingProps {
  fileName: string;
  progress: number;
}

const ResumeAnalyzing: React.FC<ResumeAnalyzingProps> = ({ fileName, progress }) => {
  const getAnalysisStep = () => {
    if (progress < 25) return 'Reading resume content...';
    if (progress < 50) return 'Extracting skills and experience...';
    if (progress < 75) return 'Analyzing career profile...';
    if (progress < 100) return 'Generating interview questions...';
    return 'Analysis complete!';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1926&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ResQ
              </CardTitle>
            </div>
            <p className="text-gray-300 text-lg">Analyzing Your Resume</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
                <Brain className="w-10 h-10 text-purple-400" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-semibold text-lg">{fileName}</p>
                <p className="text-purple-300 text-sm">{getAnalysisStep()}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Progress value={progress} className="w-full h-3" />
              <p className="text-center text-gray-400 text-sm">{progress}% Complete</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                progress >= 25 ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {progress >= 25 ? <CheckCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                <span>Content Extraction</span>
              </div>
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                progress >= 50 ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {progress >= 50 ? <CheckCircle className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                <span>Skills Analysis</span>
              </div>
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                progress >= 75 ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {progress >= 75 ? <CheckCircle className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>Profile Matching</span>
              </div>
              <div className={`flex items-center space-x-2 p-3 rounded-lg ${
                progress >= 100 ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {progress >= 100 ? <CheckCircle className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                <span>Question Generation</span>
              </div>
            </div>

            <div className="text-center text-gray-400 text-sm">
              <p>Please wait while our AI analyzes your resume...</p>
              <p>This usually takes 10-15 seconds.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeAnalyzing;