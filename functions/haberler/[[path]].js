function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function onRequest(context) {
  const { request, params, next } = context;

  // params.path catch-all dizi olarak gelir (örn: ["ekonomi", "turkiye-ekonomisi-UllOqVf8nfiDALVGI1Ke"])
  // veya tekil parametre olarak gelir
  let target = "";
  if (Array.isArray(params.path)) {
    target = params.path[params.path.length - 1] || "";
  } else if (typeof params.path === "string") {
    target = params.path;
  } else if (params.id) {
    target = params.id;
  }

  // Static index.html asset'ini al
  const response = await next();
  const contentType = response.headers.get("content-type") || "";

  // Sadece HTML isteklerini işle
  if (!contentType.includes("text/html") || !target) {
    return response;
  }

  // Hedef parametreden olası Firestore doc ID'sini ayrıştır
  let id = target;
  if (target.includes("-")) {
    const parts = target.split("-");
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length >= 16) {
      id = lastPart;
    }
  }

  let doc = null;
  try {
    // 1. Önce doğrudan doküman ID ile sorgula (O(1) hızlı)
    if (id) {
      const directRes = await fetch(
        `https://firestore.googleapis.com/v1/projects/hizli-haber-f1210/databases/(default)/documents/news/${encodeURIComponent(id)}`
      );

      if (directRes.ok) {
        doc = await directRes.json();
      }
    }

    // 2. Bulunamazsa slug olarak sorgula
    if (!doc && target) {
      const queryRes = await fetch(
        "https://firestore.googleapis.com/v1/projects/hizli-haber-f1210/databases/(default)/documents:runQuery",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: "news" }],
              where: {
                fieldFilter: {
                  field: { fieldPath: "slug" },
                  op: "EQUAL",
                  value: { stringValue: target }
                }
              },
              limit: 1
            }
          })
        }
      );

      if (queryRes.ok) {
        const qData = await queryRes.json();
        if (Array.isArray(qData) && qData[0] && qData[0].document) {
          doc = qData[0].document;
        }
      }
    }
  } catch (err) {
    // Firestore erişim hatasında varsayılan sayfayı dön
    return response;
  }

  // Doküman bulunamazsa orijinal index.html'i dön (React SPA 404 gösterecek)
  if (!doc || !doc.fields) {
    return response;
  }

  const fields = doc.fields;
  const docId = doc.name ? doc.name.split("/").pop() : id;
  const title = fields.name?.stringValue || "Hızlı Haber";
  const desc = fields.minides?.stringValue || fields.summary?.stringValue || "Yeni nesil haberler - En güncel son dakika gelişmeleri.";
  const image = fields.image?.stringValue || "https://xn--hzl-haber-vpbc.com/imgs/logos/logo192.png";
  const rawDate = fields.createdAt?.stringValue || doc.createTime;
  const publishedDate = rawDate ? new Date(rawDate).toISOString() : new Date().toISOString();

  // Canonical ve OG URL: varsa slug formatı, yoksa standart
  const slug = fields.slug?.stringValue || "";
  let catSlug = "gundem";
  if (fields.tag?.arrayValue?.values && fields.tag.arrayValue.values.length > 0) {
    catSlug = String(fields.tag.arrayValue.values[0].stringValue || "gundem").toLowerCase();
  }
  const canonicalUrl = slug
    ? `https://xn--hzl-haber-vpbc.com/haberler/${catSlug}/${slug}-${docId}`
    : `https://xn--hzl-haber-vpbc.com/haberler/${docId}`;

  // Structured Data (Schema.org NewsArticle)
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": desc,
    "image": [image],
    "datePublished": publishedDate,
    "dateModified": publishedDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hızlı Haber",
      "logo": {
        "@type": "ImageObject",
        "url": "https://xn--hzl-haber-vpbc.com/imgs/logos/logo192.png"
      }
    }
  };

  const dynamicMeta = `
    <!-- Edge SSR Injected Meta Tags -->
    <title>${escapeHtml(title)} - Hızlı Haber</title>
    <meta name="description" content="${escapeHtml(desc)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(desc)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:site_name" content="Hızlı Haber" />
    <meta property="article:published_time" content="${publishedDate}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(desc)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />

    <script type="application/ld+json">${JSON.stringify(schemaData)}</script>
  `;

  // HTML metnini al ve <head> içerisine meta etiketlerini enjekte et
  let html = await response.text();

  // Sabit statik canonical ve title etiketlerini temizle
  html = html.replace(/<title>.*?<\/title>/i, "");
  html = html.replace(/<link rel="canonical"[^>]*>/i, "");
  html = html.replace(/<meta name="description"[^>]*>/i, "");
  html = html.replace(/<meta property="og:title"[^>]*>/i, "");
  html = html.replace(/<meta property="og:description"[^>]*>/i, "");
  html = html.replace(/<meta property="og:image"[^>]*>/i, "");
  html = html.replace(/<meta property="og:url"[^>]*>/i, "");
  html = html.replace(/<meta name="twitter:title"[^>]*>/i, "");
  html = html.replace(/<meta name="twitter:description"[^>]*>/i, "");
  html = html.replace(/<meta name="twitter:image"[^>]*>/i, "");

  // Head kapanışından önce dinamik tag'leri yerleştir
  html = html.replace("</head>", `${dynamicMeta}\n</head>`);

  return new Response(html, {
    headers: {
      ...Object.fromEntries(response.headers),
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "public, max-age=120, s-maxage=600"
    }
  });
}
