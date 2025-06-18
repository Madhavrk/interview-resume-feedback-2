// Text-to-Speech service for optimal answers

export const speechService = {
  speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);
      
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    });
  },

  stop(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  },

  isSupported(): boolean {
    return 'speechSynthesis' in window;
  }
};

// Speech recognition service for user answers
export const recognitionService = {
  startListening(onResult: (text: string) => void, onError?: (error: string) => void): () => void {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      onError?.('Speech recognition not supported');
      return () => {};
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let finalTranscript = '';
    let isListening = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update with current transcript
      onResult(finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      onError?.(event.error);
    };

    recognition.onend = () => {
      if (isListening) {
        // Restart if still supposed to be listening
        try {
          recognition.start();
        } catch (e) {
          console.error('Failed to restart recognition:', e);
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      onError?.('Failed to start speech recognition');
    }

    return () => {
      isListening = false;
      try {
        recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    };
  },

  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
};