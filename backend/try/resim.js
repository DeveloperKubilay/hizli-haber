// To run this code you need to install the following dependencies:
// npm install @google/genai
// npm install -D @types/node

var GoogleGenAI = require('@google/genai').GoogleGenAI;
var fs = require('fs');

function saveBinaryFile(fileName, content) {
    fs.writeFile(fileName, content, 'utf8', function(err) {
        if (err) {
            console.error('Error writing file ' + fileName + ':', err);
            return;
        }
        console.log('File ' + fileName + ' saved to file system.');
    });
}

require("dotenv").config({ path: "../.env" });

function main() {
    var ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    ai.models.generateImages({
        model: 'models/imagen-4.0-generate-preview-06-06',
        prompt: 'INSERT_INPUT_HERE',
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '4:3',
        },
    }).then(function(response) {
        if (!response || !response.generatedImages) {
            console.error('No images generated.');
            return;
        }

        if (response.generatedImages.length !== 1) {
            console.error('Number of images generated does not match the requested number.');
        }

        for (var i = 0; i < response.generatedImages.length; i++) {
            if (!response.generatedImages[i] || !response.generatedImages[i].image || !response.generatedImages[i].image.imageBytes) {
                continue;
            }
            var fileName = 'image_' + i + '.jpeg';
            var inlineData = response.generatedImages[i].image.imageBytes;
            var buffer = Buffer.from(inlineData || '', 'base64');
            saveBinaryFile(fileName, buffer);
        }
    }).catch(function(err) {
        console.error('Error generating images:', err);
    });
}

main();
