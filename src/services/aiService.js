// src/services/aiService.js
import axios from "axios";

// Industry Practice: Create axios instances for different AI providers
const hfKey = import.meta.env.VITE_HUGGINGfACE_KEY;
console.log("🔍 Environment check:", {
  hfKey: hfKey ? `${hfKey.substring(0, 8)}...` : 'undefined',
  allEnvKeys: Object.keys(import.meta.env).filter(key => key.includes('HUGGING'))
});

const huggingFaceClient = axios.create({
  baseURL: "https://api-inference.huggingface.co",
  headers: {
    Authorization: `Bearer ${hfKey}`,
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout for AI responses
});

const googleAIClient = axios.create({
  baseURL: "https://generativelanguage.googleapis.com/v1",
  timeout: 30000,
});

// Performance: Rate limiting and caching
class RateLimiter {
  constructor(maxRequests = 30, windowMs = 60000) {
    // 30 requests per minute
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Remove old requests outside the window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    return this.requests.length < this.maxRequests;
  }

  recordRequest() {
    this.requests.push(Date.now());
  }

  getTimeUntilReset() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.windowMs - (Date.now() - oldestRequest));
  }
}

// Performance: Simple cache implementation
class AICache {
  constructor(maxSize = 100, ttl = 300000) {
    // 5 minute TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  generateKey(input) {
    // Create a simple hash of the input
    return btoa(JSON.stringify(input))
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 32);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clear() {
    this.cache.clear();
  }
}

// Initialize rate limiters and cache
const huggingFaceRateLimit = new RateLimiter(25, 60000); // 25 requests per minute
const googleAIRateLimit = new RateLimiter(50, 60000); // 50 requests per minute
const aiCache = new AICache();

// Industry Practice: AI Service with error handling and fallbacks
export const aiService = {
  // Question generation with multiple providers and fallback
  generateQuestion: async (
    category = "general",
    difficulty = "intermediate",
    previousQuestions = []
  ) => {
    console.log(`🎯 Generating question for: ${category} - ${difficulty}`);
    
    const cacheKey = aiCache.generateKey({
      type: "question",
      category,
      difficulty,
      previousCount: previousQuestions.length,
    });

    // Performance: Check cache first
    const cached = aiCache.get(cacheKey);
    if (cached) {
      console.log("Using cached question");
      return cached;
    }

    const prompt = createQuestionPrompt(
      category,
      difficulty,
      previousQuestions
    );
    
    console.log("📝 Generated prompt:", prompt);

    try {
      // Try Hugging Face first (more reliable free tier)
      if (huggingFaceRateLimit.canMakeRequest()) {
        console.log("🤖 Trying Hugging Face...");
        huggingFaceRateLimit.recordRequest();
        const result = await generateWithHuggingFace(prompt);
        console.log("✅ Hugging Face result:", result);
        aiCache.set(cacheKey, result);
        return result;
      } else {
        console.log("⏰ Hugging Face rate limited");
      }

      // Fallback to Google AI (if available)
      if (googleAIRateLimit.canMakeRequest()) {
        console.log("🤖 Trying Google AI...");
        googleAIRateLimit.recordRequest();
        const result = await generateWithGoogleAI(prompt);
        console.log("✅ Google AI result:", result);
        aiCache.set(cacheKey, result);
        return result;
      } else {
        console.log("⏰ Google AI rate limited");
      }

      // If both rate limited, return a fallback question
      console.warn("⚠️ AI services rate limited, using fallback question");
      const fallback = getFallbackQuestion(category, difficulty);
      console.log("🔄 Fallback question:", fallback);
      return fallback;
    } catch (error) {
      console.error("❌ Error generating question:", error);

      // Try the other service if one fails
      try {
        if (huggingFaceRateLimit.canMakeRequest()) {
          console.log("🔄 Retrying with Hugging Face...");
          huggingFaceRateLimit.recordRequest();
          const result = await generateWithHuggingFace(prompt);
          console.log("✅ Hugging Face retry result:", result);
          aiCache.set(cacheKey, result);
          return result;
        }
      } catch (retryError) {
        console.error("❌ Retry also failed:", retryError);
      }

      // Return fallback question on error
      const fallback = getFallbackQuestion(category, difficulty);
      console.log("🔄 Error fallback question:", fallback);
      return fallback;
    }
  },

  // Response analysis with AI feedback
  analyzeResponse: async (question, userResponse, context = {}) => {
    const cacheKey = aiCache.generateKey({
      type: "analysis",
      question,
      response: userResponse.substring(0, 100), // First 100 chars for cache key
    });

    const cached = aiCache.get(cacheKey);
    if (cached) {
      console.log("Using cached analysis");
      return cached;
    }

    const prompt = createAnalysisPrompt(question, userResponse, context);

    try {
      let result;

      // Try Google AI first for analysis (better at structured output)
      if (googleAIRateLimit.canMakeRequest()) {
        googleAIRateLimit.recordRequest();
        result = await analyzeWithGoogleAI(prompt);
      } else if (huggingFaceRateLimit.canMakeRequest()) {
        huggingFaceRateLimit.recordRequest();
        result = await analyzeWithHuggingFace(prompt);
      } else {
        // Fallback to basic analysis
        result = getBasicAnalysis(userResponse);
      }

      aiCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error("Error analyzing response:", error);
      return getBasicAnalysis(userResponse);
    }
  },

  // Utility functions
  clearCache: () => {
    aiCache.clear();
  },

  getRateLimitStatus: () => {
    return {
      huggingFace: {
        canMakeRequest: huggingFaceRateLimit.canMakeRequest(),
        timeUntilReset: huggingFaceRateLimit.getTimeUntilReset(),
      },
      googleAI: {
        canMakeRequest: googleAIRateLimit.canMakeRequest(),
        timeUntilReset: googleAIRateLimit.getTimeUntilReset(),
      },
    };
  },

  // Health check
  healthCheck: async () => {
    const status = {
      huggingFace: { available: false, latency: null },
      googleAI: { available: false, latency: null },
    };

    // Test Hugging Face
    try {
      const start = Date.now();
      await huggingFaceClient.get("/models/gpt2", { timeout: 5000 });
      status.huggingFace = {
        available: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      console.warn("Hugging Face health check failed:", error.message);
    }

    // Test Google AI (simple model list call)
    try {
      const start = Date.now();
      const response = await googleAIClient.get(`/models?key=${import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY}`, {
        timeout: 5000,
      });
      console.log("📋 Available Google AI models:", response.data);
      status.googleAI = {
        available: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      console.warn("Google AI health check failed:", error.message);
      console.warn("Google AI error details:", error.response?.data);
    }

    return status;
  },
};

// Helper functions for AI providers
async function generateWithGoogleAI(prompt) {
  try {
    console.log("🔑 Google AI Key available:", !!import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY);
    console.log("📡 Making Google AI request...");
    
    const response = await googleAIClient.post(
      `/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 200,
        },
      }
    );

    console.log("📥 Google AI response:", response.data);
    
    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No content generated");

    console.log("📝 Google AI text:", text);
    const parsed = parseQuestionResponse(text);
    console.log("🔍 Parsed result:", parsed);
    return parsed;
  } catch (error) {
    console.error("❌ Google AI generation failed:", error);
    console.error("❌ Error details:", error.response?.data || error.message);
    throw error;
  }
}

async function generateWithHuggingFace(prompt) {
  const models = [
    {
      name: "microsoft/DialoGPT-medium",
      parameters: {
        max_new_tokens: 200,
        temperature: 0.8,
        do_sample: true,
        pad_token_id: 50256,
      }
    },
    {
      name: "gpt2",
      parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        do_sample: true,
        pad_token_id: 50256,
      }
    },
    {
      name: "facebook/blenderbot-400M-distill",
      parameters: {
        max_new_tokens: 100,
        temperature: 0.6,
        do_sample: true,
      }
    }
  ];

  for (const model of models) {
    try {
      const hfKey = import.meta.env.VITE_HUGGINGfACE_KEY;
      console.log(`🔑 Hugging Face Key available:`, !!hfKey);
      console.log(`🔑 Key preview:`, hfKey ? `${hfKey.substring(0, 8)}...` : 'undefined');
      console.log(`📡 Trying Hugging Face model: ${model.name}`);
      
      const response = await huggingFaceClient.post(
        `/models/${model.name}`,
        {
          inputs: prompt,
          parameters: model.parameters,
        }
      );

      console.log("📥 Hugging Face response:", response.data);
      
      const text = response.data[0]?.generated_text || response.data.generated_text;
      if (!text) throw new Error("No content generated");

      console.log("📝 Hugging Face text:", text);
      const parsed = parseQuestionResponse(text);
      console.log("🔍 Parsed result:", parsed);
      return parsed;
    } catch (error) {
      console.warn(`❌ Model ${model.name} failed:`, error.message);
      if (model === models[models.length - 1]) {
        // Last model failed, throw the error
        console.error("❌ All Hugging Face models failed");
        throw error;
      }
      // Try next model
      continue;
    }
  }
}

async function analyzeWithGoogleAI(prompt) {
  try {
    const response = await googleAIClient.post(
      `/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent analysis
          maxOutputTokens: 300,
        },
      }
    );

    const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No analysis generated");

    return parseAnalysisResponse(text);
  } catch (error) {
    console.error("Google AI analysis failed:", error);
    throw error;
  }
}

async function analyzeWithHuggingFace(prompt) {
  try {
    const response = await huggingFaceClient.post(
      "/models/google/flan-t5-large",
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.3,
        },
      }
    );

    const text =
      response.data[0]?.generated_text || response.data.generated_text;
    if (!text) throw new Error("No analysis generated");

    return parseAnalysisResponse(text);
  } catch (error) {
    console.error("Hugging Face analysis failed:", error);
    throw error;
  }
}

// Prompt templates
function createQuestionPrompt(category, difficulty, previousQuestions) {
  const prevQuestionsText =
    previousQuestions.length > 0
      ? `Avoid these previously asked questions: ${previousQuestions
          .slice(-3)
          .map((q) => q.question)
          .join(", ")}`
      : "";

  return `Generate a ${difficulty} level interview question for ${category} category. 
Requirements:
- Make it challenging but fair for ${difficulty} level
- Include expected key points in the answer
- Provide difficulty rating 1-10
${prevQuestionsText}

Format your response as JSON:
{
  "question": "Your interview question here",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "expectedKeyPoints": ["point1", "point2", "point3"],
  "timeLimit": 300,
  "difficultyScore": 7
}`;
}

function createAnalysisPrompt(question, userResponse, context) {
  return `Analyze this interview response and provide constructive feedback.

Question: ${question}
Response: ${userResponse}

Provide analysis in JSON format:
{
  "score": 8,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "feedback": "Detailed constructive feedback here",
  "keywordsCovered": ["keyword1", "keyword2"],
  "communicationScore": 7,
  "technicalScore": 8,
  "overallFeedback": "Brief overall assessment"
}`;
}

// Response parsers
function parseQuestionResponse(text) {
  console.log("🔍 Parsing question response:", text);
  
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      console.log("📋 Found JSON match:", jsonMatch[0]);
      const parsed = JSON.parse(jsonMatch[0]);
      console.log("✅ Successfully parsed JSON:", parsed);
      return parsed;
    } else {
      console.log("❌ No JSON found in response");
    }
  } catch (error) {
    console.warn("❌ Failed to parse JSON response:", error.message);
  }

  // Fallback parsing
  console.log("🔄 Using fallback parsing");
  const fallback = {
    question: text.split("\n")[0] || text,
    category: "general",
    difficulty: "intermediate",
    expectedKeyPoints: [],
    timeLimit: 300,
    difficultyScore: 5,
  };
  console.log("🔄 Fallback result:", fallback);
  return fallback;
}

function parseAnalysisResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.warn("Failed to parse analysis JSON, using fallback");
  }

  // Fallback analysis
  return {
    score: 6,
    strengths: ["Attempted to answer the question"],
    improvements: ["Could provide more specific examples"],
    feedback: text.substring(0, 200),
    keywordsCovered: [],
    communicationScore: 6,
    technicalScore: 6,
    overallFeedback: "Good effort, keep practicing!",
  };
}

// Fallback functions
function getFallbackQuestion(category, difficulty) {
  const fallbackQuestions = {
    general: {
      beginner: [
        "Tell me about yourself and why you're interested in this role.",
        "What are your greatest strengths and how do they apply to this position?",
        "Why do you want to work for our company?",
        "Where do you see yourself in 5 years?",
        "What motivates you in your work?"
      ],
      intermediate: [
        "Describe a challenging project you worked on and how you overcame obstacles.",
        "Tell me about a time when you had to learn something new quickly.",
        "How do you handle competing priorities and deadlines?",
        "Describe a situation where you had to work with a difficult team member.",
        "What's the most interesting project you've worked on recently?"
      ],
      advanced: [
        "How do you approach leading a team through a complex, high-pressure situation?",
        "Describe a time when you had to make a difficult decision that affected your team.",
        "How do you stay current with industry trends and technologies?",
        "Tell me about a time when you had to influence stakeholders without direct authority.",
        "What strategies do you use to mentor and develop junior team members?"
      ],
    },
    technical: {
      beginner: [
        "What is the difference between HTML and CSS?",
        "Explain what a variable is in programming.",
        "What is the difference between frontend and backend development?",
        "Can you explain what a database is and why we use them?",
        "What is version control and why is it important?"
      ],
      intermediate: [
        "Explain the concept of closures in JavaScript with an example.",
        "How would you optimize a slow-loading website?",
        "What is the difference between SQL and NoSQL databases?",
        "Explain the concept of RESTful APIs.",
        "How do you handle errors in your code?"
      ],
      advanced: [
        "Design a scalable system architecture for a social media platform.",
        "How would you implement a distributed caching system?",
        "Explain microservices architecture and its trade-offs.",
        "How would you handle a database that's growing at 1TB per day?",
        "Design a real-time chat application with millions of users."
      ],
    },
    behavioral: {
      beginner: [
        "Describe a time when you had to work with a difficult team member.",
        "Tell me about a time when you made a mistake and how you handled it.",
        "Describe a situation where you had to ask for help.",
        "Tell me about a time when you had to adapt to change.",
        "Describe a time when you went above and beyond for a customer or colleague."
      ],
      intermediate: [
        "Tell me about a time you had to make a decision with incomplete information.",
        "Describe a situation where you had to give difficult feedback to a colleague.",
        "Tell me about a time when you had to learn a new skill quickly.",
        "Describe a project where you had to coordinate with multiple teams.",
        "Tell me about a time when you had to persuade someone to see your point of view."
      ],
      advanced: [
        "Describe a situation where you had to influence others without authority.",
        "Tell me about a time when you had to make an unpopular decision.",
        "Describe how you would handle a team member who consistently underperforms.",
        "Tell me about a time when you had to manage a crisis or emergency situation.",
        "Describe a situation where you had to balance business needs with technical constraints."
      ],
    },
  };

  const questions = fallbackQuestions[category]?.[difficulty] || fallbackQuestions.general[difficulty];
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  return {
    question: randomQuestion,
    category,
    difficulty,
    expectedKeyPoints: [
      "Clear communication",
      "Specific examples",
      "Problem-solving approach",
    ],
    timeLimit: 300,
    difficultyScore:
      difficulty === "beginner" ? 3 : difficulty === "intermediate" ? 6 : 8,
  };
}

function getBasicAnalysis(userResponse) {
  const wordCount = userResponse.split(" ").length;
  const hasExamples =
    userResponse.toLowerCase().includes("example") ||
    userResponse.toLowerCase().includes("for instance");

  let score = 5; // Base score

  if (wordCount > 50) score += 1;
  if (wordCount > 100) score += 1;
  if (hasExamples) score += 1;
  if (userResponse.length > 200) score += 1;

  return {
    score: Math.min(score, 10),
    strengths:
      wordCount > 75
        ? ["Detailed response", "Good length"]
        : ["Attempted to answer"],
    improvements:
      wordCount < 50
        ? ["Provide more detail", "Add specific examples"]
        : ["Consider adding more examples"],
    feedback: `Your response was ${
      wordCount > 75 ? "well-detailed" : "brief"
    }. ${
      hasExamples
        ? "Good use of examples."
        : "Consider adding specific examples."
    }`,
    keywordsCovered: [],
    communicationScore: Math.min(score, 8),
    technicalScore: Math.min(score, 8),
    overallFeedback:
      score >= 7
        ? "Good response!"
        : "Keep practicing to improve your answers.",
  };
}
