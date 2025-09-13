// src/data/languages.js
// Organized language data for technical interviews

export const languageCategories = {
  frontend: {
    name: "Frontend Development",
    description: "Client-side technologies and frameworks",
    languages: [
      { value: "html", label: "HTML", description: "Markup language for web pages" },
      { value: "css", label: "CSS", description: "Styling and layout language" },
      { value: "javascript", label: "JavaScript", description: "Programming language for web interactivity" },
      { value: "typescript", label: "TypeScript", description: "Typed superset of JavaScript" },
      { value: "react", label: "React", description: "JavaScript library for building UIs" },
      { value: "vue", label: "Vue.js", description: "Progressive JavaScript framework" },
      { value: "angular", label: "Angular", description: "TypeScript-based web application framework" },
      { value: "svelte", label: "Svelte", description: "Component framework for building UIs" },
      { value: "nextjs", label: "Next.js", description: "React framework for production" },
      { value: "nuxtjs", label: "Nuxt.js", description: "Vue.js framework for production" },
      { value: "gatsby", label: "Gatsby", description: "React-based static site generator" },
      { value: "sveltekit", label: "SvelteKit", description: "Svelte framework for production" },
    ]
  },
  backend: {
    name: "Backend Development",
    description: "Server-side technologies and frameworks",
    languages: [
      { value: "python", label: "Python", description: "High-level programming language" },
      { value: "java", label: "Java", description: "Object-oriented programming language" },
      { value: "csharp", label: "C#", description: "Microsoft's object-oriented language" },
      { value: "cpp", label: "C++", description: "General-purpose programming language" },
      { value: "c", label: "C", description: "Low-level programming language" },
      { value: "go", label: "Go", description: "Google's programming language" },
      { value: "rust", label: "Rust", description: "Systems programming language" },
      { value: "php", label: "PHP", description: "Server-side scripting language" },
      { value: "ruby", label: "Ruby", description: "Dynamic programming language" },
      { value: "nodejs", label: "Node.js", description: "JavaScript runtime for backend" },
      { value: "django", label: "Django", description: "Python web framework" },
      { value: "flask", label: "Flask", description: "Lightweight Python web framework" },
      { value: "spring", label: "Spring Boot", description: "Java application framework" },
      { value: "express", label: "Express.js", description: "Node.js web framework" },
      { value: "fastapi", label: "FastAPI", description: "Modern Python web framework" },
      { value: "laravel", label: "Laravel", description: "PHP web framework" },
      { value: "rails", label: "Ruby on Rails", description: "Ruby web framework" },
    ]
  },
  database: {
    name: "Database & Data",
    description: "Database technologies and data management",
    languages: [
      { value: "sql", label: "SQL", description: "Structured Query Language" },
      { value: "mysql", label: "MySQL", description: "Relational database management system" },
      { value: "postgresql", label: "PostgreSQL", description: "Advanced relational database" },
      { value: "mongodb", label: "MongoDB", description: "NoSQL document database" },
      { value: "redis", label: "Redis", description: "In-memory data structure store" },
      { value: "elasticsearch", label: "Elasticsearch", description: "Search and analytics engine" },
      { value: "cassandra", label: "Cassandra", description: "Distributed NoSQL database" },
      { value: "dynamodb", label: "DynamoDB", description: "AWS NoSQL database" },
      { value: "sqlite", label: "SQLite", description: "Lightweight SQL database" },
      { value: "oracle", label: "Oracle", description: "Enterprise database system" },
    ]
  },
  mobile: {
    name: "Mobile Development",
    description: "Mobile app development technologies",
    languages: [
      { value: "swift", label: "Swift", description: "Apple's programming language" },
      { value: "kotlin", label: "Kotlin", description: "Android's preferred language" },
      { value: "java_android", label: "Java (Android)", description: "Traditional Android development" },
      { value: "react_native", label: "React Native", description: "Cross-platform mobile framework" },
      { value: "flutter", label: "Flutter", description: "Google's UI toolkit" },
      { value: "xamarin", label: "Xamarin", description: "Microsoft's mobile platform" },
      { value: "ionic", label: "Ionic", description: "Hybrid mobile app framework" },
      { value: "cordova", label: "Apache Cordova", description: "Mobile app development platform" },
    ]
  },
  devops: {
    name: "DevOps & Cloud",
    description: "Infrastructure and deployment technologies",
    languages: [
      { value: "docker", label: "Docker", description: "Containerization platform" },
      { value: "kubernetes", label: "Kubernetes", description: "Container orchestration" },
      { value: "aws", label: "AWS", description: "Amazon Web Services" },
      { value: "azure", label: "Azure", description: "Microsoft's cloud platform" },
      { value: "gcp", label: "Google Cloud", description: "Google Cloud Platform" },
      { value: "terraform", label: "Terraform", description: "Infrastructure as code" },
      { value: "ansible", label: "Ansible", description: "Configuration management" },
      { value: "jenkins", label: "Jenkins", description: "CI/CD automation server" },
      { value: "git", label: "Git", description: "Version control system" },
      { value: "linux", label: "Linux", description: "Operating system" },
      { value: "bash", label: "Bash", description: "Shell scripting language" },
      { value: "powershell", label: "PowerShell", description: "Microsoft's shell" },
    ]
  },
  styling: {
    name: "Styling & Design",
    description: "CSS frameworks and design tools",
    languages: [
      { value: "tailwind", label: "Tailwind CSS", description: "Utility-first CSS framework" },
      { value: "bootstrap", label: "Bootstrap", description: "CSS framework for responsive design" },
      { value: "sass", label: "Sass", description: "CSS preprocessor" },
      { value: "scss", label: "SCSS", description: "Sass syntax with CSS-like formatting" },
      { value: "less", label: "Less", description: "CSS preprocessor" },
      { value: "styled_components", label: "Styled Components", description: "CSS-in-JS library" },
      { value: "emotion", label: "Emotion", description: "CSS-in-JS library" },
      { value: "material_ui", label: "Material-UI", description: "React component library" },
      { value: "chakra_ui", label: "Chakra UI", description: "Modular component library" },
      { value: "antd", label: "Ant Design", description: "Enterprise UI design language" },
    ]
  }
};

// Helper function to get all languages as a flat array
export const getAllLanguages = () => {
  return Object.values(languageCategories).flatMap(category => 
    category.languages.map(lang => ({
      ...lang,
      category: category.name,
      categoryKey: Object.keys(languageCategories).find(key => languageCategories[key] === category)
    }))
  );
};

// Helper function to get languages by category
export const getLanguagesByCategory = (categoryKey) => {
  return languageCategories[categoryKey]?.languages || [];
};

// Helper function to get language by value
export const getLanguageByValue = (value) => {
  return getAllLanguages().find(lang => lang.value === value);
};

// Helper function to get popular languages (commonly used)
export const getPopularLanguages = () => {
  const popularValues = [
    'javascript', 'python', 'java', 'html', 'css', 'react', 'nodejs', 
    'typescript', 'csharp', 'cpp', 'go', 'sql', 'mongodb', 'docker', 'aws'
  ];
  return getAllLanguages().filter(lang => popularValues.includes(lang.value));
};
