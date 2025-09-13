// src/pages/Interview/InterviewSession.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  selectCurrentQuestion, 
  selectCurrentSession, 
  selectIsGeneratingQuestion,
  generateInterviewQuestion,
  nextQuestion,
  previousQuestion,
  saveResponse,
  startTimer,
  updateTimer,
  stopTimer
} from '../../store/slices/interviewSlice';
import SpeechToText from '../../components/UI/SpeechToText';
import toast from 'react-hot-toast';

const InterviewSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const setup = location.state?.setup;

  // Redux state
  const currentQuestion = useAppSelector(selectCurrentQuestion);
  const currentSession = useAppSelector(selectCurrentSession);
  const isGeneratingQuestion = useAppSelector(selectIsGeneratingQuestion);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [totalQuestions] = useState(setup?.questionCount || 5);
  const [timeRemaining, setTimeRemaining] = useState(setup?.timeLimit || 300);
  const [isActive, setIsActive] = useState(false);
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!setup) {
      navigate('/interview/setup');
      return;
    }

    if (setup.timeLimit > 0) {
      setIsActive(true);
      dispatch(startTimer(setup.timeLimit));
    }
  }, [setup, navigate, dispatch]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        const newTime = timeRemaining - 1;
        setTimeRemaining(newTime);
        dispatch(updateTimer(newTime));
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsActive(false);
      dispatch(stopTimer());
    }
    return () => clearInterval(interval);
  }, [isActive, timeRemaining, dispatch]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = async () => {
    // Save current response
    if (response.trim()) {
      dispatch(saveResponse({
        questionId: currentQuestion?.id || `q${currentQuestionIndex}`,
        response: response.trim(),
        timeSpent: (setup?.timeLimit || 300) - timeRemaining,
      }));
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setResponse('');
      setTimeRemaining(setup?.timeLimit || 300);
      setIsActive(setup?.timeLimit > 0);
      
      // Generate next AI question if needed
      if (currentQuestionIndex + 1 >= currentSession.questions.length) {
        try {
          await dispatch(generateInterviewQuestion({
            category: setup.category,
            difficulty: setup.difficulty,
            selectedLanguages: setup.selectedLanguages || [],
            previousQuestions: currentSession.questions,
          }));
        } catch (error) {
          console.error('Error generating next question:', error);
          toast.error('Failed to generate next question');
        }
      }
    } else {
      // Interview completed
      toast.success('Interview completed! Great job!');
      navigate('/interview/history');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setResponse('');
      setTimeRemaining(setup?.timeLimit || 300);
      setIsActive(setup?.timeLimit > 0);
    }
  };

  // Get the current question from Redux or fallback
  const displayQuestion = currentQuestion || {
    question: "Tell me about yourself and why you're interested in this role.",
    category: setup?.category || "general",
    difficulty: setup?.difficulty || "intermediate",
    expectedKeyPoints: ["Clear communication", "Specific examples", "Problem-solving approach"],
    timeLimit: setup?.timeLimit || 300,
    difficultyScore: 5
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        {/* Header */}
        <div className="px-4 py-5 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {setup?.category} Interview
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              {setup?.selectedLanguages && setup.selectedLanguages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">Focusing on:</p>
                  <div className="flex flex-wrap gap-1">
                    {setup.selectedLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="text-center sm:text-right">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-500">Time Remaining</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-3 bg-gray-50">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Question {currentQuestionIndex + 1}
            </h2>
            {isGeneratingQuestion ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                  <p className="text-gray-600">Generating AI question...</p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-800 text-lg">{displayQuestion.question}</p>
                {displayQuestion.expectedKeyPoints && displayQuestion.expectedKeyPoints.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Key points to consider:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {displayQuestion.expectedKeyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Response Area */}
          <div className="mb-6">
            <label htmlFor="response" className="block text-sm font-medium text-gray-700 mb-2">
              Your Response
            </label>
            <SpeechToText
              onTranscriptChange={setResponse}
              placeholder="Click microphone to speak or type your answer here..."
              disabled={isGeneratingQuestion}
              className="mb-2"
            />
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{response.length} characters</span>
              <span className="text-blue-600">
                💡 Tip: Click the microphone to speak your answer
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/interview/setup')}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                End Session
              </button>
              <button
                onClick={handleNext}
                disabled={isGeneratingQuestion}
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingQuestion ? 'Generating...' : (currentQuestionIndex === totalQuestions - 1 ? 'Finish' : 'Next')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSession;
