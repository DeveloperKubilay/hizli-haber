const { S3Client, ListObjectsV2Command, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
require("dotenv").config();

//https://pub-85e7961b073c49cd8e8af1e0eff7a3c7.r2.dev/Ads%C4%B1z.png

const s3Client = new S3Client({
    region: "auto",
    endpoint: "https://a05057577967c7503e88f8229c93d296.r2.cloudflarestorage.com",
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
});

async function uploadFile(fileKey, fileData, contentType) {
    const command = new PutObjectCommand({
        Bucket: "haber",
        Key: fileKey,
        Body: fileData,
        ContentType: contentType
    });
    
    return s3Client.send(command);
}

async function main(){
    const fileKey = "selam.png";
    await uploadFile(fileKey, fs.readFileSync(fileKey), "image/png");
    const url = `https://cdn.emailsunucusu.tech/${encodeURIComponent(fileKey)}`;
    console.log("Dosya yüklendi! Url burada:", url);
}

main()