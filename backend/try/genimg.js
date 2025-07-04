// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

var GoogleGenAI = require('@google/genai').GoogleGenAI;
var mime = require('mime');
var writeFile = require('fs').writeFile;
require("dotenv").config({ path: "../.env" });

function saveBinaryFile(fileName, content) {
  writeFile(fileName, content, 'utf8', (err) => {
    if (err) {
      console.error(`Error writing file ${fileName}:`, err);
      return;
    }
    console.log(`File ${fileName} saved to file system.`);
  });
}

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    responseModalities: [
        'IMAGE',
        'TEXT',
    ],
    responseMimeType: 'text/plain',
  };
  const model = 'gemini-2.0-flash-preview-image-generation';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `🤯📱 Samsung Yine Şaşırttı! Galaxy S26 Ultra'da BÜYÜK Hayal Kırıklığı mı Var? 😱🔋📸`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  let fileIndex = 0;
  for (const candidate of response.candidates || []) {
    if (candidate.content?.parts?.[0]?.inlineData) {
      const fileName = `ENTER_FILE_NAME_${fileIndex++}`;
      const inlineData = candidate.content.parts[0].inlineData;
      const fileExtension = mime.getExtension(inlineData.mimeType || '');
      const buffer = Buffer.from(inlineData.data || '', 'base64');
      saveBinaryFile(`${fileName}.${fileExtension}`, buffer);
    } else {
      console.log(candidate.text);
    }
  }
}

main();
