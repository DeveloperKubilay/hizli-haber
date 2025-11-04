var GoogleGenAI = require('@google/genai').GoogleGenAI;
const config = require('../config.json');
var mime = require('mime');
const uploadFile = require('./s3');

var ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Yardımcı fonksiyon: Belirli bir model ile görsel oluşturmayı dene
async function tryGenerateImage(model, promt) {
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
        
        let fileData = null;
        const parts = response.candidates?.[0]?.content?.parts || [];
        
        for (const part of parts) {
            if (part.inlineData) {
                fileData = part.inlineData;
                break;
            }
        }
        
        if (fileData && fileData.data) {
            const fileExtension = mime.getExtension(fileData.mimeType || '');
            let fileName = 'image_' + Date.now() + '.' + fileExtension;
            let buffer = Buffer.from(fileData.data || '', 'base64');
            
            console.log(`✅ ${model} ile görsel başarıyla oluşturuldu!`);
            return {
                success: true,
                fileName: fileName,
                buffer: buffer
            };
        } else {
            throw new Error("Görsel data'sı bulunamadı");
        }
        
    } catch (error) {
        console.warn(`⚠️ ${model} başarısız: ${error.message}`);
        
        // Rate limit hatası ise RetryInfo'dan bekleme süresini al
        if (error.status === 429) {
            // Günlük quota tükendi ise bekleme, direkt başarısız dön
            if (error.details) {
                const quotaFailure = error.details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.QuotaFailure');
                if (quotaFailure && quotaFailure.violations) {
                    const dailyQuota = quotaFailure.violations.find(v => v.quotaId.includes('PerDay') && v.quotaValue === '100');
                    if (dailyQuota) {
                        console.log("🚫 Günlük quota tükendi, beklemeye gerek yok, başarısız dönülüyor...");
                        return {
                            success: false,
                            error: error
                        };
                    }
                }
            }
            
            let retryDelay = 10; // varsayılan 10 saniye
            if (error.details) {
                const retryInfo = error.details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                if (retryInfo && retryInfo.retryDelay) {
                    const delayStr = retryInfo.retryDelay;
                    const match = delayStr.match(/(\d+)s/);
                    if (match) {
                        retryDelay = parseInt(match[1]);
                        console.log(`💤 Rate limit! ${retryDelay} saniye bekleniyor...`);
                    } else {
                        console.log("💤 Rate limit! 10 saniye bekleniyor...");
                    }
                } else {
                    console.log("💤 Rate limit! 10 saniye bekleniyor...");
                }
            } else {
                console.log("💤 Rate limit! 10 saniye bekleniyor...");
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
        }
        
        return {
            success: false,
            error: error
        };
    }
}

// Retry sistemi ile görsel oluşturma
async function generateImageWithRetry(promt, maxRetries = config.MaxImgTry || 3) {
    let lastError;
    
    // Önce 2.5 modelini bir kez dene
    const primaryModel = config.IMG_MODEL[0];
    console.log(`🎨 Birincil model ${primaryModel} ile görsel oluşturuluyor...`);
    
    const primaryResult = await tryGenerateImage(primaryModel, promt);
    if (primaryResult.success) {
        return {
            fileName: primaryResult.fileName,
            buffer: primaryResult.buffer
        };
    } else {
        lastError = primaryResult.error;
    }
    
    // 2.5 başarısız olursa, diğer modelleri retry ile dene
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🎨 Diğer modellerle görsel oluşturma denemesi ${attempt}/${maxRetries}...`);
        
        for (let modelIndex = 1; modelIndex < config.IMG_MODEL.length; modelIndex++) {
            const model = config.IMG_MODEL[modelIndex];
            
            const result = await tryGenerateImage(model, promt);
            if (result.success) {
                return {
                    fileName: result.fileName,
                    buffer: result.buffer
                };
            } else {
                lastError = result.error;
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
async function generateAndUploadImage(newsTitle, maxAttempts = 1) {
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

async function generateAndUploadImageFixNews(newsTitle, maxAttempts = 3) {
    const FIXED_MODEL = 'gemini-2.0-flash-preview-image-generation';
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`🎨 Görsel oluşturma ${attempt}/${maxAttempts}. deneme (Model: ${FIXED_MODEL})...`);
            
            const response = await ai.models.generateContent({
                model: FIXED_MODEL,
                config: {
                    responseModalities: ['IMAGE', 'TEXT'],
                    responseMimeType: 'text/plain',
                },
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: newsTitle,
                            },
                        ],
                    },
                ]
            });
            
            let fileData = null;
            const parts = response.candidates?.[0]?.content?.parts || [];
            
            for (const part of parts) {
                if (part.inlineData) {
                    fileData = part.inlineData;
                    break;
                }
            }
            
            if (fileData && fileData.data) {
                const fileExtension = mime.getExtension(fileData.mimeType || '');
                let fileName = 'image_' + Date.now() + '.' + fileExtension;
                let buffer = Buffer.from(fileData.data || '', 'base64');
                
                await uploadFile(fileName, buffer, 'image/jpeg');
                const imageUrl = `https://cdn.xn--hzl-haber-vpbc.com/${encodeURIComponent(fileName)}`;
                
                console.log(`✅ ${attempt}. denemede görsel başarıyla oluşturuldu!`);
                return {
                    success: true,
                    fileName: fileName,
                    imageUrl: imageUrl
                };
            } else {
                throw new Error("Görsel data'sı bulunamadı");
            }
            
        } catch (error) {
            console.error(`💥 ${attempt}. denemede görsel oluşturulamadı`);
            
            if (error.status === 429) {
                if (error.error?.details) {
                    const retryInfo = error.error.details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                    if (retryInfo && retryInfo.retryDelay) {
                        const delayStr = retryInfo.retryDelay;
                        const match = delayStr.match(/(\d+)s/);
                        if (match) {
                            const retryDelay = parseInt(match[1]);
                            console.log(`💤 Rate limit! ${retryDelay} saniye bekleniyor...`);
                            await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
                            if (attempt < maxAttempts) continue;
                        }
                    }
                } else if (error.details) {
                    const retryInfo = error.details.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
                    if (retryInfo && retryInfo.retryDelay) {
                        const delayStr = retryInfo.retryDelay;
                        const match = delayStr.match(/(\d+)s/);
                        if (match) {
                            const retryDelay = parseInt(match[1]);
                            console.log(`💤 Rate limit! ${retryDelay} saniye bekleniyor...`);
                            await new Promise(resolve => setTimeout(resolve, retryDelay * 1000));
                            if (attempt < maxAttempts) continue;
                        }
                    }
                }
                
                console.log(`💤 Rate limit ama delay bulunamadı! 10 saniye bekleniyor...`);
                await new Promise(resolve => setTimeout(resolve, 10000));
                if (attempt < maxAttempts) continue;
            }
            
            if (attempt === maxAttempts) {
                console.log("🚫 Maksimum deneme sayısına ulaşıldı, resimsiz devam ediliyor");
                return {
                    success: false,
                    message: error.message || "Görsel oluşturulamadı"
                };
            }
        }
    }
}

module.exports = {
    generateImage,
    generateAndUploadImage,
    generateAndUploadImageFixNews
};
