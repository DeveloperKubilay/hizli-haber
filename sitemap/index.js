addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function fetchAllDocuments(url, allDocs = [], pageToken = null) {
  let fetchUrl = url;
  if (pageToken) {
    fetchUrl += `?pageToken=${pageToken}`;
  }
  const res = await fetch(fetchUrl);
  if (!res.ok) {
    throw new Error('Firestore API error');
  }
  const data = await res.json();

  allDocs.push(...(data.documents || []));

  if (data.nextPageToken) {
    return fetchAllDocuments(url, allDocs, data.nextPageToken);
  }

  return allDocs;
}

async function handleRequest(request) {
  const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects/hizli-haber-f1210/databases/(default)/documents/news';

  const allDocuments = await fetchAllDocuments(FIRESTORE_URL);

  const urls = allDocuments.map(doc => {
    const parts = doc.name.split('/');
    const docId = parts[parts.length - 1];

    // createdAt alanını çek (timestampValue veya stringValue olabilir)
    const createdAt = doc.fields?.createdAt?.timestampValue || doc.fields?.createdAt?.stringValue || null;

    // Tarih formatını YYYY-MM-DD yap
    const lastmod = createdAt ? `<lastmod>${createdAt.split('T')[0]}</lastmod>` : '';

    return `
      <url>
        <loc>https://xn--hzl-haber-vpbc.com/haberler/${docId}</loc>
        ${lastmod}
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
      </url>
    `;
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
