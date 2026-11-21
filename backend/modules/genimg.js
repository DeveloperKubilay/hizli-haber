const config = require('../config.json');
const uploadFile = require('./s3');

async function generateImage(promptData) {
    // AI görsel üretimi tamamen kapalı - görselsiz haber
    return { error: true, message: 'AI görsel üretimi devre dışı' };
}

async function generateAndUploadImage(newsTitle, tags = [], maxAttempts = 1) {
    // Hiç görsel oluşturma, boş döndür
    return { success: false, message: 'Görsel üretimi kapalı', imageUrl: '' };
}

async function generateAndUploadImageFixNews(newsTitle, tags = [], maxAttempts = 2) {
    return { success: false, message: 'Görsel üretimi kapalı', imageUrl: '' };
}

module.exports = {
    generateImage,
    generateAndUploadImage,
    generateAndUploadImageFixNews
};