// src/pages/Interview/InterviewSetup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useWatch } from 'react-hook-form';
import { useAppDispatch } from '../../hooks/redux';
import { startNewSession, generateInterviewQuestion } from '../../store/slices/interviewSlice';
import { languageCategories } from '../../data/languages';
import toast from 'react-hot-toast';

const InterviewSetup = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      category: 'general',
      difficulty: 'intermediate',
      questionCount: 5,
      timeLimit: 300,
      selectedLanguages: [],
    },
  });

  // Watch form values for visual feedback
  const selectedCategory = useWatch({ control, name: 'category' });
  const selectedDifficulty = useWatch({ control, name: 'difficulty' });
  const selectedLanguages = watch('selectedLanguages') || [];

  const categories = [
    { value: 'general', label: 'General', description: 'Common interview questions' },
    { value: 'technical', label: 'Technical', description: 'Programming and technical skills' },
    { value: 'behavioral', label: 'Behavioral', description: 'Past experiences and soft skills' },
    { value: 'system-design', label: 'System Design', description: 'Architecture and design questions' },
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', description: 'Entry-level questions' },
    { value: 'intermediate', label: 'Intermediate', description: 'Mid-level questions' },
    { value: 'advanced', label: 'Advanced', description: 'Senior-level questions' },
  ];

  // Language selection handlers
  const handleLanguageToggle = (languageValue) => {
    const currentLanguages = selectedLanguages || [];
    const isSelected = currentLanguages.includes(languageValue);
    
    if (isSelected) {
      setValue('selectedLanguages', currentLanguages.filter(lang => lang !== languageValue));
    } else {
      setValue('selectedLanguages', [...currentLanguages, languageValue]);
    }
  };

  const handleSelectAllInCategory = (categoryKey) => {
    const categoryLanguages = languageCategories[categoryKey]?.languages || [];
    const categoryValues = categoryLanguages.map(lang => lang.value);
    const currentLanguages = selectedLanguages || [];
    
    // Check if all languages in this category are selected
    const allSelected = categoryValues.every(lang => currentLanguages.includes(lang));
    
    if (allSelected) {
      // Deselect all languages in this category
      setValue('selectedLanguages', currentLanguages.filter(lang => !categoryValues.includes(lang)));
    } else {
      // Select all languages in this category
      const newLanguages = [...new Set([...currentLanguages, ...categoryValues])];
      setValue('selectedLanguages', newLanguages);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      // Start new interview session
      dispatch(startNewSession({
        category: data.category,
        difficulty: data.difficulty,
        selectedLanguages: data.selectedLanguages || [],
      }));

      // Generate first AI question
      const result = await dispatch(generateInterviewQuestion({
        category: data.category,
        difficulty: data.difficulty,
        selectedLanguages: data.selectedLanguages || [],
        previousQuestions: [],
      }));

      if (generateInterviewQuestion.fulfilled.match(result)) {
        toast.success('AI question generated successfully!');
        navigate('/interview/session', { 
          state: { 
            setup: {
              ...data,
              questionCount: data.questionCount,
              timeLimit: data.timeLimit,
            }
          } 
        });
      } else {
        toast.error('Failed to generate AI question. Using fallback questions.');
        navigate('/interview/session', { 
          state: { 
            setup: {
              ...data,
              questionCount: data.questionCount,
              timeLimit: data.timeLimit,
            }
          } 
        });
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Error starting interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Set Up Your Interview Practice
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Interview Category
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {categories.map((category) => (
                  <label key={category.value} className="relative">
                    <input
                      {...register('category', { required: 'Please select a category' })}
                      type="radio"
                      value={category.value}
                      className="sr-only"
                    />
                    <div className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedCategory === category.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                        : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}>
                      <div className="flex items-center">
                        <div className="text-sm">
                          <p className={`font-medium ${
                            selectedCategory === category.value ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {category.label}
                          </p>
                          <p className={`${
                            selectedCategory === category.value ? 'text-blue-700' : 'text-gray-500'
                          }`}>
                            {category.description}
                          </p>
                        </div>
                        {selectedCategory === category.value && (
                          <div className="ml-auto">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Difficulty Level
              </label>
              <div className="space-y-3">
                {difficulties.map((difficulty) => (
                  <label key={difficulty.value} className="relative">
                    <input
                      {...register('difficulty', { required: 'Please select a difficulty' })}
                      type="radio"
                      value={difficulty.value}
                      className="sr-only"
                    />
                    <div className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedDifficulty === difficulty.value
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                        : 'border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${
                            selectedDifficulty === difficulty.value ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {difficulty.label}
                          </p>
                          <p className={`${
                            selectedDifficulty === difficulty.value ? 'text-blue-700' : 'text-gray-500'
                          }`}>
                            {difficulty.description}
                          </p>
                        </div>
                        {selectedDifficulty === difficulty.value && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.difficulty && (
                <p className="mt-1 text-sm text-red-600">{errors.difficulty.message}</p>
              )}
            </div>

            {/* Language Selection - Only show for technical category */}
            {selectedCategory === 'technical' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Programming Languages & Technologies
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Choose the languages and technologies you want to be interviewed on. 
                  You can select multiple languages from different categories.
                </p>
                
                <div className="space-y-6">
                  {Object.entries(languageCategories).map(([categoryKey, category]) => (
                    <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                          <p className="text-xs text-gray-500">{category.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSelectAllInCategory(categoryKey)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {category.languages.every(lang => selectedLanguages.includes(lang.value)) 
                            ? 'Deselect All' 
                            : 'Select All'
                          }
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {category.languages.map((language) => (
                          <label
                            key={language.value}
                            className="relative flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLanguages.includes(language.value)}
                              onChange={() => handleLanguageToggle(language.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900">
                                {language.label}
                              </span>
                              <p className="text-xs text-gray-500 truncate" title={language.description}>
                                {language.description}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedLanguages.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Selected:</strong> {selectedLanguages.length} language(s) selected
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedLanguages.map((langValue) => {
                        const lang = Object.values(languageCategories)
                          .flatMap(cat => cat.languages)
                          .find(l => l.value === langValue);
                        return (
                          <span
                            key={langValue}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {lang?.label || langValue}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Question Count */}
            <div>
              <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700">
                Number of Questions
              </label>
              <select
                {...register('questionCount', { required: 'Please select number of questions' })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
              >
                <option value={3}>3 Questions (Quick Practice)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Extended)</option>
                <option value={15}>15 Questions (Comprehensive)</option>
              </select>
              {errors.questionCount && (
                <p className="mt-1 text-sm text-red-600">{errors.questionCount.message}</p>
              )}
            </div>

            {/* Time Limit */}
            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">
                Time Limit per Question
              </label>
              <select
                {...register('timeLimit', { required: 'Please select time limit' })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
              >
                <option value={180}>3 minutes (Quick)</option>
                <option value={300}>5 minutes (Standard)</option>
                <option value={600}>10 minutes (Detailed)</option>
                <option value={0}>No time limit</option>
              </select>
              {errors.timeLimit && (
                <p className="mt-1 text-sm text-red-600">{errors.timeLimit.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Starting...' : 'Start Interview'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InterviewSetup;
