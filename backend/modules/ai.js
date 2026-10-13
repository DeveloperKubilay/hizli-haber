const config = require('../config.json');

// Model fallback sistemi
async function tryWithFallback(models, operation) {
    let lastError;
    const modelList = Array.isArray(models) && models.length > 0 ? models : (config.MODEL || ['eniyi']);
    
    for (let i = 0; i < modelList.length; i++) {
        const model = modelList[i];
        try {
            console.log(`🤖 ${model} modeli deneniyor... (${i + 1}/${modelList.length})`);
            const result = await operation(model);
            console.log(`✅ ${model} ile başarılı!`);
            return result;
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ ${model} başarısız: ${error.message}`);
            
            // Rate limit (429) durumunda bekle
            if (error.status === 429 || error.message?.includes('429')) {
                console.log("💤 Rate limit! 5 saniye bekleniyor...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    
    throw lastError || new Error("Hiçbir model yanıt vermedi.");
}

// Tek prompt işleme fonksiyonu
async function processSinglePrompt(models, promptText) {
    return await tryWithFallback(models, async (modelName) => {
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

        const response = await fetch(`${apiUrl}/chat/completions`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                model: modelName,
                messages: [
                    {
                        role: "user",
                        content: promptText
                    }
                ],
                stream: false
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`AI API hatası [${response.status}]: ${errText}`);
        }

        const jsonRes = await response.json();
        let responseText = jsonRes.choices?.[0]?.message?.content || "";

        if (promptText.includes('JSON') || promptText.includes('json')) {
            responseText = responseText.replace(/```json|```/gi, '').trim();
            const startIndex = responseText.indexOf('{');
            const endIndex = responseText.lastIndexOf('}') + 1;
            
            if (startIndex >= 0 && endIndex > 0) {
                responseText = responseText.substring(startIndex, endIndex);
            }
        }

        return responseText;
    });
}

// Çoklu prompt işleme fonksiyonu
async function processMultiplePrompts(models, prompts) {
    try {
        console.log(`🚀 ${prompts.length} adet prompt paralel olarak işleniyor...`);
        
        const promises = prompts.map((prompt) => {
            if (!prompt || prompt.includes("undefined")) {
                return Promise.resolve("undefined");
            }
            return processSinglePrompt(models, prompt);
        });

        const results = await Promise.all(promises);
        console.log(`✅ Tüm prompt'lar başarıyla işlendi!`);
        return results;
    } catch (err) {
        console.error("🤖 Çoklu AI Error:", err);
        throw err;
    }
}

module.exports = processSinglePrompt;
module.exports.processMultiple = processMultiplePrompts;
module.exports.processSingle = processSinglePrompt;
