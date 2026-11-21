const config = require('../config.json');
const uploadFile = require('./s3');

// Sadece Gemini - tek model, fallback YOK
async function callGeminiApi(model, promptText) {
    const apiUrl = (process.env.AI_API_URL || "https://generativelanguage.googleapis.com/v1beta").replace(/\/+$/, '');
    
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    
    if (!apiKey) {
        throw new Error("GOOGLE_API_KEY / GEMINI_API_KEY / AI_API_KEY tanımlı değil");
    }

    const fullModelName = model.startsWith('vertex:') ? model.replace('vertex:', '') : model;
    
    const headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
    };

    const response = await fetch(`${apiUrl}/models/${fullModelName}:generateContent`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            contents: [{
                parts: [{ text: promptText }]
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

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API hatası [${response.status}]: ${errorText.slice(0, 300)}`);
    }

    const data = await response.json();
    
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

async function generateImage(promptData) {
    const promptTemplate = (config.IMG_promt && config.IMG_promt.length > 0)
        ? config.IMG_promt.join("\n")
        : "Editorial photojournalism press photo for: {DATA}. Realistic, 4k, natural lighting.";
    
    const optimizedPrompt = promptTemplate.replace("{DATA}", promptData);
    const model = config.IMG_MODEL?.[0] || "gemini-3.1-flash-lite-image";
    
    try {
        console.log(`🤖 ${model} ile görsel oluşturuluyor...`);
        const imageBuffer = await callGeminiApi(model, optimizedPrompt);
        
        if (imageBuffer && imageBuffer.length > 0) {
            const fileName = 'image_' + Date.now() + '.png';
            console.log(`✅ ${model} ile görsel başarıyla oluşturuldu (${imageBuffer.length} bayt)!`);
            return { success: true, fileName, buffer: imageBuffer };
        }
    } catch (error) {
        console.warn(`⚠️ ${model} görsel oluşturma hatası: ${error.message}`);
    }
    
    // Başarısız olursa boş dön - frontend placeholder/logo koyar
    return { error: true, message: "Gemini görsel oluşturulamadı, frontend placeholder kullanacak" };
}

async function generateAndUploadImage(newsTitle, tags = [], maxAttempts = 1) {
    const cdnBase = process.env.CDN_URL || "https://cdn.xn--hzl-haber-vpbc.com";
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            console.log(`🎨 Görsel oluşturma ve yükleme ${attempt}/${maxAttempts}...`);
            const imageResult = await generateImage(newsTitle);
            
            if (imageResult.error) {
                console.warn(`⚠️ Görsel oluşturulamadı: ${imageResult.message}`);
                return { success: false, message: imageResult.message, imageUrl: '' };
            }
            
            await uploadFile(imageResult.fileName, imageResult.buffer, 'image/png');
            const imageUrl = `${cdnBase}/${encodeURIComponent(imageResult.fileName)}`;
            console.log(`✅ Görsel başarıyla yüklendi: ${imageUrl}`);
            
            return { success: true, fileName: imageResult.fileName, imageUrl };
        } catch (error) {
            console.error(`💥 Görsel yükleme hatası:`, error.message);
            if (attempt === maxAttempts) {
                return { success: false, message: error.message, imageUrl: '' };
            }
        }
    }
}

// Basit: her zaman false dön - frontend logo/placeholder koyar
async function generateAndUploadImageFixNews(newsTitle, tags = [], maxAttempts = 2) {
    return { success: false, message: 'Görsel üretimi atlandı (frontend placeholder)', imageUrl: '' };
}

module.exports = {
    generateImage,
    generateAndUploadImage,
    generateAndUploadImageFixNews
};