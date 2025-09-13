// src/components/Test/ApiTest.jsx
import { useState } from 'react';
import { freeAIService } from '../../services/freeAIService';
import LoadingSpinner from '../UI/LoadingSpinner';

const ApiTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const testHuggingFace = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Testing Free AI Services...');
      const result = await freeAIService.generateQuestion('technical', 'intermediate', []);
      setResults({ provider: 'Free AI Services', result });
      console.log('Free AI test successful:', result);
    } catch (err) {
      setError({ provider: 'Free AI Services', error: err.message });
      console.error('Free AI test failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleAI = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Testing AI Analysis...');
      const result = await freeAIService.analyzeResponse(
        "Tell me about yourself",
        "I am a software developer with 5 years of experience...",
        {}
      );
      setResults({ provider: 'AI Analysis', result });
      console.log('AI Analysis test successful:', result);
    } catch (err) {
      setError({ provider: 'AI Analysis', error: err.message });
      console.error('AI Analysis test failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testHealthCheck = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('Testing API health check...');
      const health = await freeAIService.healthCheck();
      setResults({ provider: 'Health Check', result: health });
      console.log('Health check successful:', health);
    } catch (err) {
      setError({ provider: 'Health Check', error: err.message });
      console.error('Health check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testGoogleAIModels = async () => {
    try {
      console.log('🔍 Fetching Google AI models...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY}`);
      const data = await response.json();
      console.log('📋 Google AI Models:', data);
      setResults({ provider: 'Google AI Models', result: data });
    } catch (error) {
      console.error('❌ Error fetching models:', error);
      setError({ provider: 'Google AI Models', error: error.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI API Test</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testHuggingFace}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Free AI Services
          </button>
          
          <button
            onClick={testGoogleAI}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
          >
            Test AI Analysis
          </button>
          
          <button
            onClick={testHealthCheck}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
          >
            Test Health Check
          </button>
          
          <button
            onClick={testGoogleAIModels}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
          >
            List Google AI Models
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="large" showText={true} text="Testing API..." />
          </div>
        )}

        {results && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ {results.provider} Test Successful
            </h3>
            <pre className="text-sm text-green-700 bg-green-100 p-3 rounded overflow-auto">
              {JSON.stringify(results.result, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              ❌ {error.provider} Test Failed
            </h3>
            <p className="text-red-700">{error.error}</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Environment Variables:</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Groq Key: {import.meta.env.VITE_GROQ_API_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>Together AI Key: {import.meta.env.VITE_TOGETHER_API_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>OpenAI Key: {import.meta.env.VITE_OPENAI_API_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>Google AI Key: {import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
