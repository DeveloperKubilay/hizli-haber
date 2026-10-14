const { TwitterApi } = require('twitter-api-v2');

let client = null;

function getTwitterClient() {
  if (client) return client;

  const appKey = process.env.TWITTER_API_KEY;
  const appSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessSecret = process.env.TWITTER_ACCESS_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    return null;
  }

  client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });

  return client;
}

/**
 * Yeni haber için X (Twitter) paylaşımı yapar
 * @param {Object} news - { name, minides, url, tag }
 */
async function postTweet(news) {
  const twitterClient = getTwitterClient();
  if (!twitterClient) {
    console.log("ℹ️ [Twitter] API anahtarları tanımlı değil, tweet atlanıyor.");
    return null;
  }

  try {
    const title = news.name || "Günün Önemli Gelişmesi";
    const link = news.url;
    const tag = news.tag && news.tag.length > 0 ? `#${news.tag[0].toLowerCase()} ` : "";

    // Tweet metni (X karakter limiti 280'dir; link ~23 karakter sayılır)
    // Format:
    // 🚨 SON DAKİKA
    //
    // [Başlık]
    //
    // #gundem
    // 🔗 Detaylar: [Link]
    const maxTitleLength = 180;
    const trimmedTitle = title.length > maxTitleLength ? title.slice(0, maxTitleLength - 3) + "..." : title;

    const tweetText = `🚨 SON DAKİKA\n\n${trimmedTitle}\n\n${tag}#HızlıHaber\n🔗 Detaylar: ${link}`;

    const res = await twitterClient.v2.tweet(tweetText);
    console.log(`🐦 [Twitter] Tweet başarıyla paylaşıldı! Tweet ID: ${res.data.id}`);
    return res.data;
  } catch (err) {
    console.error("❌ [Twitter] Tweet paylaşılırken hata oluştu:", err.data || err.message);
    return null;
  }
}

module.exports = {
  postTweet
};
