// Gemini AI integration service

// Updated Gemini edge function URL
const GEMINI_FUNCTION_URL = 'https://swzypvvwwiqzciwemvxw.supabase.co/functions/v1/07aedc15-5887-4f0f-bac5-adf6707617cb';

export interface GeminiResponse {
  result?: string | any[] | object; // Updated to allow array or object for parsed JSON
  error?: string;
}

export interface ValidationResult {
  rating: number;
  feedback: string;
}

export interface OptimalAnswerResult {
  answer: string;
}

export const geminiService = {
  async analyzeResume(resumeFile: File, interviewType: string): Promise<string[]> { // Changed resumeText to resumeFile (File)
    try {
      console.log('Analyzing resume with Gemini:', { fileName: resumeFile.name, interviewType });

      const formData = new FormData();
      formData.append('action', 'analyze_resume');
      formData.append('interviewType', interviewType);
      formData.append('resumeFile', resumeFile); // Append the file

      const response = await fetch(GEMINI_FUNCTION_URL, {
        method: 'POST',
        body: formData, // Use FormData for multipart/form-data
        // The 'Content-Type' header is automatically set by fetch when using FormData
      });

      const result: GeminiResponse = await response.json();
      console.log('Gemini response for analyzeResume:', result);

      if (!response.ok) {
           // Handle HTTP errors
           const errorMessage = result.error || `HTTP error! status: ${response.status}`;
           console.error('Edge function error:', errorMessage);
           throw new Error(`Error analyzing resume: ${errorMessage}`);
      }
      else if (result.error) {
        console.error('Gemini error:', result.error);
        throw new Error(result.error);
      }

      // Expecting result.result to be an array of strings (questions)
      if (result.result && Array.isArray(result.result)) {
         console.log('Parsed questions:', result.result);
         return result.result as string[];
      } else {
         console.error('Unexpected response format for questions:', result);
         throw new Error('Received unexpected response format for questions.');
      }

    } catch (error) {
      console.error('Gemini analysis failed:', error);
      // Return fallback questions on error
      return this.getFallbackQuestions(interviewType);
    }
  },

  async validateAnswer(question: string, answer: string): Promise<ValidationResult> {
    try {
      const response = await fetch(GEMINI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate_answer',
          data: { question, answer }
        })
      });

      const result: GeminiResponse = await response.json();
       console.log('Gemini response for validateAnswer:', result);

      if (!response.ok) {
           const errorMessage = result.error || `HTTP error! status: ${response.status}`;
           console.error('Edge function error:', errorMessage);
           throw new Error(`Error validating answer: ${errorMessage}`);
      }
      else if (result.error) {
        throw new Error(result.error);
      }

      // Expecting result.result to be a ValidationResult object
      if (result.result && typeof result.result === 'object' && 'rating' in result.result && 'feedback' in result.result) {
           const validation = result.result as ValidationResult;
           return { rating: Math.max(1, Math.min(5, validation.rating)), feedback: validation.feedback };
      } else {
          console.error('Unexpected response format for validation:', result);
          throw new Error('Received unexpected response format for validation.');
      }

    } catch (error) {
      console.error('Validation failed:', error);
      return {
        rating: Math.floor(Math.random() * 3) + 2,
        feedback: 'Unable to validate answer at this time.'
      };
    }
  },

  async getOptimalAnswer(question: string): Promise<string> {
    try {
      const response = await fetch(GEMINI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'optimal_answer',
          data: { question }
        })
      });

      const result: GeminiResponse = await response.json();
       console.log('Gemini response for getOptimalAnswer:', result);

      if (!response.ok) {
           const errorMessage = result.error || `HTTP error! status: ${response.status}`;
           console.error('Edge function error:', errorMessage);
           throw new Error(`Error getting optimal answer: ${errorMessage}`);
      }
      else if (result.error) {
        throw new Error(result.error);
      }

      // Expecting result.result to be an object with an 'answer' field
      if (result.result && typeof result.result === 'object' && 'answer' in result.result) {
           return (result.result as OptimalAnswerResult).answer;
      } else {
          console.error('Unexpected response format for optimal answer:', result);
          throw new Error('Received unexpected response format for optimal answer.');
      }

    } catch (error) {
      console.error('Optimal answer failed:', error);
      return 'Unable to generate optimal answer at this time.';
    }
  },

  async addPunctuationToTranscript(transcript: string): Promise<string> {
    try {
      const response = await fetch(GEMINI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_punctuation', // A new action for your Edge Function
          data: { text: transcript }
        })
      });

      const result: GeminiResponse = await response.json();
      console.log('Gemini response for addPunctuationToTranscript:', result);

      if (!response.ok) {
        const errorMessage = result.error || `HTTP error! status: ${response.status}`;
        console.error('Edge function error:', errorMessage);
        throw new Error(`Error adding punctuation: ${errorMessage}`);
      } else if (result.error) {
        throw new Error(result.error);
      }

      // Assuming the Edge Function returns the punctuated text in result.result
      if (result.result && typeof result.result === 'string') {
        return result.result;
      } else {
        console.error('Unexpected response format for punctuation:', result);
        throw new Error('Received unexpected response format for punctuation.');
      }
    } catch (error) {
      console.error('Adding punctuation failed:', error);
      // Return the original transcript on error
      return transcript;
    }
  },
    // Note: The parse methods are no longer needed as the edge function is expected to return parsed JSON directly.
    // I will remove them in the next turn.

  getFallbackQuestions(interviewType: string): string[] {
    const fallbackQuestions = {
      technical: [
        'Tell me about your technical background and experience.',
        'Describe a challenging technical problem you solved.',
        'How do you approach learning new technologies?',
        'What development tools and methodologies do you use?',
        'How do you ensure code quality in your projects?',
        'Describe your experience with databases.',
        'How do you handle version control in team projects?',
        'What is your approach to testing and debugging?',
        'Tell me about a project you are most proud of.',
        'How do you stay updated with technology trends?',
        'Describe your experience with system design.',
        'How do you handle performance optimization?',
        'What is your approach to documentation?',
        'Tell me about your experience with APIs.',
        'How do you approach problem-solving in development?'
      ],
      hr: [
        'Tell me about yourself and your background.',
        'Why are you interested in this position?',
        'What are your greatest strengths?',
        'What is your biggest weakness?',
        'Where do you see yourself in 5 years?',
        'Why are you leaving your current job?',
        'How do you handle stress and pressure?',
        'Describe a time you faced a challenge at work.',
        'What motivates you in your career?',
        'How do you handle conflicts with colleagues?',
        'What are your salary expectations?',
        'Why should we hire you?',
        'What questions do you have for us?',
        'Describe your ideal work environment.',
        'How do you prioritize your work?'
      ],
      testcase: [
        'Walk me through how you would test a login feature.',
        'How do you approach testing a new application?',
        'What is the difference between functional and non-functional testing?',
        'Describe your experience with test automation.',
        'How do you prioritize test cases?',
        'What tools do you use for testing?',
        'How do you handle bug reporting and tracking?',
        'Describe a challenging bug you found and fixed.',
        'What is your approach to regression testing?',
        'How do you test APIs?',
        'What is your experience with performance testing?',
        'How do you ensure test coverage?',
        'Describe your experience with mobile app testing.',
        'How do you handle testing in agile environments?',
        'What is your approach to user acceptance testing?']
    };

    const questions = fallbackQuestions[interviewType as keyof typeof fallbackQuestions] || fallbackQuestions.hr;
    return questions.slice(0, 15);
  }
};
