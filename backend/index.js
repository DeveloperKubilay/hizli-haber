if (process.env.GITHUB_ACTIONS !== "true") require("dotenv").config();
const getNews = require("./modules/getNews");
const ai = require("./modules/ai");
const firebase = require("./modules/firebase");
const { generateAndUploadImage } = require("./modules/genimg");
const config = require("./config.json");
//https://gnews.io/dashboard
//https://newsapi.org/

async function main() {
    console.log("🚀 Haber getirme işlemi başlatılıyor...");
    const news = process.env.DEPLOY_ENV !== "auto" ? [{url: process.env.DEPLOY_ENV}] : (await getNews()).slice(0, 25);

    // 5'li gruplar halinde işle
    const batchSize = 5;
    const batches = [];

    for (let i = 0; i < news.length; i += batchSize) {
        batches.push(news.slice(i, i + batchSize));
    }

    console.log(`📊 Toplam ${news.length} haber, ${batches.length} batch halinde işlenecek`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`🔄 Batch ${batchIndex + 1}/${batches.length} işleniyor... (${batch.length} haber)`);

        // Bu batch için prompt'ları hazırla
        const prompts = batch.map(article =>
            config.promt.join("\n").replace("{PROMT}", article.url)
        );

        try {
            // 5 prompt'ı aynı anda gönder - artık model array'i kullanıyoruz
            const responses = await ai.processMultiple(config.MODEL, prompts);
            console.log(`✅ Batch ${batchIndex + 1} AI işlemi tamamlandı`);

            // Her bir cevabı işle ve Firebase'e kaydet
            for (let i = 0; i < responses.length; i++) {
                try {
                    console.log(`📝 ${batchIndex * batchSize + i + 1}. haberin AI cevabı işleniyor...`);
                    
                    let jsonStr = responses[i].trim();
                    if(jsonStr === "undefined") continue;
                    if (!jsonStr.startsWith('{')) jsonStr = jsonStr.substring(jsonStr.indexOf('{'));
                    if (!jsonStr.endsWith('}')) jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('}') + 1);

                    const parsedNews = JSON.parse(jsonStr);

                    // Haber başlığından görsel oluştur ve S3'e yükle
                    console.log(`🎨 ${batchIndex * batchSize + i + 1}. haber için görsel oluşturuluyor...`);
                    const imageResult = await generateAndUploadImage(parsedNews.name);
                    let imageUrl = "https://xn--hzl-haber-vpbc.com/imgs/logo.png";

                    if (imageResult.success) {
                        imageUrl = imageResult.imageUrl;
                        console.log(`✅ Görsel başarıyla oluşturuldu: ${imageResult.fileName}`);
                    } else {
                        console.warn(`⚠️ Görsel oluşturulamadı, default resim kullanılıyor: ${imageResult.message}`);
                    }

                    const newsId = await firebase.addWithAdmin('news', {
                        ...parsedNews,
                        createdAt: batch[i].publishedAt,
                        image: imageUrl
                    });

                    console.log(`🔥 Haber ${batchIndex * batchSize + i + 1} Firebase'e eklendi! ID: ${newsId}`);
                } catch (parseError) {
                    console.error(`💥 ${batchIndex * batchSize + i + 1}. haber işlenirken hata:`, parseError);
                    console.error("Ham veri:", responses[i]);
                }
            }

            // Batch'ler arası kısa bekleme (rate limiting için)
            if (batchIndex < batches.length - 1) {
                console.log("⏳ Sonraki batch için 2 saniye bekleniyor...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }

        } catch (batchError) {
            console.error(`💥 Batch ${batchIndex + 1} işlenirken hata:`, batchError);
        }
    }

    console.log("🎉 Tüm haberler işlendi!");
    process.exit(0);
}

main()

setTimeout(() => {
    console.log("⏰ 7 dakika geçti, process sonlandırılıyor...");
    process.exit(0);
}, 7 * 60 * 1000);
