import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (genAI) return genAI;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured');
    return null;
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

export function getGeminiModel() {
  const client = getGeminiClient();
  if (!client) return null;
  
  // Use gemini-2.0-flash (latest stable model for v1beta API)
  return client.getGenerativeModel({ model: 'gemini-2.0-flash' });
}

// Check if Gemini is configured
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export default getGeminiModel;