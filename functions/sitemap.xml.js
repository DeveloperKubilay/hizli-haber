function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function onRequest(context) {
  try {
    const url = "https://firestore.googleapis.com/v1/projects/hizli-haber-f1210/databases/(default)/documents:runQuery";
    const body = {
      structuredQuery: {
        from: [{ collectionId: "news" }],
        select: { fields: [{ fieldPath: "name" }, { fieldPath: "createdAt" }, { fieldPath: "slug" }, { fieldPath: "tag" }] },
        orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        limit: 1000
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    let urlsXml = `  <url>
    <loc>https://xn--hzl-haber-vpbc.com/</loc>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://xn--hzl-haber-vpbc.com/haberler</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>\n`;

    const twoDaysAgo = Date.now() - (48 * 60 * 60 * 1000);

    if (Array.isArray(data)) {
      for (const item of data) {
        if (!item.document) continue;
        const doc = item.document;
        const id = doc.name ? doc.name.split("/").pop() : "";
        if (!id) continue;
        const title = doc.fields?.name?.stringValue || "Hızlı Haber";
        const createdAt = doc.fields?.createdAt?.stringValue || doc.createTime || new Date().toISOString();
        const createdTime = new Date(createdAt).getTime();
        const dateStr = createdAt.split("T")[0];

        const slug = doc.fields?.slug?.stringValue || "";
        let catSlug = "gundem";
        if (doc.fields?.tag?.arrayValue?.values && doc.fields.tag.arrayValue.values.length > 0) {
          catSlug = String(doc.fields.tag.arrayValue.values[0].stringValue || "gundem").toLowerCase();
        }

        const newsUrl = slug
          ? `https://xn--hzl-haber-vpbc.com/haberler/${catSlug}/${slug}-${id}`
          : `https://xn--hzl-haber-vpbc.com/haberler/${id}`;

        const isRecent = !isNaN(createdTime) && createdTime > twoDaysAgo;

        urlsXml += `  <url>
    <loc>${newsUrl}</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>${isRecent ? `
    <news:news>
      <news:publication>
        <news:name>Hızlı Haber</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${createdAt}</news:publication_date>
      <news:title>${escapeXml(title)}</news:title>
    </news:news>` : ''}
  </url>\n`;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlsXml}</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800, s-maxage=3600"
      }
    });
  } catch (err) {
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://xn--hzl-haber-vpbc.com/</loc>
  </url>
  <url>
    <loc>https://xn--hzl-haber-vpbc.com/haberler</loc>
  </url>
</urlset>`;

    return new Response(fallbackXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8"
      }
    });
  }
}
