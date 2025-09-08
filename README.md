# [Hızlı Haber 🚀](https://hızlı-haber.com)
<p align="center">
  <img src="https://xn--hzl-haber-vpbc.com/imgs/logo.png" alt="Hızlı Haber Logo" />
</p>
<p align="center">
  <a href="https://hızlı-haber.com">https://hızlı-haber.com</a>
</p>

<p style="display: flex; gap: 10px; align-items: center;">
  <a href="https://dl.circleci.com/status-badge/redirect/gh/DeveloperKubilay/hizli-haber/tree/main" style="text-decoration: none;">
    <img src="https://dl.circleci.com/status-badge/img/gh/DeveloperKubilay/hizli-haber/tree/main.svg" alt="CircleCI" />
  </a>
  <a href="https://app.circleci.com/pipelines/github/DeveloperKubilay/hizli-haber?branch=main" style="text-decoration: none; color: inherit;">
    Circle CI
  </a>
</p>

# TR

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

# En

> The news platform for Gen Z. Forget boring news sites, this one’s made just for you! 😎

## ✨ Features
- **Real-time news**: The latest content, instantly in front of you!
- **AI-powered summaries**: Don’t waste time reading long articles—AI summarizes them for you.
- **Dark theme & modern UI**: Eye-friendly dark theme that vibes with Gen Z.
- **Mobile friendly**: Full performance on every device.
- **Categories & filters**: Instantly switch any category you’re tired of.
- **Login with Google**: No hassle creating accounts, just one-click login!
- **Save, like, comment**: Save your favorite news, like, and comment easily.
- **AI Chat**: Got any questions about the news? Chat with AI!

## 🛠️ Technologies
- **React** + **Tailwind CSS** + **Framer Motion**
- **Firebase** (Auth, Firestore, Storage)
- **Google Gemini AI** (Summarizing & image generation)
- **Node.js Backend** (Fetching news, AI processing)
- **AWS S3 / Cloudflare R2** (Image storage)
- **Lucide-react** (Icons)

## 📁 Project Structure
/ (root)
|-- backend/ # Node.js, AI, news fetching, image generation
|-- public/ # Static files, images, favicon
|-- src/ # React app, components, pages
|-- components/ # Navbar, Footer, Home, News, New, etc.
|-- pages/ # home, news, new, savednews, terms
|-- services/ # auth, firebase, categories, css
|-- color_palet.html # Color palette
|-- tailwind.config.js
|-- firestore.rules # Security rules

## 🚦 Security
- Protecting user data with Firestore rules
- Only logged-in users can add/update data
- Comments, likes, saves are user-specific

## 🤖 AI Prompt Rules
- Titles are clickbait but never fake, lots of emojis!
- Summaries are short, explanations in markdown and Gen Z style
- No humor in serious topics, full sincerity in fun stuff

## 🚀 How to Run?
1. `npm install` (in both root and backend folders)
2. Add Firebase and News API keys into `.env` file
3. For frontend: `npm start`
4. For backend: `node backend/index.js`

## 🎨 Color Palette
- Background: `#16181c` (tbackground)
- Main: `#1a1a1c` (background)
- Cards: `#26292f` (primary)
- Accent: `#1bd96a` (secondary)
- Heading: `#ecf9fb` (textHeading)
- Text: `#b0bac5` (textPrimary)
- For more: check `tailwind.config.js` and `color_palet.html`

## 👾 For Contributors
- Leave an issue, code is open, community is young!
---

> Developed with ❤️ by DeveloperKubilay

