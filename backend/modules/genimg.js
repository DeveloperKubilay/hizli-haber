var GoogleGenAI = require('@google/genai').GoogleGenAI;
const config = require('../config.json');
var ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

module.exports = async function (promt) {
    var fail = false;
    try {
        const response = await ai.models.generateImages({
            model: config.IMG_MODEL,
            prompt: config.IMG_promt.join("\n").replace("{DATA}", promt),
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '4:3',
            },
        })
        if (!response || !response.generatedImages || response.generatedImages.length !== 1 ||
            !response.generatedImages[0] || !response.generatedImages[0].image || !response.generatedImages[0].image.imageBytes) 
            return fail = true;
        


        var fileName = 'image_' + Date.now() + '.jpeg';
        var buffer = Buffer.from(response.generatedImages[0].image.imageBytes || '', 'base64');
        return {
            fileName: fileName,
            buffer: buffer
        }
    } catch { fail = true; }
    if (fail) return {
        error: true
    };
}
