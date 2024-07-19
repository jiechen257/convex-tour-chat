import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Grab the API key from the set environment variable
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

export const chat = action({
  args: {
    messageBody: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("TOGETHER_API_KEY", TOGETHER_API_KEY)
    const response = await fetch(
      "https://api.together.xyz/v1/chat/completions",
      {
        method: "POST",
        headers: {
          // Set the Authorization header with your API key
          Authorization: `Bearer ${TOGETHER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3-8b-chat-hf",
          messages: [
            {
              // Provide a 'system' message giving context about how to respond
              role: "system",
              content:
                "You are a terse bot in a group chat responding to questions with 1-sentence answers.",
            },
            {
              // Pass on the chat user's message to the AI agent
              role: "user",
              content: args.messageBody,
            },
          ],
        }),
      },
    );

    // Pull the message content out of the response
    const json = await response.json();
    console.log('json---', json)
    const messageContent = json.choices?.length ? json.choices[0].message?.content : '';

    // Send AI's response as a new message
    await ctx.runMutation(api.messages.send, {
      author: "AI",
      body: messageContent || "Sorry, I don't have an answer for that.",
    });
  },
});