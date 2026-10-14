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
        select: {
          fields: [
            { fieldPath: "name" },
            { fieldPath: "minides" },
            { fieldPath: "summary" },
            { fieldPath: "image" },
            { fieldPath: "tag" },
            { fieldPath: "createdAt" },
            { fieldPath: "slug" }
          ]
        },
        orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
        limit: 30
      }
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    let itemsXml = "";
    const nowRfc = new Date().toUTCString();

    if (Array.isArray(data)) {
      for (const item of data) {
        if (!item.document) continue;
        const doc = item.document;
        const fields = doc.fields || {};
        const id = doc.name ? doc.name.split("/").pop() : "";
        if (!id) continue;

        const title = fields.name?.stringValue || "Hızlı Haber";
        const desc = fields.minides?.stringValue || fields.summary?.stringValue || "";
        const image = fields.image?.stringValue || "";
        const createdAt = fields.createdAt?.stringValue || doc.createTime || new Date().toISOString();
        const pubDate = new Date(createdAt).toUTCString();
        const link = `https://xn--hzl-haber-vpbc.com/haberler/${id}`;
        
        let tags = [];
        if (fields.tag?.arrayValue?.values) {
          tags = fields.tag.arrayValue.values.map(v => v.stringValue).filter(Boolean);
        }

        itemsXml += `    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${desc}]]></description>
      ${image && !image.includes('logo.png') ? `<enclosure url="${escapeXml(image)}" type="image/jpeg" length="0" />` : ''}
      ${tags.map(t => `<category>${escapeXml(t)}</category>`).join("\n      ")}
    </item>\n`;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Hızlı Haber</title>
    <link>https://xn--hzl-haber-vpbc.com</link>
    <description>Yeni nesil bağımsız dijital haber platformu - Hızlı Haber</description>
    <language>tr</language>
    <lastBuildDate>${nowRfc}</lastBuildDate>
    <atom:link href="https://xn--hzl-haber-vpbc.com/rss" rel="self" type="application/rss+xml" />
${itemsXml}  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=600, s-maxage=1200"
      }
    });
  } catch (err) {
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Hızlı Haber</title><link>https://xn--hzl-haber-vpbc.com</link></channel></rss>`, {
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" }
    });
  }
}
