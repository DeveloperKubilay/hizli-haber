var GoogleGenAI = require('@google/genai').GoogleGenAI;
const config = require('../config.json');
var mime = require('mime');
const uploadFile = require('./s3');

var ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateImage(promt) {
    var fail = false;
    try {
        console.log(config.IMG_promt.join("\n").replace("{DATA}", promt), config.IMG_MODEL);
        const response = await ai.models.generateContent({
            model: config.IMG_MODEL,
            config: {
                responseModalities: [
                    "TEXT",
                    'IMAGE'
                ],
            },
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: config.IMG_promt.join("\n").replace("{DATA}", promt),
                        },
                    ],
                },
            ]
        })
        let fileData = (response.candidates[0] || []).content?.parts?.[0]?.inlineData;

        if (fileData && fileData.data) {
            const fileExtension = mime.getExtension(fileData.mimeType || '');
            var fileName = 'image_' + Date.now() + '.' + fileExtension;
            var buffer = Buffer.from(fileData.data || '', 'base64');
            return {
                fileName: fileName,
                buffer: buffer
            }
        } else fail = true;
    } catch (e){ fail = true;console.log(e) }
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
