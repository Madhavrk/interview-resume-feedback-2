import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Sparkles } from 'lucide-react';

interface ResumeUploadProps {
  onResumeUploaded: (file: File) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeUploaded }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setUploadedFile(file);
      onResumeUploaded(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
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
            <p className="text-gray-300 text-lg">Upload Your Resume</p>
            <p className="text-gray-400 text-sm">AI will analyze your resume to create personalized interview questions</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'border-purple-400 bg-purple-500/10 scale-105' : 'border-white/30 hover:border-purple-400 hover:bg-white/5'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={handleChooseFile}
            >
              {uploadedFile ? (
                <div className="text-green-400 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-300">Resume uploaded successfully!</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-300 space-y-4">
                  <div className="w-16 h-16 mx-auto bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xl mb-2 text-white">Drag and drop your resume here</p>
                    <p className="text-sm mb-6 text-gray-400">or click to browse files</p>
                    <Button 
                      onClick={handleChooseFile}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white cursor-pointer px-8 py-3 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Choose File
                    </Button>
                    <p className="text-xs text-gray-500 mt-4">PDF files only • Max 10MB</p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeUpload;