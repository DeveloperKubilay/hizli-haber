if (process.env.GITHUB_ACTIONS !== "true") require("dotenv").config();
const getNews = require("./modules/getNews");
const ai = require("./modules/ai");
const firebase = require("./modules/firebase");
// const { generateAndUploadImage } = require("./modules/genimg"); // Görsel üretimi kapalı
const { notifySearchEngines } = require("./modules/indexer");
const { shareNewsToBuffer } = require("./modules/buffer");
const config = require("./config.json");
//https://gnews.io/dashboard
//https://newsapi.org/

function slugify(text) {
    if (!text) return "haber-" + Date.now();
    const trMap = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ı': 'i', 'I': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u'
    };
    let slug = text;
    for (const key in trMap) {
        slug = slug.split(key).join(trMap[key]);
    }
    return slug
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

async function main() {
    console.log("🚀 Haber getirme işlemi başlatılıyor...");
    let news = [];
    if (process.env.DEPLOY_ENV && process.env.DEPLOY_ENV !== "auto") {
        news = [{ url: process.env.DEPLOY_ENV }];
    } else {
        const rawArticles = (await getNews()) || [];
        console.log(`🔍 Toplam ${rawArticles.length} ham haber çekildi, mükerrer kontrolü yapılıyor...`);
        for (const article of rawArticles) {
            if (!article.url) continue;
            try {
                const existing = await firebase.adminDb.collection('news').where('sourceUrl', '==', article.url).limit(1).get();
                if (existing.empty) {
                    news.push(article);
                    if (news.length >= 10) break;
                }
            } catch (e) {
                news.push(article);
                if (news.length >= 10) break;
            }
        }
    }

    if (news.length === 0) {
        console.log("✅ Eklenecek yeni haber bulunamadı (Tüm haberler güncel).");
        process.exit(0);
    }

    // 2'li gruplar halinde işle (API timeout riskini azaltmak için), ama TEK TEK işle
    const batchSize = 2;
    const batches = [];
    const addedUrls = [];
    const MAX_SOCIAL_PER_RUN = parseInt(process.env.MAX_SOCIAL_PER_RUN || "1", 10);
    let sharedSocialCount = 0;

    for (let i = 0; i < news.length; i += batchSize) {
        batches.push(news.slice(i, i + batchSize));
    }

    console.log(`📊 Toplam ${news.length} haber, ${batches.length} batch halinde işlenecek (tek tek sıralı)`);

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`🔄 Batch ${batchIndex + 1}/${batches.length} işleniyor... (${batch.length} haber)`);

        // Haberleri TEK TEK (sıralı) işle - paralel değil, API boğulmasın
        for (let i = 0; i < batch.length; i++) {
            const article = batch[i];
            const prompt = config.promt.join("\n").replace("{PROMT}", article.url);
            
            try {
                console.log(`🤖 ${batchIndex * batchSize + i + 1}. haber AI işleniyor...`);
                const response = await ai.processSingle(config.MODEL, prompt);
                
                console.log(`📝 ${batchIndex * batchSize + i + 1}. haberin AI cevabı işleniyor...`);
                
                let jsonStr = response.trim();
                if(jsonStr === "undefined") continue;
                if (!jsonStr.startsWith('{')) jsonStr = jsonStr.substring(jsonStr.indexOf('{'));
                if (!jsonStr.endsWith('}')) jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('}') + 1);

                const parsedNews = JSON.parse(jsonStr);

                // Haber başlığından görsel oluştur ve S3'e yükle - GÖRSEL ÜRETİMİ KAPALI
                let imageUrl = "";
                console.log(`🖼️ Görsel üretimi kapalı, görselsiz haber eklenecek`);

                const cleanSlug = parsedNews.slug ? slugify(parsedNews.slug) : slugify(parsedNews.name);
                const catSlug = parsedNews.tag?.[0] ? slugify(parsedNews.tag[0]) : 'gundem';

                const newsId = await firebase.addWithAdmin('news', {
                    ...parsedNews,
                    slug: cleanSlug,
                    likeCount: 0,
                    dislikeCount: 0,
                    sourceUrl: article.url || "",
                    createdAt: new Date().toISOString(),
                    originalPublishedAt: article.publishedAt || new Date().toISOString(),
                    image: imageUrl
                });

                if (newsId) {
                    const newsUrl = `https://xn--hzl-haber-vpbc.com/haberler/${catSlug}/${cleanSlug}-${newsId}`;
                    addedUrls.push(newsUrl);
                    addedUrls.push(`https://xn--hzl-haber-vpbc.com/haberler/${newsId}`);

                    // Buffer üzerinden otomatik sosyal medya paylaşımı (Twitter, Threads vb.)
                    // Algoritma bot/spam cezalarını önlemek için cron başına sadece en güncel haber paylaşılır
                    if (sharedSocialCount < MAX_SOCIAL_PER_RUN) {
                        console.log(`📡 [Sosyal Medya] ${sharedSocialCount + 1}/${MAX_SOCIAL_PER_RUN} seçkin haber Buffer'a aktarılıyor...`);
                        await shareNewsToBuffer({
                            title: parsedNews.name,
                            description: parsedNews.minides,
                            url: newsUrl,
                            imageUrl: imageUrl
                        });
                        sharedSocialCount++;
                    } else {
                        console.log(`ℹ️ [Sosyal Medya] Cron limiti (${MAX_SOCIAL_PER_RUN}) dolduğu için haber Buffer'a atlanıyor: ${parsedNews.name}`);
                    }
                }

                console.log(`🔥 Haber ${batchIndex * batchSize + i + 1} Firebase'e eklendi! ID: ${newsId}`);
            } catch (err) {
                console.error(`💥 ${batchIndex * batchSize + i + 1}. haber işlenirken hata:`, err.message);
                // Hata olsa bile diğer habere geç
            }
            
            // API nazikliği için aralarda küçük bekleme
            if (i < batch.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        
        // Batch'ler arası bekleme
        if (batchIndex < batches.length - 1) {
            console.log("⏳ Sonraki batch için 3 saniye bekleniyor...");
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }

    if (addedUrls.length > 0) {
        await notifySearchEngines(addedUrls);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log("🎉 Tüm haberler işlendi!");
    process.exit(0);
}

main()

const maxTimeoutMs = (process.env.DEPLOY_ENV && process.env.DEPLOY_ENV !== "auto") ? 3 * 60 * 1000 : 12 * 60 * 1000;
setTimeout(() => {
    console.log("⏰ Zaman aşımı süresi doldu, process sonlandırılıyor...");
    process.exit(0);
}, maxTimeoutMs);
