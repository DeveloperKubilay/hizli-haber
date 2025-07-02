import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
          title="İlk Başlık"
          description="Bu ilk kartın açıklama metnidir. Burada güzel bir açıklama yazısı bulunmakta."
          image="https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png"
          index={0}
        />
        
        <InfoCardReverse 
          title="İkinci Başlık"
          description="Bu ikinci kartın açıklama metnidir ve ters yönde görünmektedir. Solda resim sağda yazı."
          image="https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png"
          index={1}
        />
        
        <InfoCard 
          title="Üçüncü Başlık"
          description="Bu üçüncü ve son kartın açıklama metnidir. Yine normal düzende sağda resim solda yazı."
          image="https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png"
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