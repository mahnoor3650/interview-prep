// src/pages/Test/SpeechTest.jsx
import { useState } from 'react';
import SpeechToText from '../../components/UI/SpeechToText';

const SpeechTest = () => {
  const [transcript, setTranscript] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Speech-to-Text Test</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Try the Speech-to-Text Feature
            </h2>
            <p className="text-gray-600 mb-4">
              Click the microphone button to start speaking, or type directly in the text area.
              The speech will be converted to text in real-time.
            </p>
            
            <SpeechToText
              onTranscriptChange={setTranscript}
              placeholder="Click microphone to speak or type your message here..."
              className="mb-4"
            />
          </div>
          
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Current Transcript:</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-[100px]">
              {transcript ? (
                <p className="text-gray-800">{transcript}</p>
              ) : (
                <p className="text-gray-500 italic">No text yet. Try speaking or typing above.</p>
              )}
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-md font-semibold text-blue-800 mb-2">💡 Tips:</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Make sure your microphone is enabled in your browser</li>
              <li>• Speak clearly and at a normal pace</li>
              <li>• Works best in Chrome, Edge, or Safari</li>
              <li>• You can edit the text after speaking</li>
              <li>• Use the clear button (square icon) to reset the text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechTest;
