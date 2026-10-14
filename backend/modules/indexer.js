const https = require('https');

const HOST = "xn--hzl-haber-vpbc.com";
const INDEXNOW_KEY = "7879721550hizlihaberindexnow";

/**
 * Yeni haberler eklendiğinde arama motorlarına (IndexNow - Bing, Yandex, Seznam, Naver) anında ping atar.
 * @param {string[]} urls İndekslenmesi istenen tam URL listesi
 */
async function notifySearchEngines(urls = []) {
    if (!urls || urls.length === 0) return;

    console.log(`📡 [Indexer] ${urls.length} adet haber için IndexNow motorlarına anında ping atılıyor...`);

    return new Promise((resolve) => {
        try {
            const payload = JSON.stringify({
                host: HOST,
                key: INDEXNOW_KEY,
                keyLocation: `https://${HOST}/hizlihaber-indexnow.txt`,
                urlList: urls
            });

            const req = https.request({
                hostname: 'api.indexnow.org',
                port: 443,
                path: '/indexnow',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Content-Length': Buffer.byteLength(payload)
                },
                timeout: 8000
            }, (res) => {
                console.log(`⚡ [IndexNow] Ping yanıtı: HTTP ${res.statusCode}`);
                res.resume(); // Socket'i serbest bırak
                resolve();
            });

            req.on('error', (err) => {
                console.warn(`⚠️ [IndexNow] Hata: ${err.message}`);
                resolve();
            });

            req.on('timeout', () => {
                req.destroy();
                resolve();
            });

            req.write(payload);
            req.end();
        } catch (e) {
            console.warn(`⚠️ [IndexNow] İstek oluşturulamadı: ${e.message}`);
            resolve();
        }
    });
}

module.exports = { notifySearchEngines };
