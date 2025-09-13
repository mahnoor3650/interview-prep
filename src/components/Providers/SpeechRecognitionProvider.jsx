// src/components/Providers/SpeechRecognitionProvider.jsx
import { createContext, useContext } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const SpeechRecognitionContext = createContext();

export const useSpeechRecognitionContext = () => {
  const context = useContext(SpeechRecognitionContext);
  if (!context) {
    throw new Error('useSpeechRecognitionContext must be used within a SpeechRecognitionProvider');
  }
  return context;
};

export const SpeechRecognitionProvider = ({ children }) => {
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const startListening = () => {
    if (browserSupportsSpeechRecognition && isMicrophoneAvailable) {
      SpeechRecognition.startListening({
        continuous: true,
        language: 'en-US',
      });
    }
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const abortListening = () => {
    SpeechRecognition.abortListening();
  };

  const value = {
    transcript,
    interimTranscript,
    finalTranscript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    startListening,
    stopListening,
    abortListening,
  };

  return (
    <SpeechRecognitionContext.Provider value={value}>
      {children}
    </SpeechRecognitionContext.Provider>
  );
};
