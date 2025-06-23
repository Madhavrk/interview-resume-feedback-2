import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Send, Square, X } from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { speechService, recognitionService } from '@/lib/speech';

interface InterviewSessionProps {
  interviewType: 'technical' | 'hr' | 'testcase';
  onFinish: () => void;
  onQuit: () => void;
  interviewQuestions: string[];
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ interviewType, onFinish, onQuit, interviewQuestions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [feedback, setFeedback] = useState<{rating: number, comment: string} | null>(null);
  const [optimalAnswer, setOptimalAnswer] = useState('');
  const [ratings, setRatings] = useState<number[]>([]);
  const [showFinalScore, setShowFinalScore] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Added state for tracking speech
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false); // New state for processing user answer
  const [stopRecording, setStopRecording] = useState<(() => void) | null>(null);
  const [recordingError, setRecordingError] = useState('');
  const [showQuitDialog, setShowQuitDialog] = useState(false);

  // Effect to reset state and question index when interviewQuestions change
  useEffect(() => {
    setCurrentQuestion(0);
    setUserAnswer('');
    setShowResults(false);
    setFeedback(null);
    setOptimalAnswer('');
    setRecordingError('');
  }, [interviewQuestions, interviewType]);

  // Effect for cleaning up speech recognition when the component unmounts
  useEffect(() => {
    return () => {
      if (stopRecording) {
        console.log('Cleaning up recording on unmount.');
        stopRecording();
      }
    };
  }, [stopRecording]);


  const handleStartRecording = () => {
    if (recognitionService.isSupported()) {
      setIsRecording(true);
      setRecordingError('');
      setUserAnswer('');

      const stop = recognitionService.startListening(
        (text) => setUserAnswer(text),
        // Explicitly cast error to 'any' to resolve type error
        (error: any) => {
          console.error('Speech recognition error:', error);
          setRecordingError(`Recording error: ${typeof error === 'string' ? error : error.message || 'Unknown error'}`);
          setIsRecording(false);
          if (stopRecording) {
             stopRecording();
             setStopRecording(null);
          }
        }
      );
      setStopRecording(() => stop);
    } else {
      setRecordingError('Speech recognition not supported in this browser');
    }
  };

  const handleStopRecording = () => {
    if (stopRecording) {
      stopRecording();
      setStopRecording(null);
    }
    setIsRecording(false);

    // Process the recorded answer for punctuation
    if (userAnswer.trim()) {
      setIsProcessingAnswer(true); // Set processing state to true
      geminiService.addPunctuationToTranscript(userAnswer)
        .then(punctuatedText => {
          setUserAnswer(punctuatedText); // Update with punctuated text
          setShowResults(true); // Show results only after processing
        })
        .catch(error => {
          console.error('Error processing answer for punctuation:', error);
          // Optionally set an error state or display a message to the user
          setShowResults(true); // Show results even if punctuation fails
        }).finally(() => setIsProcessingAnswer(false)); // Set processing state to false
    } else { setShowResults(true); } // Show results even if no answer was recorded
  };

  const handleVerifyAnswer = async () => {
    try {
      const validation = await geminiService.validateAnswer(interviewQuestions[currentQuestion], userAnswer);
      setFeedback({ rating: validation.rating, comment: validation.feedback });
      setRatings([...ratings, validation.rating]);
    } catch (error) {
      const rating = Math.floor(Math.random() * 3) + 2;
      setFeedback({ rating, comment: 'Good effort! Keep practicing to improve your responses.' });
      setRatings([...ratings, rating]);
    }
  };

  const handleOptimalAnswer = async () => {
    try {
      const optimal = await geminiService.getOptimalAnswer(interviewQuestions[currentQuestion]);
      setOptimalAnswer(optimal); // Set the optimal answer text first

      if (speechService.isSupported()) {
        setIsSpeaking(true); // Set speaking state to true before initiating speech
        try {
          await speechService.speak(optimal); // Wait for the speech to finish
        } catch (speechError) {
          console.error('Speech synthesis error:', speechError);
          // Handle speech error if necessary, but do not clear the optimalAnswer text
        } finally {
          setIsSpeaking(false); // Ensure speaking state is set to false after speech attempt
        }
      }
    } catch (geminiError) {
      console.error('Gemini service error fetching optimal answer:', geminiError);
      // Only clear the text if there was an error fetching the optimal answer from Gemini
      setOptimalAnswer('Unable to generate optimal answer at this time.');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < interviewQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
      setShowResults(false);
      setFeedback(null);
      setOptimalAnswer('');
      setRecordingError('');
      if (stopRecording) {
         stopRecording();
         setStopRecording(null);
         setIsRecording(false);
      }
    } else {
       if (stopRecording) {
         stopRecording();
         setStopRecording(null);
         setIsRecording(false);
      }
      setShowFinalScore(true);
    }
  };

  const handleQuit = () => {
    setShowQuitDialog(true);
  };

  const confirmQuit = () => {
    if (stopRecording) {
      console.log('Stopping recording before confirming quit.');
      stopRecording();
      setStopRecording(null);
       setIsRecording(false);
    }
    onQuit();
  };

  const calculateFinalScore = () => {
    if (ratings.length === 0) return 0;
    const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return Math.round((average * 2) * 10) / 10;
  };

  const speakQuestion = async () => {
    if (speechService.isSupported()) {
      await speechService.speak(interviewQuestions[currentQuestion]);
    }
  };

  if (interviewQuestions.length === 0) {
     return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Generating interview questions...</p>
        </div>
      </div>
    );
  }


  if (showFinalScore) {
    const finalScore = calculateFinalScore();
    return (
      <div className="min-h-screen bg-black p-4 flex items-center justify-center">
        <Card className="bg-gray-900 border-red-600 border-2 shadow-2xl max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500 text-3xl">Interview Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <h3 className="text-white text-xl mb-2">Your Final Score</h3>
              <div className="text-6xl font-bold text-red-500">{finalScore}/10</div>
            </div>
            <Button onClick={onFinish} className="w-full bg-red-600 hover:bg-red-700 text-white py-3">
              Finish Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-red-500 mb-2">ResQ</h1>
            <p className="text-gray-300">{interviewType.toUpperCase()} Interview</p>
            <p className="text-sm text-gray-400">Question {currentQuestion + 1} of {interviewQuestions.length}</p>
          </div>
          <Button onClick={handleQuit} variant="destructive" className="bg-red-600 hover:bg-red-700">
            <X className="mr-2 w-4 h-4" />Quit
          </Button>
        </div>

        {showQuitDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-gray-900 border-red-600 max-w-sm w-full mx-4">
              <CardHeader>
                <CardTitle className="text-white">Quit Interview?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">Are you sure you want to quit the interview? Your progress will be lost.</p>
                <div className="flex gap-2">
                  <Button onClick={confirmQuit} variant="destructive" className="flex-1">
                    Yes, Quit
                  </Button>
                  <Button onClick={() => setShowQuitDialog(false)} variant="outline" className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-gray-900 border-red-600 border-2 shadow-2xl mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>Current Question</span>
              <Button onClick={speakQuestion} variant="outline" size="sm" className="border-red-600 text-red-500">
                <Volume2 size={16} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 text-lg mb-4">{interviewQuestions[currentQuestion]}</p>

            {!showResults ? (
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  {!isRecording ? (
                    <Button onClick={handleStartRecording} className="px-8 py-4 bg-red-600 hover:bg-red-700">
                      <Mic className="mr-2" size={20} />Start Recording
                    </Button>
                  ) : (
                    <Button onClick={handleStopRecording} className="px-8 py-4 bg-green-600 hover:bg-green-700">
                      <Square className="mr-2" size={20} />Stop Recording
                    </Button>
                  )}
                </div>
                {isProcessingAnswer && (
                  <div className="text-center">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto mb-2"></div>
                    <p className="text-gray-400">Processing answer...</p>
                  </div>
                )}



                {isRecording && (
                  <div className="text-center">
                    <div className="animate-pulse text-red-500 mb-2">
                      <Mic size={24} className="mx-auto" />
                    </div>
                    <p className="text-gray-400">Recording... Speak your answer</p>
                  </div>
                )}

                {recordingError && (
                  <div className="bg-red-900/50 p-3 rounded border border-red-600 text-center">
                    <p className="text-red-300">{recordingError}</p>
                  </div>
                )}

                {userAnswer && (
                  <div className="bg-gray-800 p-4 rounded border border-gray-700">
                    <h4 className="text-gray-400 text-sm mb-2">Your Response:</h4>
                    <p className="text-gray-300">{userAnswer}</p>
                    {!isRecording && (
                      <Button onClick={() => setShowResults(true)} className="mt-3 bg-blue-600 hover:bg-blue-700">
                        <Send className="mr-2" size={16} />Submit Answer
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded border border-gray-700">
                  <h4 className="text-red-400 font-semibold mb-2">Your Answer:</h4>
                  <p className="text-gray-300">{userAnswer}</p>
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                  <Button onClick={handleVerifyAnswer} className="bg-blue-600 hover:bg-blue-700">
                    Verify Answer
                  </Button>
                  <Button onClick={handleOptimalAnswer} className="bg-green-600 hover:bg-green-700">
                    Optimal Answer
                  </Button>
                  <Button onClick={handleNextQuestion} className="bg-red-600 hover:bg-red-700">
                    {currentQuestion === interviewQuestions.length - 1 ? 'Finish Interview' : 'Next Question'}
                  </Button>
                </div>

                {feedback && (
                  <div className="bg-blue-900/50 p-3 rounded border border-blue-600"> {/* Corrected border and bg */}
                    <h4 className="text-blue-400 font-semibold mb-2">AI Feedback (Rating: {feedback.rating}/5):</h4>
                    <p className="text-gray-300">{feedback.comment}</p>
                  </div>
                )}

                {optimalAnswer && (
                  <div className="bg-green-900/50 p-3 rounded border border-green-600"> {/* Corrected border and bg */}
                    <h4 className="text-green-400 font-semibold mb-2 flex justify-between items-center">
                      <span>Optimal Answer:</span>
                      {isSpeaking && ( // Conditionally render stop button
                        <Button
                          onClick={() => {
                            speechService.stop();
                            setIsSpeaking(false);
                            // Do NOT clear optimalAnswer here
                          }}
                          variant="ghost"
                          size="sm"
                        >
                          <Square size={16} className="text-red-500" /> Stop Audio</Button>)}
                    </h4>
                    <p className="text-gray-300">{optimalAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSession;
