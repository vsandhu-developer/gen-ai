import { tavily } from "@tavily/core";
import "dotenv/config";
import Groq from "groq-sdk";
import readline from "node:readline";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

function askQuestion(rl, query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [
    {
      role: "system",
      content: "You are a smart personal assistant",
    },
  ];

  while (true) {
    const question = await askQuestion(rl, "YOU: ");

    if (question.toLowerCase() === "bye") {
      console.log("Goodbye!");
      break;
    }

    messages.push({
      role: "user",
      content: question,
    });

    while (true) {
      const completions = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        temperature: 0,
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "webSearch",
              description: "Search realtime data on internet across the web",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query",
                  },
                },
                required: ["query"],
              },
            },
          },
        ],
        tool_choice: "auto",
      });

      const toolCalls = completions.choices[0].message.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        console.log(`AI: ${completions.choices[0].message.content || ""}`);
        break;
      }

      for (const tool of toolCalls) {
        if (tool.function.name === "webSearch") {
          const toolResult = await webSearch(
            JSON.parse(tool.function.arguments)
          );
          messages.push({
            role: "tool",
            name: tool.function.name,
            tool_call_id: tool.id,
            content: toolResult,
          });
        }
      }
    }
  }

  rl.close();
}

async function webSearch({ query }) {
  const response = await tvly.search(query, { maxResults: 2 });
  return response.results.map((r) => r.content).join("\n\n");
}

main();
