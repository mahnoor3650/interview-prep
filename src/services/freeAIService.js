// src/services/freeAIService.js
import axios from "axios";

// Free AI Service using multiple providers
export const freeAIService = {
  // Question generation with multiple free providers
  generateQuestion: async (category = "general", difficulty = "intermediate", previousQuestions = [], selectedLanguages = []) => {
    console.log(`🎯 Generating question for: ${category} - ${difficulty}`, selectedLanguages.length > 0 ? `with languages: ${selectedLanguages.join(', ')}` : '');
    
    const prompt = createQuestionPrompt(category, difficulty, previousQuestions, selectedLanguages);
    console.log("📝 Generated prompt:", prompt);

    // Try different free AI services in order of preference
    const providers = [
      { name: "Groq", fn: generateWithGroq },
      { name: "Together AI", fn: generateWithTogetherAI },
      { name: "OpenAI", fn: generateWithOpenAI },
      { name: "Fallback", fn: () => getFallbackQuestion(category, difficulty) }
    ];

    for (const provider of providers) {
      try {
        console.log(`🤖 Trying ${provider.name}...`);
        const result = await provider.fn(prompt);
        console.log(`✅ ${provider.name} result:`, result);
        return result;
      } catch (error) {
        console.warn(`❌ ${provider.name} failed:`, error.message);
        if (provider.name === "Fallback") {
          // Last resort - return fallback
          return result;
        }
        continue;
      }
    }
  },

  // Response analysis
  analyzeResponse: async (question, userResponse, context = {}) => {
    const prompt = createAnalysisPrompt(question, userResponse, context);
    
    try {
      console.log("🤖 Analyzing response with Groq...");
      const result = await analyzeWithGroq(prompt);
      return result;
    } catch (error) {
      console.warn("❌ Analysis failed, using basic analysis:", error.message);
      return getBasicAnalysis(userResponse);
    }
  },

  // Health check for all services
  healthCheck: async () => {
    const status = {
      groq: { available: false, latency: null },
      togetherAI: { available: false, latency: null },
      openAI: { available: false, latency: null },
    };

    // Test Groq
    try {
      const start = Date.now();
      await testGroqConnection();
      status.groq = {
        available: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      console.warn("Groq health check failed:", error.message);
    }

    // Test Together AI
    try {
      const start = Date.now();
      await testTogetherAIConnection();
      status.togetherAI = {
        available: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      console.warn("Together AI health check failed:", error.message);
    }

    // Test OpenAI
    try {
      const start = Date.now();
      await testOpenAIConnection();
      status.openAI = {
        available: true,
        latency: Date.now() - start,
      };
    } catch (error) {
      console.warn("OpenAI health check failed:", error.message);
    }

    return status;
  },
};

// Groq API (Free tier: 14,400 requests/day)
async function generateWithGroq(prompt) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant", // Fast and free
      messages: [
        {
          role: "system",
          content: "You are an expert interview question generator. Generate high-quality interview questions in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    },
    {
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  const text = response.data.choices[0].message.content;
  return parseQuestionResponse(text);
}

async function analyzeWithGroq(prompt) {
  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an expert interview coach. Analyze interview responses and provide constructive feedback in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    },
    {
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    }
  );

  const text = response.data.choices[0].message.content;
  return parseAnalysisResponse(text);
}

async function testGroqConnection() {
  await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10,
    },
    {
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    }
  );
}

// Together AI (Free tier: 1M tokens/month)
async function generateWithTogetherAI(prompt) {
  const response = await axios.post(
    "https://api.together.xyz/inference",
    {
      model: "meta-llama/Llama-2-7b-chat-hf",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
    },
    {
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  const text = response.data.output.choices[0].text;
  return parseQuestionResponse(text);
}

async function testTogetherAIConnection() {
  await axios.post(
    "https://api.together.xyz/inference",
    {
      model: "meta-llama/Llama-2-7b-chat-hf",
      prompt: "Hello",
      max_tokens: 10,
    },
    {
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    }
  );
}

// OpenAI (Free tier: $5 credits)
async function generateWithOpenAI(prompt) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert interview question generator. Generate high-quality interview questions in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    },
    {
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  const text = response.data.choices[0].message.content;
  return parseQuestionResponse(text);
}

async function testOpenAIConnection() {
  await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 10,
    },
    {
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    }
  );
}

// Prompt templates
function createQuestionPrompt(category, difficulty, previousQuestions, selectedLanguages = []) {
  const prevQuestionsText = previousQuestions.length > 0
    ? `Avoid these previously asked questions: ${previousQuestions
        .slice(-3)
        .map((q) => q.question)
        .join(", ")}`
    : "";

  const languageText = selectedLanguages.length > 0
    ? `Focus specifically on these programming languages and technologies: ${selectedLanguages.join(", ")}. 
Make the question relevant to these specific technologies and ask about concepts, best practices, or implementation details related to them.`
    : "";

  return `Generate a ${difficulty} level interview question for ${category} category. 
Requirements:
- Make it challenging but fair for ${difficulty} level
- Include expected key points in the answer
- Provide difficulty rating 1-10
${prevQuestionsText}
${languageText}

Format your response as JSON:
{
  "question": "Your interview question here",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "expectedKeyPoints": ["point1", "point2", "point3"],
  "timeLimit": 300,
  "difficultyScore": 7,
  "languages": ${JSON.stringify(selectedLanguages)}
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

  return getBasicAnalysis(text);
}

// Fallback functions
function getFallbackQuestion(category, difficulty, selectedLanguages = []) {
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

  let questions = fallbackQuestions[category]?.[difficulty] || fallbackQuestions.general[difficulty];
  
  // If technical category with selected languages, generate language-specific questions
  if (category === 'technical' && selectedLanguages.length > 0) {
    const languageQuestions = generateLanguageSpecificQuestions(selectedLanguages, difficulty);
    questions = [...questions, ...languageQuestions];
  }
  
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
    languages: selectedLanguages,
  };
}

// Generate language-specific questions
function generateLanguageSpecificQuestions(selectedLanguages, difficulty) {
  const languageQuestions = {
    javascript: {
      beginner: [
        "What is the difference between var, let, and const in JavaScript?",
        "Explain what a closure is in JavaScript with an example.",
        "What is the difference between == and === in JavaScript?",
        "How do you handle asynchronous operations in JavaScript?",
        "What is the DOM and how do you manipulate it with JavaScript?"
      ],
      intermediate: [
        "Explain the concept of hoisting in JavaScript.",
        "What are Promises and how do you use them?",
        "Explain the difference between call, apply, and bind methods.",
        "How does JavaScript's event loop work?",
        "What are arrow functions and when would you use them?"
      ],
      advanced: [
        "Explain the concept of prototypal inheritance in JavaScript.",
        "How would you implement a custom Promise from scratch?",
        "What are Web Workers and how do you use them?",
        "Explain memory management and garbage collection in JavaScript.",
        "How would you optimize JavaScript performance in a large application?"
      ]
    },
    python: {
      beginner: [
        "What is the difference between a list and a tuple in Python?",
        "Explain what a dictionary is in Python and how you would use it.",
        "What are Python decorators and how do you use them?",
        "How do you handle exceptions in Python?",
        "What is the difference between a class and an object in Python?"
      ],
      intermediate: [
        "Explain the concept of list comprehensions in Python.",
        "What are generators and how do they differ from regular functions?",
        "Explain the Global Interpreter Lock (GIL) in Python.",
        "How do you implement inheritance in Python?",
        "What are context managers and how do you use them?"
      ],
      advanced: [
        "Explain metaclasses in Python and when you would use them.",
        "How would you implement a custom iterator in Python?",
        "What are Python's memory management features?",
        "Explain the concept of monkey patching in Python.",
        "How would you optimize Python code for performance?"
      ]
    },
    react: {
      beginner: [
        "What is React and what problem does it solve?",
        "Explain the difference between props and state in React.",
        "What is JSX and how does it work?",
        "What are React components and how do you create them?",
        "Explain the concept of virtual DOM in React."
      ],
      intermediate: [
        "What are React hooks and how do you use them?",
        "Explain the component lifecycle in React.",
        "What is the difference between controlled and uncontrolled components?",
        "How do you handle state management in React applications?",
        "What are React keys and why are they important?"
      ],
      advanced: [
        "Explain React's reconciliation algorithm.",
        "How would you implement a custom React hook?",
        "What are React's performance optimization techniques?",
        "Explain the concept of higher-order components in React.",
        "How would you implement server-side rendering with React?"
      ]
    },
    java: {
      beginner: [
        "What is the difference between an interface and an abstract class in Java?",
        "Explain the concept of inheritance in Java.",
        "What are access modifiers in Java and how do you use them?",
        "What is the difference between == and equals() in Java?",
        "Explain what a constructor is in Java."
      ],
      intermediate: [
        "What are generics in Java and how do you use them?",
        "Explain the concept of polymorphism in Java.",
        "What are Java collections and how do you use them?",
        "Explain exception handling in Java.",
        "What is the difference between checked and unchecked exceptions?"
      ],
      advanced: [
        "Explain Java's memory model and garbage collection.",
        "What are Java streams and how do you use them?",
        "Explain the concept of reflection in Java.",
        "How would you implement a custom data structure in Java?",
        "What are Java annotations and how do you create custom ones?"
      ]
    }
  };

  const questions = [];
  selectedLanguages.forEach(lang => {
    const langQuestions = languageQuestions[lang]?.[difficulty] || [];
    questions.push(...langQuestions);
  });

  return questions;
}

function getBasicAnalysis(userResponse) {
  const wordCount = userResponse.split(" ").length;
  const hasExamples = userResponse.toLowerCase().includes("example") || 
                     userResponse.toLowerCase().includes("for instance");
  const hasStructure = userResponse.includes("first") || userResponse.includes("second") || 
                      userResponse.includes("then") || userResponse.includes("finally");
  
  let score = 5;
  if (wordCount > 50) score += 1;
  if (hasExamples) score += 1;
  if (hasStructure) score += 1;
  if (wordCount > 100) score += 1;
  
  return {
    score: Math.min(10, score),
    strengths: [
      wordCount > 50 ? "Good length" : "Concise response",
      hasExamples ? "Includes examples" : "Direct approach",
      hasStructure ? "Well-structured" : "Clear communication"
    ].filter(Boolean),
    improvements: [
      wordCount < 50 ? "Consider adding more detail" : null,
      !hasExamples ? "Try including specific examples" : null,
      !hasStructure ? "Consider organizing your thoughts" : null
    ].filter(Boolean),
    feedback: `Your response is ${wordCount > 50 ? 'detailed' : 'concise'} and ${hasExamples ? 'includes good examples' : 'could benefit from examples'}.`,
    keywordsCovered: [],
    communicationScore: Math.min(10, score),
    technicalScore: Math.min(10, score),
    overallFeedback: "Good effort, keep practicing!",
  };
}
