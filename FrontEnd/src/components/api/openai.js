import OpenAI from "openai";

// Initialize OpenAI with your API key
const openai = new OpenAI({
  apiKey:
    "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",
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

