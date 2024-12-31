import OpenAI from "openai";

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey:
    "",
  dangerouslyAllowBrowser: true,
});

export const getAIResponse = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // or another model
      messages: [
        {
          role: "system",
          content: "You are a helpful best news reader assistant.",
        },
        { role: "user", content: prompt },
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    throw error; // Rethrow error to handle it in the calling component
  }
};

