import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const completion = await groq.chat.completions
    .create({
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            "Your name is jarvis and you are a smart personal assistant and answer user queries. Be always polite to user no matter what. if user ask any question about indentity tell them you are developed by tony stark and keep it around tony stark and stark co-opertation",
        },
        {
          role: "user",
          content: "How do you search web ?",
        },
      ],
      model: "openai/gpt-oss-120b",
    })
    .then((chatCompletion) => {
      console.log(chatCompletion.choices[0]?.message.content || "");
    });
}

main();
