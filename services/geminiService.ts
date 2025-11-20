import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const getClient = (): GoogleGenAI => {
  // Always create a new instance to ensure we pick up the injected key from the environment
  // This is critical for the API Key Selection flow to work correctly without refreshing
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please ensure you have selected an API Key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const createChatSession = (contextText: string): Chat => {
  const client = getClient();
  const systemInstruction = `
    You are ThinkInk AI, an intelligent research assistant integrated into a note-taking app.
    
    Your Context:
    The user is viewing a handwritten note that has been converted to text via OCR.
    The text content of the current note is provided below.
    
    Instructions:
    1. Answer questions based primarily on the provided note context.
    2. If the OCR text contains errors (typos, nonsense characters), try to infer the intended meaning or politely mention the ambiguity.
    3. Provide concise summaries, explanations, or study quizzes when asked.
    4. Format your responses using Markdown (bold, lists, code blocks) for readability.
    
    Note Content:
    """
    ${contextText}
    """
  `;

  const chat = client.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
    }
  });

  return chat;
};

export const sendMessageToGemini = async (chat: Chat, message: string): Promise<string> => {
  try {
    const result: GenerateContentResponse = await chat.sendMessage({
      message: message
    });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request. Please check your API key connection.";
  }
};

export const generateTitle = async (text: string): Promise<string> => {
    try {
        const client = getClient();
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a short, concise title (max 5 words) for the following text. Do not use quotes. \n\nText: ${text.substring(0, 500)}`
        });
        return response.text?.trim() || "Untitled Note";
    } catch (e) {
        console.error("Title generation error:", e);
        return "Untitled Note";
    }
}