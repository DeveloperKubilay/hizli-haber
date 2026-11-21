const config = require('../config.json');
const uploadFile = require('./s3');
const fs = require('fs');
const path = require('path');

// Kategori bazlı yedek stok görseller (son çare)
const STOCK_IMAGES = {
    'Technology': 'stock-tech.svg',
    'Science': 'stock-science.svg',
    'Sports': 'stock-sports.svg',
    'Health': 'stock-health.svg',
    'Education': 'stock-education.svg',
    'Economy': 'stock-economy.svg',
    'Culture': 'stock-culture.svg',
    'Magazine': 'stock-magazine.svg',
    'default': 'stock-default.svg'
};

function getStockImage(tagArray) {
    if (!tagArray || !Array.isArray(tagArray) || tagArray.length === 0) {
        return STOCK_IMAGES.default;
    }
    for (const tag of tagArray) {
        if (STOCK_IMAGES[tag]) {
            return STOCK_IMAGES[tag];
        }
    }
    return STOCK_IMAGES.default;
}

function getModelType(model) {
    if (model.startsWith('pollinations:')) return 'pollinations';
    if (model.startsWith('hf:')) return 'huggingface';
    if (model.startsWith('gemini') || model.startsWith('vertex:')) return 'gemini';
    return 'gemini';
}

// Google AI Studio / Vertex AI - gemini-3.1-flash-lite-image
async function callGeminiApi(model, promptText) {
    const apiUrl = (process.env.AI_API_URL || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, '');
    
    // GOOGLE_API_KEY (CircleCI), GEMINI_API_KEY (AI Studio), veya AI_API_KEY (randdcodes)
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    
    if (!apiKey) {
        throw new Error("GOOGLE_API_KEY / GEMINI_API_KEY / AI_API_KEY tanımlı değil");
    }

    const modelName = model.replace('vertex:', '').replace('gemini-', '');
    // gemini-3.1-flash-lite-image → models/gemini-3.1-flash-lite-image:generateContent
    const fullModelName = model.startsWith('vertex:') ? model.replace('vertex:', '') : `gemini-${modelName}`;
    
    const headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
    };

    const response = await fetch(`${apiUrl}/models/${fullModelName}:generateContent`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: promptText }
                ]
            }],
            generationConfig: {
                responseModalities: ["IMAGE", "TEXT"],
                temperature: 0.4,
                topK: 32,
                topP: 0.95
            }
        }),
        signal: AbortSignal.timeout(120000)
    });

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API hatası [${response.status}]: ${errorText.slice(0, 300)}`);
    }

    const data = await response.json();
    
    // Yanıttan image data'yı çıkar (base64)
    const candidates = data.candidates || [];
    for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return Buffer.from(part.inlineData.data, "base64");
            }
        }
    }
    
    throw new Error("Gemini yanıtında görsel verisi (inlineData) bulunamadı");
}

// Pollinations.ai (Tamamen ücretsiz, API key yok, Flux)
async function callPollinationsApi(model, promptText) {
    const modelName = model.replace('pollinations:', '');
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?model=${modelName}&width=1024&height=768&nologo=true&private=true`;
    
    const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(120000)
    });
    
    if (!response.ok) {
        throw new Error(`Pollinations API hatası [${response.status}]`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    return Buffer.from(imageBuffer);
}

// Hugging Face Inference API (Ücretsiz katman)
async function callHuggingFaceApi(model, promptText) {
    const modelName = model.replace('hf:', '');
    const apiUrl = `https://api-inference.huggingface.co/models/${modelName}`;
    const hfToken = process.env.HUGGINGFACE_API_KEY;
    
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'image/png'
    };
    
    if (hfToken) {
        headers['Authorization'] = `Bearer ${hfToken}`;
    }
    
    const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            inputs: promptText,
            parameters: {
                width: 1024,
                height: 768,
                num_inference_steps: 25,
                guidance_scale: 7.5
            }
        }),
        signal: AbortSignal.timeout(180000)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API hatası [${response.status}]: ${errorText.slice(0, 200)}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    return Buffer.from(imageBuffer);
}

async function callImageApi(model, promptText) {
    const type = getModelType(model);
    
    switch (type) {
        case 'pollinations':
            return await callPollinationsApi(model, promptText);
        case 'huggingface':
            return await callHuggingFaceApi(model, promptText);
        case 'gemini':
        default:
            return await callGeminiApi(model, promptText);
    }
}

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
        if (error.message.includes('429') || error.message.includes('rate limit') || error.message.includes('502') || error.message.includes('524') || error.message.includes('timeout')) {
            console.log("💤 Rate limit veya Gateway/Zaman aşımı! 10 saniye bekleniyor...");
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
        return {
            success: false,
            error: error
        };
    }
}

async function generateImageWithRetry(promptData, maxRetries = config.MaxImgTry || 2) {
    let lastError;
    const promptTemplate = (config.IMG_promt && config.IMG_promt.length > 0)
        ? config.IMG_promt.join("\n")
        : "Editorial photojournalism press photo for: {DATA}. Realistic, 4k, natural lighting.";
    
    const optimizedPrompt = promptTemplate.replace("{DATA}", promptData);
    const models = config.IMG_MODEL || ["gemini-3.1-flash-lite-image"];
    
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

async function generateAndUploadImage(newsTitle, tags = [], maxAttempts = 1) {
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

// Son çare: Kategoriye göre stok görseli R2'ye yükle ve URL döndür
async function useStockImage(tags = []) {
    const stockFile = getStockImage(tags);
    const localPath = path.join(__dirname, '..', '..', 'public', 'imgs', 'stok', stockFile);
    
    try {
        if (fs.existsSync(localPath)) {
            const fileData = fs.readFileSync(localPath);
            const fileName = `stock_${Date.now()}_${stockFile.replace('.svg', '.png')}`;
            await uploadFile(fileName, fileData, 'image/png');
            const cdnBase = process.env.CDN_URL || "https://cdn.xn--hzl-haber-vpbc.com";
            const imageUrl = `${cdnBase}/${encodeURIComponent(fileName)}`;
            console.log(`📦 Stok görsel kullanıldı: ${stockFile} -> ${imageUrl}`);
            return { success: true, fileName, imageUrl };
        }
    } catch (e) {
        console.error('Stok görsel yükleme hatası:', e.message);
    }
    
    // Hiçbir şey yoksa en azından default logo dön
    const cdnBase = process.env.CDN_URL || "https://cdn.xn--hzl-haber-vpbc.com";
    return { 
        success: true, 
        fileName: 'logo192.png', 
        imageUrl: `${cdnBase}/imgs/logos/logo192.png` 
    };
}

async function generateAndUploadImageFixNews(newsTitle, tags = [], maxAttempts = 2) {
    // Önce AI modellerini dene
    const result = await generateAndUploadImage(newsTitle, tags, maxAttempts);
    if (result.success) return result;
    
    // Tüm AI modelleri başarısız olursa stok görseli kullan
    console.log('🔄 Tüm AI modelleri başarısız, stok görsele geçiliyor...');
    return await useStockImage(tags);
}

module.exports = {
    generateImage,
    generateAndUploadImage,
    generateAndUploadImageFixNews
};