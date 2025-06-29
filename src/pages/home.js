import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Compass, Newspaper } from "lucide-react";
import { motion } from "framer-motion";
import { ProductTicker, ProductTickerReverse } from '../components/home/showCase';
import { InfoCard, InfoCardReverse } from '../components/home/InfoCard';
import Footer from '../components/Footer';

function Home() {
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const productTickerRef = useRef(null);
  const welcomeContainerRef = useRef(null);
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
        const productTickerTop = productTickerRef.current.offsetTop;
        welcomeContainerRef.current.style.height = `${productTickerTop}px`;
      }
    };

    const timer = setTimeout(adjustWelcomeContainerHeight, 100);
    
    const handleResize = () => {
      clearTimeout(timer);
      setTimeout(adjustWelcomeContainerHeight, 50);
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentMsgIndex(prev => (prev + 1) % 3);
    }, 3000);

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
      <div className="max-w-6xl mx-auto py-8 sm:px-6 lg:px-8 relative"> {/* 🔥 Container'ı daralttım ama padding'i arttırdım */}
        <div className="space-y-10"> {/* 🔥 Space artırıldı */}
          <div>
            <div className="flex flex-col justify-center items-center w-full my-6"> {/* 🔥 Margin artırıldı */}
              <motion.img
                src="/imgs/logo.png"
                alt="Blog Header"
                className="rounded-xl shadow-xl max-h-72 object-cover mb-6"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              <motion.h1
                className="text-center mt-3 text-textHeading text-6xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <span className="font-bold">Burası aradığın haberin</span>
                <br />  
                <span
                  className={`${msgs[currentMsgIndex].color} transition-colors duration-700 ease-in-out text-6xl font-bold`}
                >
                  {msgs[currentMsgIndex].text}
                </span>
                <br />
                <span className="text-textPrimary text-xl mt-2 block">
                  İnsanların en hızlı şekilde haberi aldığı platformumuz ile <span className="text-red-500 font-bold">1000+</span> fazla içeriğe göz atın
                </span>

                <div className='flex flex-wrap justify-center gap-5 mt-10'>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='text-black cursor-pointer text-lg bg-secondary hover:bg-secondaryHover hover:font-extrabold px-7 py-4 rounded-full font-bold flex items-center gap-3 shadow-xl'
                  >
                    <Compass className="h-6 w-6 mr-1" />
                    Son haber
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='border-2 cursor-pointer text-base border-textPrimary hover:border-textHeading px-5 py-3 rounded-full flex items-center gap-2 shadow-lg'
                  >
                    <Newspaper className="h-5 w-5 mr-1" />
                    Tüm Haberler
                  </motion.a>
                </div>
                <br />
              </motion.h1>
            </div>
          </div>
        </div>
      </div>
      <div ref={productTickerRef}>
        <ProductTicker />
      </div>
      <div className="py-2">
        <ProductTickerReverse />
      </div>
      <div className="py-2">
        <ProductTicker />
      </div>
      <div className="text-center py-8 mb-20">
        <h2 className="text-4xl font-bold text-textHeading">
          Merhaba
        </h2>
        <p className="text-lg text-gray-500 mt-3">
          evet burası bir merhaba mesajıdır
        </p>
      </div>
      
      {/* Info Cards Section */}
      <div className="max-w-6xl mx-auto px-6 bg-transparent">
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
      
      {/* Siyah Section */}
      <div className="w-full h-[600px] bg-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* Arka plan resmi */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png" 
          alt="Test"
          className="absolute inset-0 w-full h-full object-contain opacity-30"
          style={{
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
          }}
        />
        
        <div className="relative z-10 text-center px-8 max-w-4xl">
          <p className="text-white text-6xl font-bold mb-4">
            Daha fazlası için
          </p>
          <p className="text-green-400 text-7xl font-bold mb-8">
            Hızlı Haber
          </p>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-base transition-colors duration-300 shadow-lg"
          >
            Siteyi Ziyaret Et
          </motion.button>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Home;