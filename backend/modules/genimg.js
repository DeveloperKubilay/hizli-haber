var GoogleGenAI = require('@google/genai').GoogleGenAI;
const config = require('../config.json');
var mime = require('mime');
const uploadFile = require('./s3');

var ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Retry sistemi ile görsel oluşturma
async function generateImageWithRetry(promt, maxRetries = 5) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🎨 Görsel oluşturma denemesi ${attempt}/${maxRetries}...`);
        
        for (let modelIndex = 0; modelIndex < config.IMG_MODEL.length; modelIndex++) {
            const model = config.IMG_MODEL[modelIndex];
            
            try {
                console.log(`🤖 ${model} ile görsel oluşturuluyor...`);
                
                const response = await ai.models.generateContent({
                    model: model,
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
                });
                
                let fileData = (response.candidates[0] || []).content?.parts?.[0]?.inlineData;

                if (fileData && fileData.data) {
                    const fileExtension = mime.getExtension(fileData.mimeType || '');
                    var fileName = 'image_' + Date.now() + '.' + fileExtension;
                    var buffer = Buffer.from(fileData.data || '', 'base64');
                    
                    console.log(`✅ ${model} ile görsel başarıyla oluşturuldu!`);
                    return {
                        fileName: fileName,
                        buffer: buffer
                    };
                } else {
                    throw new Error("Görsel data'sı bulunamadı");
                }
                
            } catch (error) {
                lastError = error;
                console.warn(`⚠️ ${model} başarısız: ${error.message}`);
                
                // Rate limit hatası ise biraz bekle
                if (error.status === 429) {
                    console.log("💤 Rate limit! 10 saniye bekleniyor...");
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            }
        }
        
        if (attempt < maxRetries) {
            console.log(`⏳ ${attempt}. deneme başarısız, 5 saniye bekleyip tekrar deneniyor...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    
    console.error(`💥 ${maxRetries} deneme sonrası görsel oluşturulamadı!`);
    return { error: true, message: lastError?.message || "Bilinmeyen hata" };
}

async function generateImage(promt) {
    return await generateImageWithRetry(promt);
}

// Görsel oluşturup S3'e yüklemek için (yeni fonksiyon)
async function generateAndUploadImage(newsTitle, maxAttempts = 2) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`🎨 Görsel oluşturma ${attempt}/${maxAttempts}. deneme...`);
            
            // Önce görseli oluştur
            const imageResult = await generateImage(newsTitle);

            if (imageResult.error) {
                console.warn(`⚠️ ${attempt}. denemede görsel oluşturulamadı: ${imageResult.message}`);
                if (attempt === maxAttempts) {
                    console.log("🚫 Maksimum deneme sayısına ulaşıldı, resimsiz devam ediliyor");
                    return {
                        success: false,
                        message: "Görsel oluşturulamadı, resimsiz devam ediliyor"
                    };
                }
                continue;
            }

            // S3'e yükle
            await uploadFile(imageResult.fileName, imageResult.buffer, 'image/jpeg');

            // CDN URL'ini oluştur
            const imageUrl = `https://cdn.xn--hzl-haber-vpbc.com/${encodeURIComponent(imageResult.fileName)}`;

            console.log(`✅ ${attempt}. denemede görsel başarıyla oluşturuldu!`);
            return {
                success: true,
                fileName: imageResult.fileName,
                imageUrl: imageUrl
            };

        } catch (error) {
            console.error(`💥 ${attempt}. denemede hata:`, error.message);
            if (attempt === maxAttempts) {
                console.log("🚫 Tüm denemeler başarısız, resimsiz devam ediliyor");
                return {
                    success: false,
                    message: "Görsel oluşturma başarısız, resimsiz devam ediliyor"
                };
            }
        }
    }
}

module.exports = {
    generateImage,
    generateAndUploadImage
};
