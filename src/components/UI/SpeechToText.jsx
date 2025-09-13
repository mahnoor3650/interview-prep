// src/components/UI/SpeechToText.jsx
import { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, Square } from 'lucide-react';

const SpeechToText = ({ 
  onTranscriptChange, 
  placeholder = "Click microphone to speak or type your answer...",
  disabled = false,
  className = "",
  showDebugInfo = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  const {
    transcript: speechTranscript,
    interimTranscript: speechInterimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  // Check if speech recognition is supported
  useEffect(() => {
    setIsSupported(browserSupportsSpeechRecognition);
  }, [browserSupportsSpeechRecognition]);

  // Update listening state
  useEffect(() => {
    setIsListening(listening);
  }, [listening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    
    if (disabled) return;
    
    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Reset states
    resetTranscript();
    setTranscript('');
    setInterimTranscript('');
    
    // Start listening using native Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        if (showDebugInfo) console.log('🎤 Speech recognition started');
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        if (showDebugInfo) console.log('🎤 Speech recognition result:', event);
        
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (showDebugInfo) {
          console.log('🎤 Final transcript:', finalTranscript);
          console.log('🎤 Interim transcript:', interimTranscript);
        }
        
        // Update final transcript - append to existing
        if (finalTranscript) {
          setTranscript(prevTranscript => {
            const newTranscript = prevTranscript + finalTranscript;
            if (showDebugInfo) console.log('🎤 Setting final transcript:', newTranscript);
            onTranscriptChange?.(newTranscript);
            return newTranscript;
          });
        }
        
        // Update interim transcript
        setInterimTranscript(interimTranscript);
      };
      
      recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try again.');
        } else if (event.error === 'network') {
          alert('Network error. Please check your connection and try again.');
        }
      };
      
      recognition.onend = () => {
        if (showDebugInfo) console.log('🎤 Speech recognition ended');
        setIsListening(false);
        
        // Convert any remaining interim transcript to final
        setInterimTranscript(currentInterim => {
          if (currentInterim) {
            if (showDebugInfo) console.log('🎤 Converting interim to final:', currentInterim);
            setTranscript(prevTranscript => {
              const newTranscript = prevTranscript + ' ' + currentInterim;
              if (showDebugInfo) console.log('🎤 Final transcript after conversion:', newTranscript);
              onTranscriptChange?.(newTranscript);
              return newTranscript;
            });
          }
          return '';
        });
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  const stopListening = () => {
    if (showDebugInfo) console.log('🛑 Stopping speech recognition');
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const clearTranscript = () => {
    if (showDebugInfo) console.log('🗑️ Clearing transcript');
    // Stop any ongoing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    
    setTranscript('');
    setInterimTranscript('');
    resetTranscript();
    onTranscriptChange?.('');
    if (textareaRef.current) {
      textareaRef.current.value = '';
    }
  };

  const handleTextChange = (e) => {
    const value = e.target.value;
    if (showDebugInfo) console.log('✏️ Manual text change:', value);
    setTranscript(value);
    onTranscriptChange?.(value);
  };

  // Display text with interim transcript
  const displayText = transcript + (isListening && interimTranscript ? ' ' + interimTranscript : '');

  return (
    <div className={`relative ${className}`}>
      {/* Text Area */}
      <textarea
        ref={textareaRef}
        value={displayText}
        onChange={handleTextChange}
        placeholder={displayText ? '' : placeholder}
        disabled={disabled}
        className="w-full px-4 py-3 pb-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        rows={4}
      />
      
      {/* Control Buttons */}
      <div className="absolute bottom-2 right-2 flex space-x-1 z-10">
        {/* Clear Button */}
        {transcript && (
          <button
            onClick={clearTranscript}
            disabled={disabled}
            className="p-2 sm:p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Clear text"
          >
            <Square className="w-4 h-4 sm:w-4 sm:h-4" />
          </button>
        )}
        
        {/* Speech Recognition Button */}
        {isSupported ? (
          <button
            onClick={isListening ? stopListening : startListening}
            disabled={disabled}
            className={`p-2 sm:p-2 rounded-full transition-all duration-200 shadow-sm ${
              isListening
                ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={isListening ? 'Stop recording' : 'Start recording'}
          >
            {isListening ? <MicOff className="w-4 h-4 sm:w-4 sm:h-4" /> : <Mic className="w-4 h-4 sm:w-4 sm:h-4" />}
          </button>
        ) : (
          <div
            className="p-2 sm:p-2 bg-gray-100 text-gray-400 cursor-not-allowed rounded-full shadow-sm"
            title="Speech recognition not supported in this browser"
          >
            <Mic className="w-4 h-4 sm:w-4 sm:h-4" />
          </div>
        )}
      </div>
      
      {/* Status Indicator */}
      {isListening && (
        <div className="absolute -bottom-8 left-0 flex items-center space-x-2 text-sm text-blue-600">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span>
            {interimTranscript ? 'Processing...' : 'Listening...'}
          </span>
        </div>
      )}
      
      {/* Debug Info - Only show when explicitly requested */}
      {showDebugInfo && (
        <div className="mt-2 text-xs text-gray-500">
          <div>Final: "{transcript}"</div>
          <div>Interim: "{interimTranscript}"</div>
          <div>Display: "{displayText}"</div>
          <div>Listening: {isListening ? 'Yes' : 'No'}</div>
        </div>
      )}
      
      {/* Browser Support Warning */}
      {!isSupported && (
        <div className="mt-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
          <strong>Note:</strong> Speech recognition is not supported in this browser. 
          Please use Chrome, Edge, or Safari for the best experience.
        </div>
      )}
    </div>
  );
};

export default SpeechToText;