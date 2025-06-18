// Gemini AI integration service

const GEMINI_FUNCTION_URL = 'https://swzypvvwwiqzciwemvxw.supabase.co/functions/v1/900f54f5-6c85-4553-91e6-048cd6afc34c';

export interface GeminiResponse {
  result?: string;
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
  async analyzeResume(resumeText: string, interviewType: string): Promise<string[]> {
    try {
      console.log('Analyzing resume with Gemini:', { resumeText: resumeText.substring(0, 100), interviewType });
      
      const response = await fetch(GEMINI_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyze_resume',
          data: { resumeText, interviewType }
        })
      });

      const result: GeminiResponse = await response.json();
      console.log('Gemini response:', result);
      
      if (result.error) {
        console.error('Gemini error:', result.error);
        throw new Error(result.error);
      }

      // Parse questions from Gemini response
      const questions = this.parseQuestions(result.result || '');
      console.log('Parsed questions:', questions);
      
      return questions.length >= 15 ? questions.slice(0, 15) : this.getFallbackQuestions(interviewType);
    } catch (error) {
      console.error('Gemini analysis failed:', error);
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
      
      if (result.error) {
        throw new Error(result.error);
      }

      return this.parseValidation(result.result || '');
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
      
      if (result.error) {
        throw new Error(result.error);
      }

      return this.parseOptimalAnswer(result.result || '');
    } catch (error) {
      console.error('Optimal answer failed:', error);
      return 'Unable to generate optimal answer at this time.';
    }
  },

  parseQuestions(text: string): string[] {
    try {
      // Clean the text first
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      
      const parsed = JSON.parse(cleanText);
      if (Array.isArray(parsed)) {
        return parsed.filter(q => typeof q === 'string' && q.trim().length > 0);
      }
    } catch (e) {
      console.warn('Failed to parse JSON questions, trying fallback parsing');
      // Fallback parsing
      const lines = text.split('\n').filter(line => line.trim());
      return lines.map(line => line.replace(/^\d+\.\s*/, '').replace(/^["']|["']$/g, '').trim()).filter(q => q.length > 0);
    }
    return [];
  },

  parseValidation(text: string): ValidationResult {
    try {
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      
      const parsed = JSON.parse(cleanText);
      if (parsed.rating && parsed.feedback) {
        return { rating: Math.max(1, Math.min(5, parsed.rating)), feedback: parsed.feedback };
      }
    } catch (e) {
      console.warn('Failed to parse validation JSON');
    }
    return {
      rating: Math.floor(Math.random() * 3) + 2,
      feedback: 'Good effort! Keep practicing to improve your responses.'
    };
  },

  parseOptimalAnswer(text: string): string {
    try {
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      }
      
      const parsed = JSON.parse(cleanText);
      if (parsed.answer) {
        return parsed.answer;
      }
    } catch (e) {
      // Return raw text if not JSON
    }
    return text || 'Practice highlighting your relevant experience and skills.';
  },

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
        'What is your approach to user acceptance testing?'
      ]
    };

    const questions = fallbackQuestions[interviewType as keyof typeof fallbackQuestions] || fallbackQuestions.hr;
    return questions.slice(0, 15);
  }
};