const config = require('../config.json');
const uploadFile = require('./s3');

// ai.randdcodes.com - OpenAI uyumlu /images/generations endpoint (Fallback YOK)
async function callRanddCodesImageApi(model, promptText) {
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
            model: model || "hizli-haber-gorsel",
            prompt: promptText,
            n: 1,
            size: "auto",
            quality: "auto",
            background: "auto",
            image_detail: "high",
            output_format: "png"
        }),
        signal: AbortSignal.timeout(120000)
    });

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) {
        const errorText = await response.text();
        if (response.status === 302 || errorText.includes("cloudflareaccess.com") || errorText.includes("Cloudflare Access")) {
            throw new Error("Cloudflare Access engeli: CF_ACCESS_CLIENT_ID veya CF_ACCESS_CLIENT_SECRET tanımlı değil veya geçersiz.");
        }
        throw new Error(`ai.randdcodes.com görsel API hatası [${response.status}]: ${errorText.slice(0, 300)}`);
    }

    const data = await response.json();

    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
        throw new Error("ai.randdcodes.com yanıtında b64_json verisi bulunamadı");
    }

    return Buffer.from(data.data[0].b64_json, "base64");
}

async function generateImage(promptData) {
    const promptTemplate = (config.IMG_promt && config.IMG_promt.length > 0)
        ? config.IMG_promt.join("\n")
        : "Editorial photojournalism press photo for: {DATA}. Realistic, 4k, natural lighting.";

    const optimizedPrompt = promptTemplate.replace("{DATA}", promptData);
    const model = config.IMG_MODEL?.[0] || "hizli-haber-gorsel";

    try {
        console.log(`🤖 ai.randdcodes.com (${model}) ile görsel oluşturuluyor...`);
        const imageBuffer = await callRanddCodesImageApi(model, optimizedPrompt);

        if (imageBuffer && imageBuffer.length > 0) {
            const fileName = 'image_' + Date.now() + '.png';
            console.log(`✅ ${model} ile görsel başarıyla oluşturuldu (${imageBuffer.length} bayt)!`);
            return { success: true, fileName, buffer: imageBuffer };
        }
    } catch (error) {
        console.warn(`⚠️ ${model} görsel oluşturma hatası: ${error.message}`);
    }

    // Fallback yok — başarısız olursa boş dön, frontend logo/placeholder kullanır
    return { error: true, message: "ai.randdcodes.com görsel oluşturulamadı, görselsiz devam ediliyor" };
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

async function generateAndUploadImageFixNews() {
    return { success: false, message: 'Görsel üretimi atlandı', imageUrl: '' };
}

module.exports = {
    generateImage,
    generateAndUploadImage,
    generateAndUploadImageFixNews
};
