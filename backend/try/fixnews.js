require("dotenv").config({ path: "../.env" });
const { adminDb } = require('../modules/firebase');
const { generateAndUploadImageFixNews } = require('../modules/genimg');

const DEFAULT_IMAGE = "https://xn--hzl-haber-vpbc.com/imgs/logo.png";

async function fixNewsImages() {
    try {
        console.log("🔍 Görseli olmayan veya default olan haberler aranıyor...");
        
        const nullImages = await adminDb.collection('news')
            .where('image', '==', null)
            .get();
        
        const defaultImages = await adminDb.collection('news')
            .where('image', '==', DEFAULT_IMAGE)
            .get();
        
        const newsIds = [];
        
        nullImages.forEach(doc => newsIds.push(doc.id));
        defaultImages.forEach(doc => newsIds.push(doc.id));
        
        if (newsIds.length === 0) {
            console.log("✅ Tüm haberlerin görseli mevcut!");
            return;
        }
        
        console.log(`📰 ${newsIds.length} adet görselsiz/default görselli haber bulundu\n`);
        console.log("📋 ID Listesi:");
        newsIds.forEach((id, index) => {
            console.log(`${index + 1}. ${id}`);
        });
        
        console.log("\n🎨 Şimdi teker teker işlenecek...\n");
        
        for (let i = 0; i < newsIds.length; i++) {
            const newsId = newsIds[i];
            
            const newsDoc = await adminDb.collection('news').doc(newsId).get();
            const newsData = newsDoc.data();
            
            console.log(`\n🎯 [${i + 1}/${newsIds.length}] İşleniyor: ${newsData.name}`);
            
            const imageResult = await generateAndUploadImageFixNews(newsData.name, 3);
            
            if (imageResult.success) {
                await adminDb.collection('news').doc(newsId).update({
                    image: imageResult.imageUrl
                });
                console.log(`✅ Görsel eklendi: ${newsId}`);
            } else {
                console.log(`⏭️ Atlandı: ${newsId} - ${imageResult.message}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        console.log("\n🎉 Tüm haberler işlendi!");
        
    } catch (error) {
        console.error("💥 Hata:", error);
    }
}

fixNewsImages();