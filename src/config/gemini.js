// const apikey = "AIzaSyBO9yrD0IC-h2hnO_CbOtiRwj8x9VxdaFY"


// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';

async function main(prompt) {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyBO9yrD0IC-h2hnO_CbOtiRwj8x9VxdaFY",
  });
  const tools = [
    {
      googleSearch: {
      }
    },
  ];
  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
    tools,
    responseMimeType: 'text/plain',
  };
  const model = 'gemini-2.5-pro';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fullResponse = '';
  for await (const chunk of response) {
    // console.log(chunk.text);
    fullResponse += chunk.text;
  }
  
  return fullResponse.slice(2,fullResponse.length);
}

export default main;
