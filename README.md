# Hızlı Haber 🚀

https://hızlı-haber.com

> Z kuşağının haber platformu. Sıkıcı haber sitelerini unut, burası tam sana göre! 😎

## ✨ Özellikler
- **Gerçek zamanlı haberler**: En güncel içerikler, anında önünde!
- **Yapay Zeka ile özet**: Haberleri uzun uzun okuma, AI senin için özetliyor.
- **Koyu tema & modern UI**: Gözünü yormayan, Z kuşağına hitap eden koyu tema.
- **Mobil uyumlu**: Her cihazda tam performans.
- **Kategoriler & filtreler**: Sıkıldığın kategoriyi anında değiştir.
- **Google ile giriş**: Hesap açma derdi yok, tek tıkla giriş!
- **Kaydet, beğen, yorum yap**: Favori haberlerini kaydet, beğen, yorumla.
- **AI Chat**: Habere dair aklına ne takılırsa, AI ile sohbet et!

## 🛠️ Teknolojiler
- **React** + **Tailwind CSS** + **Framer Motion**
- **Firebase** (Auth, Firestore, Storage)
- **Google Gemini AI** (Haber özet & görsel üretim)
- **Node.js Backend** (Haber çekme, AI ile işleme)
- **AWS S3/Cloudflare R2** (Görsel depolama)
- **Lucide-react** (ikonlar)

## 📁 Proje Yapısı
```
/ (root)
  |-- backend/         # Node.js, AI, haber çekme, görsel üretme
  |-- public/          # Statik dosyalar, img, favicon
  |-- src/             # React app, componentler, sayfalar
      |-- components/  # Navbar, Footer, Home, News, New, vs.
      |-- pages/       # home, news, new, savednews, terms
      |-- services/    # auth, firebase, kategoriler, css
  |-- color_palet.html # Renk paleti
  |-- tailwind.config.js
  |-- firestore.rules  # Güvenlik kuralları
```

## 🚦 Güvenlik
- Firestore kuralları ile kullanıcı verisi koruma
- Sadece giriş yapan kullanıcılar veri ekleyebilir/değiştirebilir
- Yorum, beğeni, kaydetme işlemleri kullanıcıya özel

## 🤖 AI Prompt Kuralları
- Başlıklar clickbait ama yalan yok, bol emoji!
- Özetler kısa, açıklamalar markdown ve Z kuşağı kafasında
- Ciddi konularda mizah yok, eğlencelide full samimiyet

## 🚀 Nasıl Çalıştırılır?
1. `npm install` (root ve backend klasöründe)
2. Firebase ve News API anahtarlarını `.env` dosyasına ekle
3. Frontend için: `npm start`
4. Backend için: `node backend/index.js`

## 🎨 Renk Paleti
- Arka Plan: `#16181c` (tbackground)
- Ana: `#1a1a1c` (background)
- Kartlar: `#26292f` (primary)
- Vurgu: `#1bd96a` (secondary)
- Başlık: `#ecf9fb` (textHeading)
- Yazı: `#b0bac5` (textPrimary)
- Daha fazlası için: `tailwind.config.js` ve `color_palet.html`

## 👾 Katkı Sağlamak İsteyenlere
- issue bırak, Kodlar açık, topluluk genç!
---

> DeveloperKubilay tarafından geliştirildi ❤️
