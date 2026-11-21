/**
 * Mevcut tüm haberlerin image alanını temizler (eski AI görselleri - insan yüzlü)
 * CircleCI'de çalıştır: node scripts/clear-old-images.js
 */
require('dotenv').config();
const { adminDb } = require('../backend/modules/firebase');

async function clearOldImages() {
    console.log('🔍 Tüm haberler taranıyor...');
    
    const snapshot = await adminDb.collection('news').get();
    console.log(`📊 Toplam ${snapshot.size} haber bulundu`);
    
    let cleared = 0;
    let kept = 0;
    const batch = adminDb.batch();
    let batchCount = 0;
    
    for (const doc of snapshot.docs) {
        const data = doc.data();
        const imageUrl = data.image || '';
        
        if (imageUrl) {
            // CDN URL pattern kontrolü - eski AI görselleri
            const isOldAiImage = imageUrl.includes('cdn.xn--hzl-haber-vpbc.com') && 
                                (imageUrl.includes('image_') || imageUrl.includes('stock_'));
            
            if (isOldAiImage) {
                batch.update(doc.ref, { image: '' });
                cleared++;
                console.log(`🗑️ Temizlendi: ${doc.id} | ${data.name?.substring(0, 50)}`);
            } else {
                kept++;
                console.log(`✅ Korundu: ${doc.id} | ${imageUrl.substring(0, 60)}...`);
            }
            
            batchCount++;
            // Firestore batch limiti: 500
            if (batchCount >= 450) {
                await batch.commit();
                console.log(`💾 Batch commit edildi (${cleared} temizlendi)`);
                // Yeni batch
                batchCount = 0;
            }
        }
    }
    
    // Kalanları commit et
    if (batchCount > 0) {
        await batch.commit();
        console.log(`💾 Son batch commit edildi`);
    }
    
    console.log(`\n✅ TAMAMLANDI:`);
    console.log(`   🗑️ Temizlenen (eski AI): ${cleared}`);
    console.log(`   ✅ Korunan (diğer): ${kept}`);
    console.log(`   📊 Toplam işlenen: ${cleared + kept}`);
}

clearOldImages()
    .then(() => {
        console.log('🎉 İşlem bitti');
        process.exit(0);
    })
    .catch(err => {
        console.error('💥 Hata:', err);
        process.exit(1);
    });