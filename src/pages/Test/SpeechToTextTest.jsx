// src/pages/Test/SpeechToTextTest.jsx
import { useState } from 'react';
import SpeechToText from '../../components/UI/SpeechToText';

const SpeechToTextTest = () => {
  const [transcript, setTranscript] = useState('');
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (action, details) => {
    const timestamp = new Date().toLocaleTimeString();
    setTestResults(prev => [...prev, { timestamp, action, details }]);
  };

  const handleTranscriptChange = (value) => {
    setTranscript(value);
    addTestResult('Transcript Changed', `New value: "${value}"`);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Speech-to-Text Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Speech-to-Text Component */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Speech-to-Text Component</h2>
            <p className="text-gray-600">
              Test the speech-to-text functionality. Click the microphone to start speaking, 
              or type directly in the text area.
            </p>
            
            <SpeechToText
              onTranscriptChange={handleTranscriptChange}
              placeholder="Click microphone to speak or type your message here..."
              className="mb-4"
              showDebugInfo={true}
            />
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Transcript:</h3>
              <div className="min-h-[100px] p-3 bg-white border rounded">
                {transcript ? (
                  <p className="text-gray-800 whitespace-pre-wrap">{transcript}</p>
                ) : (
                  <p className="text-gray-500 italic">No text yet. Try speaking or typing above.</p>
                )}
              </div>
            </div>
          </div>

          {/* Test Results Log */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Test Results Log</h2>
              <button
                onClick={clearTestResults}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Clear Log
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 italic">No test results yet. Start using the speech-to-text component.</p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-xs border-b border-gray-200 pb-2">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-blue-600">{result.action}</span>
                        <span className="text-gray-500">{result.timestamp}</span>
                      </div>
                      <div className="text-gray-700 mt-1">{result.details}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">🧪 Testing Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Speech Testing:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Click the microphone button to start recording</li>
                <li>Speak clearly and at normal pace</li>
                <li>Watch the text appear in real-time</li>
                <li>Click the microphone again to stop</li>
                <li>Check if text persists after stopping</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Manual Testing:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Type directly in the text area</li>
                <li>Edit the text after speech recognition</li>
                <li>Use the clear button (square icon) to reset</li>
                <li>Check the debug info at the bottom</li>
                <li>Monitor the test results log</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">🔧 Troubleshooting</h3>
          <div className="text-sm text-amber-700 space-y-2">
            <p><strong>If speech recognition doesn't work:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Make sure you're using Chrome, Edge, or Safari</li>
              <li>Allow microphone access when prompted</li>
              <li>Check if your microphone is working in other applications</li>
              <li>Try refreshing the page and allowing permissions again</li>
            </ul>
            <p><strong>If text disappears when you stop speaking:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Check the debug info to see what's happening</li>
              <li>Look at the test results log for error messages</li>
              <li>Try speaking in shorter phrases</li>
              <li>Make sure you're speaking clearly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeechToTextTest;
