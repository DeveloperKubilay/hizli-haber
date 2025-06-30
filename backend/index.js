require("dotenv").config();
const s3 = require("./modules/s3");
const getNews = require("./modules/getNews");
const ai = require("./modules/ai");
const config = require("./config.json");
const fs = require("fs")
//https://gnews.io/dashboard
//https://newsapi.org/

async function main() {
    console.log("Starting news fetch...");
    const news = (await getNews()).slice(0, 1);
    const texts = []
    for (const article of news) {
        const response = await ai(config.MODEL, config.promt.join("\n").replace("{PROMT}", article.url))
        texts.push(response.replace("```json","").replace("```",""))
    }
    console.log(texts)
    console.log(JSON.parse(texts[0]))
}

main()

//etiketler