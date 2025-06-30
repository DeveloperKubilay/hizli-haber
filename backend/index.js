if (process.env.GITHUB_ACTIONS !== "true") require("dotenv").config();
const s3 = require("./modules/s3");
const getNews = require("./modules/getNews");
const ai = require("./modules/ai");
const firebase = require("./modules/firebase");
const config = require("./config.json");
const fs = require("fs")
//https://gnews.io/dashboard
//https://newsapi.org/

async function main() {

    console.log("🚀 Haber getirme işlemi başlatılıyor...");
    const news = (await getNews()).slice(0, 1);
    const texts = []
    for (const article of news) {
        const response = await ai(config.MODEL, config.promt.join("\n").replace("{PROMT}", article.url))
        texts.push({ data: response.replace("```json", "").replace("```", ""), time: article.publishedAt })
    }

    try {
        console.log("📝 AI'dan gelen ham veri: ", texts[0].data);

        let parsedNews;

        let jsonStr = texts[0].data.trim();
        if (!jsonStr.startsWith('{')) jsonStr = jsonStr.substring(jsonStr.indexOf('{'));
        if (!jsonStr.endsWith('}')) jsonStr = jsonStr.substring(0, jsonStr.lastIndexOf('}') + 1);


        console.log("🛠️ Düzeltilen JSON: ", jsonStr);
        parsedNews = JSON.parse(jsonStr);

        const newsId = await firebase.addWithAdmin('news', {
            ...parsedNews,
            createdAt: texts[0].time,
            likes: 0,
            dislikes: 0,
            views: 0,
            image: "https://via.placeholder.com/150"
        });

        console.log(`🔥 Haber Admin SDK ile veritabanına eklendi! ID: ${newsId}`);
    } catch (error) {
        console.error(`💥 Firebase işlemi sırasında hata: ${error}`);
    }
}

main()