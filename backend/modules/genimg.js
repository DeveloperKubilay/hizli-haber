var GoogleGenAI = require('@google/genai').GoogleGenAI;
const { PersonGeneration } = require('@google/genai');
const config = require('../config.json');
const uploadFile = require('./s3');

var ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Retry sistemi ile görsel oluşturma (Yeni Imagen API)
async function generateImageWithRetry(promt, maxRetries = 5) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🎨 Görsel oluşturma denemesi ${attempt}/${maxRetries}...`);
        
        for (let modelIndex = 0; modelIndex < config.IMG_MODEL.length; modelIndex++) {
            const model = config.IMG_MODEL[modelIndex];
            
            try {
                console.log(`🤖 ${model} ile görsel oluşturuluyor...`);
                
                const response = await ai.models.generateImages({
                    model: model,
                    prompt: config.IMG_promt.join("\n").replace("{DATA}", promt),
                    config: {
                        numberOfImages: 1,
                        aspectRatio: '16:9',
                        personGeneration: PersonGeneration.ALLOW_ADULT,
                        outputMimeType: 'image/jpeg',
                        includeRaiReason: true,
                    },
                });

                if (response?.generatedImages && response.generatedImages.length > 0) {
                    const generatedImage = response.generatedImages[0];
                    
                    if (generatedImage.image?.imageBytes) {
                        var fileName = 'image_' + Date.now() + '.jpeg';
                        var buffer = Buffer.from(generatedImage.image.imageBytes, 'base64');
                        
                        console.log(`✅ ${model} ile görsel başarıyla oluşturuldu!`);
                        return {
                            fileName: fileName,
                            buffer: buffer
                        };
                    } else if (generatedImage.raiFilteredReason) {
                        throw new Error(`İçerik filtrelendi: ${generatedImage.raiFilteredReason}`);
                    } else {
                        throw new Error("Görsel data'sı bulunamadı");
                    }
                } else {
                    throw new Error("Görsel oluşturulamadı");
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
        const imageUrl = `https://cdn.xn--hzl-haber-vpbc.com/${encodeURIComponent(imageResult.fileName)}`;

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
