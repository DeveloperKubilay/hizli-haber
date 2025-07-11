import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet';

// Home Components
import HeroSection from '../components/home/HeroSection';
import ActionButtons from '../components/home/ActionButtons';
import TickerSection from '../components/home/TickerSection';
import { InfoCard, InfoCardReverse } from '../components/home/InfoCard';
import CallToAction from '../components/home/CallToAction';

function Home() {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const productTickerRef = useRef(null);
  const welcomeContainerRef = useRef(null);
  const infoCardsRef = useRef(null);
  const merhabaRef = useRef(null);
  const intervalRef = useRef(null);

  const msgs = [{
    text: "en hızlısı",
    color: "text-orange-400"
  },
  {
    text: "en güveniliri",
    color: "text-blue-400"
  },
  {
    text: "en çok okunanı",
    color: "text-green-400"
  }];

  useEffect(() => {
    const adjustWelcomeContainerHeight = () => {
      if (productTickerRef.current && welcomeContainerRef.current) {
        const tickerRect = productTickerRef.current.getBoundingClientRect();
        const tickerBottom = tickerRect.bottom + window.scrollY;
        welcomeContainerRef.current.style.height = `${tickerBottom}px`;
      }
    };

    const timer = setTimeout(adjustWelcomeContainerHeight, 100);

    const handleResize = () => {
      clearTimeout(timer);
      setTimeout(adjustWelcomeContainerHeight, 50);
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('scroll', adjustWelcomeContainerHeight, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', adjustWelcomeContainerHeight);
    };
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentMsgIndex(prev => (prev + 1) % 3);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <Helmet>
        <title>Hızlı Haber</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#16181c" />
        <meta name="msapplication-navbutton-color" content="#16181c" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="description" content="Hızlı Haber - Yeni nesil haberler! En güncel haberleri hızlı ve kolay bir şekilde takip et. Türkiye ve dünya gündeminden anında haberdar ol." />
        <meta name="keywords" content="haber, hızlı haber, son dakika, gündem, Türkiye haberleri, dünya haberleri, ekonomi, spor, magazin, teknoloji, politika, güncel, sıcak gelişme, flaş haber, haber sitesi, online haber, mobil haber, haber oku, haber uygulaması, haber platformu, haber portalı, haberler, güncel haberler, son dakika haberleri, popüler haberler, trend haberler, haber başlıkları, haber özetleri, haber analizi, haber takip, haber paylaş, haber yorum, haber video, haber fotoğraf, haber arşivi, haber kaynağı, haber sitesi öneri, haber sitesi tavsiye, haber sitesi en iyi, haber sitesi güvenilir, haber sitesi hızlı, haber sitesi mobil, haber sitesi ücretsiz, haber sitesi güncel, haber sitesi popüler, haber sitesi trend, haber sitesi son dakika, haber sitesi gündem, haber sitesi ekonomi, haber sitesi spor, haber sitesi magazin, haber sitesi teknoloji, haber sitesi politika, haber sitesi sıcak gelişme, haber sitesi flaş haber, haber sitesi online, haber sitesi mobil, haber sitesi oku, haber sitesi uygulama, haber sitesi platform, haber sitesi portal, haber sitesi haberler, haber sitesi güncel haberler, haber sitesi son dakika haberleri, haber sitesi popüler haberler, haber sitesi trend haberler, haber sitesi başlıkları, haber sitesi özetleri, haber sitesi analizi, haber sitesi takip, haber sitesi paylaş, haber sitesi yorum, haber sitesi video, haber sitesi fotoğraf, haber sitesi arşivi, haber sitesi kaynağı" />
        <meta property="og:title" content="Hızlı Haber - Yeni nesil Haberler" />
        <meta property="og:description" content="Yeni nesil Haberler, Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri ve daha fazlası Hızlı Haber'de!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://hizlihaber.com" />
        <meta property="og:image" content="https://hizlihaber.com/favicon.ico" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Hızlı Haber - Yeni nesil Haberler" />
        <meta name="twitter:description" content="Yeni nesil Haberler, Türkiye ve dünyadan en güncel haberler, son dakika gelişmeleri ve daha fazlası Hızlı Haber'de!" />
        <meta name="twitter:image" content="https://hizlihaber.com/favicon.ico" />
        <meta name="author" content="Hızlı Haber Ekibi" />
        <link rel="canonical" href="https://hizlihaber.com/" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
        <meta name="google-signin-client_id" content="866369173209-9ridifjkd5a7v3kl8hb8g0j9hucn93q4.apps.googleusercontent.com" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
      </Helmet>
      <Navbar />
      <div ref={welcomeContainerRef} className="Welcome_container"></div>
      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8 relative">
        <div className="space-y-10">
          <div>
            <HeroSection currentMsgIndex={currentMsgIndex} msgs={msgs} />
            <ActionButtons />
          </div>
        </div>
      </div>

      <div ref={productTickerRef} className="mt-8">
        <TickerSection />
      </div>

      <div className="text-center py-8 mb-20">
        <h2 ref={merhabaRef} className="text-4xl font-bold text-textHeading">
          En Hızlı Haber Platformu
        </h2>
        <p className="text-lg text-gray-500 mt-3">
          Türkiye'nin en hızlı haberi buradan bulabilirsiniz!<br /> Dakikalar içinde güncel gelişmeler, son dakika haberleri ve dünyadan önemli olaylar
        </p>
      </div>

      {/* Info Cards Section */}
      <div ref={infoCardsRef} className="max-w-6xl mx-auto px-6 bg-transparent mb-12">
        <InfoCard
          title="Zamanınız mı kısıtlı? Özetleri tercih edin!"
          description="Haberleri baştan sona okumak zorunda değilsiniz. Yan tarafta sunduğumuz özetlerle zamandan tasarruf edin ve sadece önemli bilgilere odaklanın!"
          image="/imgs/home/ozet.png"
          index={0}
        />

        <InfoCardReverse
          title="Haberleri anlamak hiç bu kadar kolay olmamıştı!"
          description="Tüm içeriğimiz kolay okunabilir ve eğlenceli şekilde hazırlanmıştır. Önemli noktaları özel olarak vurguluyoruz, böylece haberleri daha hızlı kavrayabilirsiniz."
          image="/imgs/home/kolaylık.png"
          index={1}
        />

        <InfoCard
          title="Yapay zeka ile güçlendirilmiş habercilik"
          description="Aklınıza takılan sorular mı var? Yapay zeka destekli haberlerimizle sorularınıza anında yanıt alın ve güncel gelişmeleri kesintisiz takip edin!"
          image="/imgs/home/ai_destek.png"
          index={2}
        />
      </div>

      {/* Alt boşluk */}
      <div className="h-20 bg-transparent"></div>

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;