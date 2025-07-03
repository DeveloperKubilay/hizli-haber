import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo ve Açıklama */}
          <motion.div 
            className="col-span-1 md:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-4">
              <img src="/imgs/logo.png" alt="Hızlı Haber" className="h-10 w-auto mr-3" />
              <h3 className="text-2xl font-bold text-green-400">Hızlı Haber</h3>
            </div>
            <p className="text-gray-400 text-lg leading-relaxed mb-4">
              En hızlı ve güvenilir haber kaynağınız. Güncel haberleri anında takip edin.
            </p>
            <p className="text-gray-500">
              © 2025 Hızlı Haber. Tüm hakları saklıdır.
            </p>
          </motion.div>

          {/* Hızlı Linkler */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-xl font-bold mb-4 text-green-400">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Ana Sayfa</Link></li>
              <li><Link to="/haberler" className="text-gray-400 hover:text-white transition-colors">Haberler</Link></li>
              <li><Link to="/hizmet-sartlari" className="text-gray-400 hover:text-white transition-colors">Hizmet Şartları</Link></li>
            </ul>
          </motion.div>

          {/* İletişim */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-xl font-bold mb-4 text-green-400">İletişim</h4>
            <div className="space-y-3">
              <p className="text-gray-400 flex items-center">
                <Mail size={16} className="mr-2" />
                info@hizlihaber.com
              </p>
            </div>
          </motion.div>
        </div>

        {/* Alt Çizgi */}
        <motion.div 
          className="border-t border-gray-700 mt-8 pt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-gray-500">
            Hızlı Haber ile her zaman güncel kalın. 
            <span className="text-green-400 font-semibold"> En hızlı haber deneyimi!</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
