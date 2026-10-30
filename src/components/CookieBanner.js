import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('hizlihaber_cookie_consent');
      if (!consent) {
        // İlk yüklemede hafif gecikmeyle göster
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // LocalStorage kısıtlıysa sessizce geç
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('hizlihaber_cookie_consent', 'accepted');
    } catch (e) {}
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          aria-label="Çerez Bildirimi"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-gray-900/95 backdrop-blur-md border border-gray-700/60 text-white rounded-2xl shadow-2xl p-5"
        >
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-secondary/15 text-secondary flex-shrink-0">
              <Cookie size={24} />
            </div>

            <div className="flex-1 text-xs md:text-sm leading-relaxed text-gray-300">
              <p className="font-semibold text-white mb-1">
                Çerezler ve Veri Gizliliği
              </p>
              <p>
                Size en iyi haber deneyimini sunmak, site trafiğini analiz etmek ve yasal uyum için çerezlerden faydalanıyoruz. Detaylar için{' '}
                <Link
                  to="/hizmet-sartlari"
                  className="text-secondary hover:underline font-medium"
                >
                  Çerez Politikası ve KVKK Aydınlatma Metni
                </Link>
                'mizi inceleyebilirsiniz.
              </p>

              <div className="mt-4 flex items-center gap-2.5">
                <button
                  onClick={handleAccept}
                  className="bg-secondary hover:bg-secondaryHover text-black font-bold px-4 py-2 rounded-lg text-xs transition-colors"
                >
                  Kabul Ediyorum
                </button>
                <button
                  onClick={handleAccept}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg text-xs transition-colors"
                >
                  Gerekli Olanlar
                </button>
              </div>
            </div>

            <button
              onClick={handleAccept}
              aria-label="Kapat"
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export default CookieBanner;
