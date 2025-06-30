const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

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


// const fileKey = "selam.png";
// const fileData = fs.readFileSync(fileKey);
// const contentType = "image/png";
// await uploadFile(fileKey, fileData, contentType);
// const url = `https://cdn.emailsunucusu.tech/${encodeURIComponent(fileKey)}`;
// console.log("Dosya yüklendi! Url burada:", url);


module.exports = uploadFile