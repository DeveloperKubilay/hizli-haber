const config = require('../config.json');
const uploadFile = require('./s3');

// Cloudflare Workers AI ile görsel oluştur
async function runCloudflare(model, prompt) {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || config.CLOUDFLARE_ACCOUNT_ID;
    const apiKey = process.env.CLOUDFLARE_API_KEY;

    if (!accountId || !apiKey) {
        throw new Error("CLOUDFLARE_ACCOUNT_ID veya CLOUDFLARE_API_KEY bulunamadı!");
    }

    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({ prompt }),
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare API hatası: ${response.status} - ${errorText}`);
    }

    const result = await response.arrayBuffer();
    return Buffer.from(result);
}

// Yardımcı fonksiyon: Belirli bir model ile görsel oluşturmayı dene
async function tryGenerateImage(model, promt) {
    try {
        console.log(`🤖 ${model} ile görsel oluşturuluyor...`);

        // Cloudflare Workers AI kullan
        const imageBuffer = await runCloudflare(model, promt);

        if (imageBuffer && imageBuffer.length > 0) {
            let fileName = 'image_' + Date.now() + '.png';

            console.log(`✅ ${model} ile görsel başarıyla oluşturuldu!`);
            return {
                success: true,
                fileName: fileName,
                buffer: imageBuffer
            };
        } else {
            throw new Error("Görsel data'sı bulunamadı");
        }

    } catch (error) {
        console.warn(`⚠️ ${model} başarısız: ${error.message}`);

        // Rate limit hatası için bekleme
        if (error.message.includes('429') || error.message.includes('rate limit')) {
            console.log("💤 Rate limit! 10 saniye bekleniyor...");
            await new Promise(resolve => setTimeout(resolve, 10000));
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

    // Prompt'u daha iyi hale getir (Cloudflare için optimize et)
    const optimizedPrompt = config.IMG_promt.join("\n").replace("{DATA}", promt);

    // Önce birincil modeli bir kez dene
    const primaryModel = config.IMG_MODEL[0];
    console.log(`🎨 Birincil model ${primaryModel} ile görsel oluşturuluyor...`);

    const primaryResult = await tryGenerateImage(primaryModel, optimizedPrompt);
    if (primaryResult.success) {
        return {
            fileName: primaryResult.fileName,
            buffer: primaryResult.buffer
        };
    } else {
        lastError = primaryResult.error;
    }

    // Birincil model başarısız olursa, diğer modelleri retry ile dene
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🎨 Diğer modellerle görsel oluşturma denemesi ${attempt}/${maxRetries}...`);

        for (let modelIndex = 1; modelIndex < config.IMG_MODEL.length; modelIndex++) {
            const model = config.IMG_MODEL[modelIndex];

            const result = await tryGenerateImage(model, optimizedPrompt);
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

            // S3'e yükle (Cloudflare PNG döndürür)
            await uploadFile(imageResult.fileName, imageResult.buffer, 'image/png');

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
    // Cloudflare modellerini kullan
    const FIXED_MODEL = config.IMG_MODEL[0] || '@cf/stabilityai/stable-diffusion-xl-base-1.0';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`🎨 Görsel oluşturma ${attempt}/${maxAttempts}. deneme (Model: ${FIXED_MODEL})...`);

            // Cloudflare API ile görsel oluştur
            const imageBuffer = await runCloudflare(FIXED_MODEL, newsTitle);

            if (imageBuffer && imageBuffer.length > 0) {
                let fileName = 'image_' + Date.now() + '.png';

                await uploadFile(fileName, imageBuffer, 'image/png');
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
            console.error(`💥 ${attempt}. denemede görsel oluşturulamadı: ${error.message}`);

            // Rate limit kontrolü
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                console.log(`💤 Rate limit! 10 saniye bekleniyor...`);
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
