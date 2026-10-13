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
  const id = params.id;

  // Static index.html asset'ini al
  const response = await next();
  const contentType = response.headers.get("content-type") || "";

  // Sadece HTML isteklerini işle
  if (!contentType.includes("text/html") || !id) {
    return response;
  }

  let doc = null;
  try {
    // 1. Önce doğrudan doküman ID ile sorgula
    const directRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/hizli-haber-f1210/databases/(default)/documents/news/${encodeURIComponent(id)}`
    );

    if (directRes.ok) {
      doc = await directRes.json();
    } else {
      // 2. Bulunamazsa slug olarak sorgula
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
                  value: { stringValue: id }
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
  const rawDesc = fields.minides?.stringValue || fields.summary?.stringValue || "Yeni nesil haberler - Hızlı Haber";
  const description = rawDesc.replace(/[\r\n]+/g, " ").trim().slice(0, 160);
  const imageUrl = fields.image?.stringValue || "https://xn--hzl-haber-vpbc.com/imgs/logos/logo192.png";
  const canonicalUrl = `https://xn--hzl-haber-vpbc.com/haberler/${docId}`;
  const publishedAt = fields.createdAt?.stringValue || doc.createTime || new Date().toISOString();
  const summary = fields.summary?.stringValue || "";
  const authorName = "Hızlı Haber";

  // Google News / Schema.org NewsArticle Yapısal Verisi
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": title,
    "description": description,
    "image": [imageUrl],
    "datePublished": publishedAt,
    "dateModified": doc.updateTime || publishedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "author": [{
      "@type": "Organization",
      "name": authorName,
      "url": "https://xn--hzl-haber-vpbc.com"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Hızlı Haber",
      "logo": {
        "@type": "ImageObject",
        "url": "https://xn--hzl-haber-vpbc.com/imgs/logos/logo192.png"
      }
    }
  };

  const noscriptContent = `
    <noscript>
      <article style="max-width:800px;margin:30px auto;padding:20px;font-family:sans-serif;color:#e2e8f0;background:#16181c;border-radius:12px;">
        <h1 style="font-size:24px;line-height:1.4;margin-bottom:16px;">${escapeHtml(title)}</h1>
        <p style="font-size:16px;line-height:1.6;color:#94a3b8;margin-bottom:16px;">${escapeHtml(description)}</p>
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" style="max-width:100%;height:auto;border-radius:8px;margin-bottom:16px;" />
        ${summary ? `<div style="background:#1e293b;padding:16px;border-radius:8px;margin-top:16px;"><h3 style="font-size:18px;margin-bottom:8px;">Hızlı Özet</h3><p style="line-height:1.6;">${escapeHtml(summary)}</p></div>` : ''}
      </article>
    </noscript>
  `;

  const scriptTag = `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`;

  // Cloudflare HTMLRewriter ile dinamik enjeksiyon
  return new HTMLRewriter()
    .on("title", {
      element(e) {
        e.setInnerContent(`${title} | Hızlı Haber`);
      }
    })
    .on('link[rel="canonical"]', {
      element(e) {
        e.setAttribute("href", canonicalUrl);
      }
    })
    .on('meta[name="description"]', {
      element(e) {
        e.setAttribute("content", description);
      }
    })
    .on('meta[property="og:title"]', {
      element(e) {
        e.setAttribute("content", `${title} | Hızlı Haber`);
      }
    })
    .on('meta[property="og:description"]', {
      element(e) {
        e.setAttribute("content", description);
      }
    })
    .on('meta[property="og:url"]', {
      element(e) {
        e.setAttribute("content", canonicalUrl);
      }
    })
    .on('meta[property="og:image"]', {
      element(e) {
        e.setAttribute("content", imageUrl);
      }
    })
    .on('meta[name="twitter:title"]', {
      element(e) {
        e.setAttribute("content", `${title} | Hızlı Haber`);
      }
    })
    .on('meta[name="twitter:description"]', {
      element(e) {
        e.setAttribute("content", description);
      }
    })
    .on('meta[name="twitter:image"]', {
      element(e) {
        e.setAttribute("content", imageUrl);
      }
    })
    .on("head", {
      element(e) {
        e.append(scriptTag, { html: true });
      }
    })
    .on("div#root", {
      element(e) {
        e.append(noscriptContent, { html: true });
      }
    })
    .transform(response);
}
