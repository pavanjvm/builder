import "dotenv/config";
import express from "express";
import { OpenAI } from "openai";
import { basePrompt as nodeBasePrompt}  from "./defaults/node.js"
import { basePrompt as reactBasePrompt}  from "./defaults/react.js"
import {BASE_PROMPT, getSystemPrompt} from "./prompts.js"
const client = new OpenAI();
import cors from "cors";

const app = express();
const PORT = 3001;
app.use(cors())
app.use(express.json())

app.post("/template",async(req,res) => {
    const prompt = req.body.prompt;
    const response =  await client.responses.create({
        model: "gpt-5",
        input : [{
            role: "system",
            content : "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
        },{
            role: "user",
            content : prompt
        }]

    })
    const answer = response.output_text
    if (answer == "react"){
        res.json({
            prompts: [BASE_PROMPT,`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts: [reactBasePrompt]
        })
        return;
    
    
    }
    if (answer == "node"){
        res.json({
            prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
            uiPrompts : [nodeBasePrompt]    
        })
        return;

    }
    res.status(403).json({message: "you can aacess this"})
    return;

})

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

app.post("/chat",async(req,res) => {
    const messages: Message[] = [{role:"system", content: getSystemPrompt()}]
    messages.push({role:"user",content : req.body.message})
    const response =  await client.responses.create({
        model : "gpt-5",
        input : messages
    })
    console.log(response.output_text)
    res.json({
        response : response.output_text
    });

})


 app.listen(PORT)

