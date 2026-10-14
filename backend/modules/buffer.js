const fetch = globalThis.fetch;

let cachedChannels = null;
let cachedOrgId = null;

/**
 * Buffer GraphQL API çağrısı yapar
 */
async function callBufferGraphql(query, variables = {}) {
    const token = process.env.BUFFER_ACCESS_TOKEN;
    if (!token) return null;

    const res = await fetch("https://api.buffer.com", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query, variables })
    });

    return await res.json();
}

/**
 * Hesaba bağlı organizasyon ve kanalları (Twitter, Threads vb.) çeker
 */
async function getConnectedChannels() {
    if (cachedChannels && cachedChannels.length > 0) {
        return { orgId: cachedOrgId, channels: cachedChannels };
    }

    try {
        // 1. Organizasyonu al
        const accountRes = await callBufferGraphql(`
            query {
                account {
                    organizations {
                        id
                        name
                    }
                }
            }
        `);

        const org = accountRes?.data?.account?.organizations?.[0];
        if (!org?.id) {
            console.warn("⚠️ Buffer organizasyonu bulunamadı.");
            return { orgId: null, channels: [] };
        }
        cachedOrgId = org.id;

        // 2. Kanalları al (Twitter, Threads vb.)
        const channelsRes = await callBufferGraphql(`
            query GetChannels($orgId: OrganizationId!) {
                channels(input: { organizationId: $orgId }) {
                    id
                    name
                    service
                    displayName
                }
            }
        `, { orgId: cachedOrgId });

        const channels = channelsRes?.data?.channels || [];
        cachedChannels = channels;
        console.log(`📡 Buffer'a bağlı ${channels.length} kanal tespit edildi:`, channels.map(c => `${c.service} (@${c.name})`).join(", "));
        return { orgId: cachedOrgId, channels };
    } catch (e) {
        console.error("⚠️ Buffer kanalları alınırken hata:", e.message);
        return { orgId: null, channels: [] };
    }
}

/**
 * Yeni haberi Buffer üzerinden bağlı tüm sosyal kanallara (Twitter, Threads vb.) paylaşır
 */
async function shareNewsToBuffer({ title, url, imageUrl }) {
    const token = process.env.BUFFER_ACCESS_TOKEN;
    if (!token) {
        console.log("ℹ️ BUFFER_ACCESS_TOKEN tanımlı değil, sosyal medya paylaşımı atlanıyor.");
        return;
    }

    try {
        const { channels } = await getConnectedChannels();
        if (!channels || channels.length === 0) {
            console.warn("⚠️ Buffer'da paylaşım yapılacak bağlı kanal bulunamadı.");
            return;
        }

        const shareMode = process.env.BUFFER_SHARE_MODE || "shareNow"; // shareNow veya addToQueue

        for (const channel of channels) {
            // Twitter için 280 karakter sınırı kontrolü
            let text = `${title}\n\nDetaylar: ${url}`;
            if (channel.service === "twitter" && text.length > 275) {
                const maxTitleLen = 270 - url.length - 15;
                text = `${title.slice(0, maxTitleLen)}…\n\nDetaylar: ${url}`;
            }

            const input = {
                channelId: channel.id,
                schedulingType: "automatic",
                mode: shareMode,
                text: text
            };

            // Görsel varsa ekle (logo değilse)
            if (imageUrl && !imageUrl.includes("logo") && imageUrl.startsWith("http")) {
                input.assets = [
                    {
                        image: {
                            url: imageUrl
                        }
                    }
                ];
            }

            const mutation = `
                mutation CreatePost($input: CreatePostInput!) {
                    createPost(input: $input) {
                        ... on PostActionSuccess {
                            post {
                                id
                                status
                            }
                        }
                        ... on MutationError {
                            message
                        }
                    }
                }
            `;

            console.log(`📤 Buffer üzerinden paylaşılıyor: [${channel.service}] @${channel.name}...`);
            const postRes = await callBufferGraphql(mutation, { input });

            if (postRes?.data?.createPost?.post) {
                console.log(`✅ [${channel.service}] Paylaşım başarılı! ID: ${postRes.data.createPost.post.id} (Durum: ${postRes.data.createPost.post.status})`);
            } else {
                console.warn(`⚠️ [${channel.service}] Paylaşım uyarısı:`, postRes?.data?.createPost?.message || JSON.stringify(postRes?.errors || postRes));
            }
        }
    } catch (err) {
        console.error("❌ Buffer paylaşımı sırasında beklenmedik hata:", err.message);
    }
}

module.exports = {
    getConnectedChannels,
    shareNewsToBuffer
};
