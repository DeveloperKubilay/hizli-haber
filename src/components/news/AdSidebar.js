import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';


/*
  import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Lightbulb } from 'lucide-react';

function AdSidebar({ isMobile = false }) {
  return (

  );
}

export default AdSidebar;

  
  
  
  */

function AdSidebar({ isMobile = false }) {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const interestingFacts = [
    "🐜 Karıncalar kendi ağırlıklarının 50 katını kaldırabilir!",
    "🧠 İnsan beyni günde 70.000 düşünce üretir",
    "🌊 Okyanusların %95'i henüz keşfedilmedi",
    "⚡ Bir şimşek, güneşin yüzeyinden 5 kat daha sıcaktır",
    "🐙 Ahtapotların 3 kalbi ve mavi kanı vardır",
    "🌍 Dünya'da her saniye 100 şimşek çakar",
    "🦎 Gecko'lar tavanda yürüyebilir çünkü ayaklarında milyonlarca nano-kıl vardır",
    "🍯 Bal hiçbir zaman bozulmaz, 3000 yıllık bal bile yenilebilir",
    "🐧 Penguenler birbirlerini tanımak için özel sesler kullanır",
    "🦈 Köpekbalıkları dinozorlardan daha eski canlılardır",
    "🌙 Ay her yıl Dünya'dan 3.8 cm uzaklaşıyor",
    "🐨 Koalalar günde 22 saat uyur",
    "🦒 Zürafaların dili 45 cm uzunluğunda ve mavimsi renktedir",
    "🧬 İnsan DNA'sının %60'ı muzunkiyle aynıdır",
    "🐘 Filler birbirlerini kilometrelerce uzaktan duyabilir",
    "🕷️ Örümcek ağı çelikten 5 kat daha güçlüdür",
    "🦋 Kelebeklerin ayaklarında tat alma duyuları vardır",
    "🐳 Mavi balinalar kalbi bir araba büyüklüğündedir",
    "❄️ Kar tanelerinin her biri benzersizdir",
    "🌞 Güneş her saniye 4 milyon ton kütlesini kaybeder"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % interestingFacts.length);
    }, 5000); // Her 5 saniyede bir değişir

    return () => clearInterval(interval);
  }, [interestingFacts.length]);
  return (
    <>
      {/*<motion.div
        className={`${isMobile ? 'w-full' : 'w-[250px] sm:w-[280px] md:w-[320px]'} flex-shrink-0`}
        initial={{ opacity: 0, [isMobile ? 'y' : 'x']: isMobile ? 30 : -100 }}
        animate={{ opacity: 1, [isMobile ? 'y' : 'x']: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
      >
        <div className={`bg-primary p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg ${!isMobile ? 'sticky top-6' : ''}`}>
          <div className="text-center text-textPrimary">
            
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Megaphone size={isMobile ? 18 : 22} className="text-textHeading" />
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-textHeading">Reklam Alanı</h3>
            </div>
            <div className={`bg-primaryBG rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 ${isMobile ? 'min-h-[100px] sm:min-h-[120px]' : 'min-h-[200px] sm:min-h-[250px] md:min-h-[300px]'} flex items-center justify-center`}>
              <p className="text-textPrimary text-xs sm:text-sm md:text-base">Buraya reklam gelecek!</p>
            </div>
          </div>
        </div>
      </motion.div>*/}

      <motion.div
        className={`${isMobile ? 'w-full mt-4' : 'w-[250px] sm:w-[280px] md:w-[320px] mt-6'} flex-shrink-0`}
        initial={{ opacity: 0, [isMobile ? 'y' : 'x']: isMobile ? 30 : -100 }}
        animate={{ opacity: 1, [isMobile ? 'y' : 'x']: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
      >
        <div className={`bg-primary p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-lg ${!isMobile ? 'sticky top-6' : ''}`}>
          <div className="text-center text-textPrimary">
            <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
              <Lightbulb size={isMobile ? 18 : 22} className="text-yellow-400" />
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-textHeading">Biliyor muydun?</h3>
            </div>

            <motion.div
              key={currentFactIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className={`bg-primaryBG rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 ${isMobile ? 'min-h-[120px] sm:min-h-[150px]' : 'min-h-[200px] sm:min-h-[250px] md:min-h-[280px]'} flex items-center justify-center`}
            >
              <p className="text-textPrimary text-sm sm:text-base md:text-lg font-medium leading-relaxed text-center">
                {interestingFacts[currentFactIndex]}
              </p>
            </motion.div>

            <div className="flex justify-center mt-4 gap-1">
              {interestingFacts.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${index === currentFactIndex ? 'bg-textHeading' : 'bg-textPrimary opacity-30'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default AdSidebar;

