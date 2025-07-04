var GoogleGenAI = require('@google/genai').GoogleGenAI;
const config = require('../config.json');
const uploadFile = require('./s3');

var ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Sadece görsel oluşturmak için (eski fonksiyon)
async function generateImage(promt) {
    var fail = false;
    try {
        console.log(config.IMG_promt.join("\n").replace("{DATA}", promt),config.IMG_MODEL);
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

// Görsel oluşturup S3'e yüklemek için (yeni fonksiyon)
async function generateAndUploadImage(newsTitle) {
    try {
        // Önce görseli oluştur
        const imageResult = await generateImage(newsTitle);
        
        if (imageResult.error) {
            return {
                error: true,
                message: "Görsel oluşturulamadı"
            };
        }

        // S3'e yükle
        await uploadFile(imageResult.fileName, imageResult.buffer, 'image/jpeg');
        
        // CDN URL'ini oluştur
        const imageUrl = `https://cdn.emailsunucusu.tech/${encodeURIComponent(imageResult.fileName)}`;
        
        return {
            success: true,
            fileName: imageResult.fileName,
            imageUrl: imageUrl
        };
        
    } catch (error) {
        console.error('Görsel oluşturma ve yükleme hatası:', error);
        return {
            error: true,
            message: "Görsel oluşturma veya yükleme sırasında hata oluştu"
        };
    }
}

module.exports = {
    generateImage,
    generateAndUploadImage
};
