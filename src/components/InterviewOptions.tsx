import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Users, TestTube, Sparkles } from 'lucide-react';

type InterviewType = 'technical' | 'hr' | 'testcase';

interface InterviewOptionsProps {
  onSelectOption: (option: InterviewType) => void;
}

const InterviewOptions: React.FC<InterviewOptionsProps> = ({ onSelectOption }) => {
  const options = [
    {
      type: 'technical' as InterviewType,
      title: 'Technical Interview',
      description: 'Programming, algorithms, and technical skills',
      icon: Code,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'hr' as InterviewType,
      title: 'HR Interview',
      description: 'Behavioral questions and soft skills',
      icon: Users,
      color: 'from-green-500 to-emerald-500'
    },
    {
      type: 'testcase' as InterviewType,
      title: 'Test Cases',
      description: 'Problem-solving and analytical thinking',
      icon: TestTube,
      color: 'from-orange-500 to-red-500'
    }
  ];

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
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ResQ
              </h1>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Choose Interview Type</h2>
            <p className="text-gray-300">Select the type of interview you want to practice</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {options.map((option) => {
              const IconComponent = option.icon;
              return (
                <Card
                  key={option.type}
                  className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                  onClick={() => onSelectOption(option.type)}
                >
                  <CardHeader className="text-center space-y-4">
                    <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${option.color} rounded-full flex items-center justify-center`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl text-white">{option.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-300 mb-6">{option.description}</p>
                    <Button className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90 text-white font-semibold py-3 rounded-lg shadow-lg transition-all duration-300`}>
                      Start Interview
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewOptions;