# Free AI Services Setup Guide

This app now uses multiple free AI services for generating interview questions. Here's how to set them up:

## 🚀 **Recommended: Groq (Easiest & Most Reliable)**

1. **Sign up**: Go to [console.groq.com](https://console.groq.com)
2. **Get API Key**: Create a new API key
3. **Add to .env**: `VITE_GROQ_API_KEY=your_key_here`
4. **Free Tier**: 14,400 requests/day (more than enough!)

## 🔄 **Alternative: Together AI**

1. **Sign up**: Go to [together.ai](https://together.ai)
2. **Get API Key**: Create a new API key
3. **Add to .env**: `VITE_TOGETHER_API_KEY=your_key_here`
4. **Free Tier**: 1M tokens/month

## 💰 **Backup: OpenAI**

1. **Sign up**: Go to [platform.openai.com](https://platform.openai.com)
2. **Add $5 credit**: Get free credits
3. **Get API Key**: Create a new API key
4. **Add to .env**: `VITE_OPENAI_API_KEY=your_key_here`

## 📝 **Your .env file should look like:**

```env
# Groq (Recommended)
VITE_GROQ_API_KEY=your_groq_key_here

# Together AI (Optional)
VITE_TOGETHER_API_KEY=your_together_key_here

# OpenAI (Optional)
VITE_OPENAI_API_KEY=your_openai_key_here

# Existing keys
VITE_GOOGLE_AI_STUDIO_KEY=your_google_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## 🎯 **How It Works:**

1. **Tries Groq first** (fastest & most reliable)
2. **Falls back to Together AI** if Groq fails
3. **Falls back to OpenAI** if Together AI fails
4. **Uses random fallback questions** if all APIs fail

## ✅ **Benefits:**

- **No rate limits** with Groq
- **High quality** AI-generated questions
- **Multiple fallbacks** for reliability
- **Completely free** to use
- **Fast responses** (Groq is very fast)

## 🧪 **Test It:**

1. Add at least one API key to your `.env` file
2. Restart your dev server: `npm run dev`
3. Go to `/test` to test the APIs
4. Start an interview to see it in action!

**Start with Groq - it's the easiest and most reliable option!**
