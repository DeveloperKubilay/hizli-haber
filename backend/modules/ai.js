const { GoogleGenAI } = require('@google/genai');
const config = require('../config.json');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Model fallback sistemi
async function tryWithFallback(models, operation) {
    let lastError;
    
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        try {
            console.log(`🤖 ${model} modeli deneniyor... (${i + 1}/${models.length})`);
            const result = await operation(model);
            console.log(`✅ ${model} ile başarılı!`);
            return result;
        } catch (error) {
            lastError = error;
            console.warn(`⚠️ ${model} başarısız: ${error.message}`);
            
            // Rate limit hatası ise biraz bekle
            if (error.status === 429) {
                console.log("💤 Rate limit! 5 saniye bekleniyor...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    
    throw lastError;
}

// Tek prompt işleme fonksiyonu
async function processSinglePrompt(models, data, uploadFile) {
    return await tryWithFallback(models, async (ainame) => {
        try {
            let content = data;

            if (uploadFile && uploadFile.length) {
                const filePromises = uploadFile.map(file => ai.files.upload({ file: file }));
                const files = await Promise.all(filePromises);
                content = {
                    role: 'user',
                    parts: [
                        { text: data }
                    ]
                };
                for (const file of files) {
                    content.parts.push({
                        fileData: {
                            fileUri: file.uri,
                            mimeType: file.mimeType
                        }
                    });
                }
            }

            const response = await ai.models.generateContent({
                model: ainame,
                contents: [content],
                config: {
                   /* thinkingConfig: {
                        thinkingBudget: -1,
                    },*/
                    tools: [{ urlContext: {} }],
                    responseMimeType: 'text/plain',
                },
                thinkingConfig: {
                    thinkingBudget: 24576,
                },
                responseMimeType: 'text/plain'
            });

            let responseText = response.text.replace(/[()]/g, '');
            
            if (data.includes('JSON') || data.includes('json')) {
                responseText = responseText.replace(/```json|```/g, '').trim();
                const startIndex = responseText.indexOf('{');
                const endIndex = responseText.lastIndexOf('}') + 1;
                
                if (startIndex >= 0 && endIndex > 0) {
                    responseText = responseText.substring(startIndex, endIndex);
                    console.log("🔄 AI'dan gelen JSON temizlendi");
                }
            }
            
            return responseText;
        } catch (err) {
            console.error("🤖 AI Error:", err);
            throw err;
        }
    });
}

// Çoklu prompt işleme fonksiyonu (5 adet paralel)
async function processMultiplePrompts(models, prompts, uploadFiles = []) {
    try {
        console.log(`🚀 ${prompts.length} adet prompt paralel olarak işleniyor...`);
        
        const promises = prompts.map((prompt, index) => {
            const uploadFile = uploadFiles[index] || null;
            if(prompt.includes("undefined")){
                return new Promise((resolve) => resolve("undefined"));
            }
            return processSinglePrompt(models, prompt, uploadFile);
        });

        const results = await Promise.all(promises);
        console.log(`✅ Tüm prompt'lar başarıyla işlendi!`);
        
        return results;
    } catch (err) {
        console.error("🤖 Çoklu AI Error:", err);
        throw err;
    }
}

// Ana export fonksiyonu - geriye uyumluluk için
module.exports = processSinglePrompt;

// Çoklu işlem için export
module.exports.processMultiple = processMultiplePrompts;
module.exports.processSingle = processSinglePrompt;
