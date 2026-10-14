const config = require('../config.json');
const uploadFile = require('./s3');

// Yeni nesil yüksek kaliteli görsel üretim servisi
async function callImageApi(model, promptText) {
    const apiUrl = (process.env.AI_API_URL || "https://ai.randdcodes.com/v1").replace(/\/+$/, '');
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

    const headers = {
        "Content-Type": "application/json"
    };

    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }
    if (process.env.CF_ACCESS_CLIENT_ID) {
        headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
    }
    if (process.env.CF_ACCESS_CLIENT_SECRET) {
        headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
    }

    const response = await fetch(`${apiUrl}/images/generations`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            model: model || "ag/gemini-3.1-flash-image",
            prompt: promptText,
            n: 1,
            size: "auto",
            quality: "auto",
            background: "auto",
            image_detail: "high",
            output_format: "png"
        }),
        signal: AbortSignal.timeout(60000)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Görsel API hatası [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
        throw new Error("Görsel yanıtında b64_json verisi bulunamadı!");
    }

    return Buffer.from(data.data[0].b64_json, "base64");
}

// Belirli bir model ile görsel oluşturmayı dene
async function tryGenerateImage(model, promptText) {
    try {
        console.log(`🤖 ${model} ile görsel oluşturuluyor...`);
        const imageBuffer = await callImageApi(model, promptText);

        if (imageBuffer && imageBuffer.length > 0) {
            const fileName = 'image_' + Date.now() + '.png';
            console.log(`✅ ${model} ile görsel başarıyla oluşturuldu (${imageBuffer.length} bayt)!`);
            return {
                success: true,
                fileName: fileName,
                buffer: imageBuffer
            };
        } else {
            throw new Error("Oluşturulan görsel verisi boş!");
        }
    } catch (error) {
        console.warn(`⚠️ ${model} görsel oluşturma hatası: ${error.message}`);
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

// Retry mekanizmalı görsel oluşturma
async function generateImageWithRetry(promptData, maxRetries = config.MaxImgTry || 2) {
    let lastError;
    const promptTemplate = (config.IMG_promt && config.IMG_promt.length > 0)
        ? config.IMG_promt.join("\n")
        : "Editorial photojournalism press photo for: {DATA}. Realistic, 4k, natural lighting.";
    
    const optimizedPrompt = promptTemplate.replace("{DATA}", promptData);
    const models = config.IMG_MODEL || ["ag/gemini-3.1-flash-image"];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🎨 Görsel oluşturma denemesi ${attempt}/${maxRetries}...`);
        for (const model of models) {
            const result = await tryGenerateImage(model, optimizedPrompt);
            if (result.success) {
                return {
                    fileName: result.fileName,
                    buffer: result.buffer
                };
            }
            lastError = result.error;
        }

        if (attempt < maxRetries) {
            console.log(`⏳ ${attempt}. deneme başarısız, 5 saniye bekleniyor...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }

    return { error: true, message: lastError?.message || "Görsel oluşturulamadı" };
}

async function generateImage(promptData) {
    return await generateImageWithRetry(promptData);
}

// Görsel oluşturup Cloudflare R2 / S3'e yükleme
async function generateAndUploadImage(newsTitle, maxAttempts = 1) {
    const cdnBase = process.env.CDN_URL || "https://cdn.xn--hzl-haber-vpbc.com";

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`🎨 Görsel oluşturma ve yükleme ${attempt}/${maxAttempts}...`);
            const imageResult = await generateImage(newsTitle);

            if (imageResult.error) {
                console.warn(`⚠️ Görsel oluşturulamadı: ${imageResult.message}`);
                return {
                    success: false,
                    message: imageResult.message
                };
            }

            // S3 / R2'ye yükle
            await uploadFile(imageResult.fileName, imageResult.buffer, 'image/png');
            const imageUrl = `${cdnBase}/${encodeURIComponent(imageResult.fileName)}`;
            console.log(`✅ Görsel başarıyla yüklendi: ${imageUrl}`);

            return {
                success: true,
                fileName: imageResult.fileName,
                imageUrl: imageUrl
            };
        } catch (error) {
            console.error(`💥 Görsel yükleme hatası:`, error.message);
            if (attempt === maxAttempts) {
                return {
                    success: false,
                    message: error.message
                };
            }
        }
    }
}

async function generateAndUploadImageFixNews(newsTitle, maxAttempts = 2) {
    return await generateAndUploadImage(newsTitle, maxAttempts);
}

module.exports = {
    generateImage,
    generateAndUploadImage,
    generateAndUploadImageFixNews
};
