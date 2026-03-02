import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function explainGrammar(question: string, selectedAnswer: string, correctAnswer: string, context: string) {
  const prompt = `
    You are an expert English Grammar Tutor. 
    A student just answered a grammar question.
    
    Question: "${question}"
    Their Answer: "${selectedAnswer}"
    Correct Answer: "${correctAnswer}"
    Context/Topic: "${context}"
    
    Provide a concise, encouraging explanation (max 3 sentences) of why the correct answer is right and why the student's choice might have been wrong. 
    Use a friendly and professional tone.
    Format the output as plain text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining grammar:", error);
    return "Sorry, I couldn't generate an explanation right now. Please check the rule for " + context + ".";
  }
}

export async function generateQuickQuiz(level: string) {
  const prompt = `
    Generate 5 English grammar multiple-choice questions for a ${level} level student.
    Return the response in JSON format matching this schema:
    {
      "questions": [
        {
          "id": "string",
          "text": "string",
          "options": ["string", "string", "string", "string"],
          "correctAnswer": "string",
          "explanation": "string",
          "topic": "string"
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating quiz:", error);
    return null;
  }
}
