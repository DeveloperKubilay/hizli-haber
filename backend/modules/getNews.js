const axios = require('axios');
const config = require('../config.json');

// İlgi çekmeyen, çöp, bürokratik, mahkeme ilanı veya köşe yazısı olan içerikleri eleyen filtre
function isInterestingNews(article) {
    if (!article.title || !article.url) return false;
    
    const combined = `${article.title} ${article.description || ""} ${article.url}`.toLowerCase();
    
    // Kesinlikle yasaklı kelimeler (Resmi ilanlar, mahkemeler, icra, ihale, köşe yazarları vb.)
    const blacklist = [
        "resmi-ilan", "resmi ilan", "sulh hukuk", "asliye hukuk", "mahkeme", "mahkemesi",
        "icra dairesi", "ihale", "ihalesi", "ihalesine", "tasinmaz", "taşınmaz",
        "/yazarlar/", "yazarlar", "kose-yazisi", "köşe yazısı", "vefat", "taziye",
        "nobetci-eczane", "nöbetçi eczane", "namaz vakitleri", "hava durumu",
        "burc yorumlari", "burç yorumları", "astroloji", "resmi gazete"
    ];

    for (const word of blacklist) {
        if (combined.includes(word)) {
            return false;
        }
    }

    // Başlık çok kısaysa veya sadece duyuruysa geç
    if (article.title.trim().length < 20) return false;

    return true;
}

module.exports = async function(){
    const url = "https://newsapi.org/v2/everything?domains="+config.urls.join(",")+"&apiKey="+process.env.NEWS_API_KEY;
    const res = await axios.get(url);
    if(res.status !== 200){
        console.error("Error fetching news:", res.status, res.statusText);
        return [];
    }
    const articles = res.data.articles;
    if(!articles || articles.length === 0){
        console.log("No articles found.");
        return [];
    }
    console.log("Fetched " + articles.length + " raw articles.");

    // Kalite filtresinden geçir
    const filtered = articles.filter(isInterestingNews);
    console.log(`✨ Kalite filtresinden geçen seçkin haber sayısı: ${filtered.length}/${articles.length}`);
    
    return filtered;
}